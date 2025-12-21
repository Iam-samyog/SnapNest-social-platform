from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Image, Comment
from .serializers import ImageSerializer, CommentSerializer
from actions.utils import create_action
import redis
from django.conf import settings

# Singleton Redis connection - reuse across all requests
_redis_connection = None

def get_redis_connection():
    """Get or create a singleton Redis connection"""
    global _redis_connection
    if _redis_connection is None:
        _redis_connection = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True  # Automatically decode responses to strings
        )
    return _redis_connection

r = get_redis_connection()


class ImageViewSet(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Optimize queries with select_related and prefetch_related
        queryset = Image.objects.select_related('user', 'user__profile').prefetch_related(
            'users_like',
            'comments__user__profile'
        )
        username = self.request.query_params.get('user', None)
        if username is not None:
            queryset = queryset.filter(user__username=username)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count in Redis
        total_views = r.incr(f'image:{instance.id}:views')
        r.zincrby('image_ranking', 1, instance.id)
        serializer = self.get_serializer(instance)
        # Add view count to response (already an int with decode_responses=True)
        data = serializer.data
        data['total_views'] = int(total_views) if total_views else 0
        return Response(data)

    def perform_create(self, serializer):
        if 'url' in self.request.data and not self.request.data.get('image'):
            # Download image from URL
            import requests
            from django.core.files.base import ContentFile
            from django.utils.text import slugify
            
            image_url = self.request.data['url']
            try:
                # Add a timeout and ensure we follow redirects
                response = requests.get(
                    image_url, 
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'},
                    timeout=10,
                    allow_redirects=True
                )
                response.raise_for_status()
                
                # Get file extension or default to .jpg
                ext = 'jpg'
                content_type = response.headers.get('content-type', '')
                if 'image/' in content_type:
                    ext = content_type.split('/')[-1]
                
                title = self.request.data.get('title', 'image')
                file_name = f"{slugify(title)}.{ext}"
                
                serializer.save(
                    user=self.request.user, 
                    image=ContentFile(response.content, name=file_name)
                )
            except requests.exceptions.Timeout:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"url": "This image could not be bookmarked, sorry."})
            except Exception as e:
                from rest_framework.exceptions import ValidationError
                print(f"Error downloading image from {image_url}: {str(e)}")
                raise ValidationError({"url": "This image could not be bookmarked, sorry."})
        else:
            serializer.save(user=self.request.user)
            
        create_action(self.request.user, 'uploaded image', serializer.instance)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own images")
        instance.delete()

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        image = self.get_object()
        if request.user in image.users_like.all():
            # Already liked, so unlike
            image.users_like.remove(request.user)
            image.total_likes = image.users_like.count()
            image.save()
            return Response({'status': 'unliked', 'liked': False})
        else:
            # Not liked, so like
            image.users_like.add(request.user)
            image.total_likes = image.users_like.count()
            image.save()
            create_action(request.user, 'likes', image)
            return Response({'status': 'liked', 'liked': True})

    @action(detail=True, methods=['post'])
    def unlike(self, request, pk=None):
        image = self.get_object()
        if request.user in image.users_like.all():
            image.users_like.remove(request.user)
            image.total_likes = image.users_like.count()
            image.save()
            return Response({'status': 'unliked', 'liked': False})
        return Response({'status': 'already_unliked', 'liked': False})

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        image = self.get_object()
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, image=image)
        create_action(request.user, 'commented on', image)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def views(self, request, pk=None):
        """Get view count from Redis"""
        image = self.get_object()
        total_views = r.get(f'image:{image.id}:views')
        if total_views is None:
            total_views = 0
        else:
            total_views = int(total_views)  # Already decoded with decode_responses=True
        return Response({'total_views': total_views})

    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Increment view count in Redis"""
        image = self.get_object()
        total_views = r.incr(f'image:{image.id}:views')
        r.zincrby('image_ranking', 1, image.id)
        return Response({'total_views': int(total_views) if total_views else 0})

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Image, Comment
from .serializers import ImageSerializer, CommentSerializer
from actions.utils import create_action
import redis
from django.conf import settings

r = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB
)


class ImageViewSet(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Image.objects.all()
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
        # Add view count to response
        data = serializer.data
        data['total_views'] = total_views
        return Response(data)

    def perform_create(self, serializer):
        if 'url' in self.request.data and not self.request.data.get('image'):
            # Download image from URL
            import requests
            from django.core.files.base import ContentFile
            from django.utils.text import slugify
            
            image_url = self.request.data['url']
            try:
                response = requests.get(image_url, headers={'User-Agent': 'Mozilla/5.0'})
                response.raise_for_status()
                
                # Get file extension or default to .jpg
                ext = 'jpg'
                if 'content-type' in response.headers:
                    ext = response.headers['content-type'].split('/')[-1]
                
                file_name = f"{slugify(self.request.data.get('title', 'image'))}.{ext}"
                
                serializer.save(
                    user=self.request.user, 
                    image=ContentFile(response.content, name=file_name)
                )
            except Exception as e:
                from rest_framework.exceptions import ValidationError
                print(f"Error downloading image: {e}")
                raise ValidationError({"url": f"Failed to download image: {str(e)}"})
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
            total_views = int(total_views)
        return Response({'total_views': total_views})

    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Increment view count in Redis"""
        image = self.get_object()
        total_views = r.incr(f'image:{image.id}:views')
        r.zincrby('image_ranking', 1, image.id)
        return Response({'total_views': total_views})

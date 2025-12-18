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
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        image = serializer.save(user=self.request.user)
        create_action(self.request.user, 'uploaded image', image)

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

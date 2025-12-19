from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from images.models import Image
from .models import Action
from .serializers import ActionSerializer

User = get_user_model()

class ActionListApiView(generics.ListAPIView):
    serializer_class = ActionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get actions from users the current user follows
        following_ids = self.request.user.rel_from_set.values_list('user_to_id', flat=True)
        # Include current user's actions as well? Usually good for feedback
        queryset = Action.objects.filter(user_id__in=list(following_ids) + [self.request.user.id])
        
        # Prefetch user and profile to avoid N+1 issues
        queryset = queryset.select_related('user', 'user__profile')
        
        return queryset[:10]  # Limit to 10 for the story-like horizontal scroll

class ImageLikeApiView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        image = get_object_or_404(Image, id=id)
        action, created = Action.objects.get_or_create(
            user=request.user, verb='likes', target=image
        )
        if not created:
            action.delete()
            return Response({'liked': False}, status=status.HTTP_200_OK)
        return Response({'liked': True}, status=status.HTTP_201_CREATED)

class UserFollowApiView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        user = get_object_or_404(User, id=id)
        if request.user == user:
            return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.following.add(user)
        return Response({'followed': True}, status=status.HTTP_200_OK)
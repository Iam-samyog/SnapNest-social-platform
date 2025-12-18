from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Profile, Contact
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ProfileSerializer
)

User = get_user_model()


# 🔹 User List & Detail
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['post'])
    def follow(self, request, pk=None):
        user_to_follow = self.get_object()
        if user_to_follow == request.user:
            return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        contact, created = Contact.objects.get_or_create(
            user_from=request.user,
            user_to=user_to_follow
        )
        if not created:
            # Already following, so unfollow
            contact.delete()
            # Refresh from database to get updated count
            user_to_follow.refresh_from_db()
            return Response({
                'status': 'unfollowed', 
                'following': False,
                'followers_count': user_to_follow.followers.count()
            })
        # Refresh from database to get updated count
        user_to_follow.refresh_from_db()
        return Response({
            'status': 'followed', 
            'following': True,
            'followers_count': user_to_follow.followers.count()
        })

    @action(detail=True, methods=['post'])
    def unfollow(self, request, pk=None):
        user_to_unfollow = self.get_object()
        deleted = Contact.objects.filter(
            user_from=request.user,
            user_to=user_to_unfollow
        ).delete()
        if deleted[0] > 0:
            # Refresh from database to get updated count
            user_to_unfollow.refresh_from_db()
            return Response({
                'status': 'unfollowed', 
                'following': False,
                'followers_count': user_to_unfollow.followers.count()
            })
        # Refresh from database to get updated count
        user_to_unfollow.refresh_from_db()
        return Response({
            'status': 'already_unfollowed', 
            'following': False,
            'followers_count': user_to_unfollow.followers.count()
        })


# 🔹 Register API
class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# 🔹 Profile Update API
class ProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile

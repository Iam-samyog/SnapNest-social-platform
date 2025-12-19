from rest_framework import viewsets, generics, status, views
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

# New imports for password reset
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()


# 🔹 User List & Detail
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    # queryset = User.objects.filter(is_active=True) # Removed static queryset
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.filter(is_active=True)
        username = self.request.query_params.get('username', None)
        if username is not None:
            queryset = queryset.filter(username=username)
        return queryset

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


# 🔹 Password Reset Request API
class PasswordResetRequestAPIView(views.APIView):
    authentication_classes = [] # Allow unauthenticated access
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        users = User.objects.filter(email=email)
        if not users.exists():
            # Don't reveal user existence
            return Response({'message': 'If an account exists with this email, a reset link has been sent.'})
        
        for user in users:
            if not user.is_active:
                continue
                
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)
            
            # Hardcoded frontend URL for now
            frontend_url = "http://localhost:3000" 
            reset_link = f"{frontend_url}/password-reset/{uid}/{token}"
            
            send_mail(
                'Password Reset Request',
                f'Click the following link to reset your password for user {user.username}: {reset_link}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        
        return Response({'message': 'If an account exists with this email, a reset link has been sent.'})


# 🔹 Password Reset Confirm API
class PasswordResetConfirmAPIView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')
        
        if not uid or not token or not password:
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid link'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(password)
        user.save()
        
        return Response({'message': 'Password has been reset successfully'})

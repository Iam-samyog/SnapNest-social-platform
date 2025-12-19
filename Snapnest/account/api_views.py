from rest_framework import viewsets, generics, status, views
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from typing import Optional
from .models import Profile, Contact
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ProfileSerializer
)
from actions.utils import create_action
from django.shortcuts import get_object_or_404

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
    lookup_field = 'username'

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
    def follow(self, request, username=None):
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
            return Response({
                'status': 'unfollowed', 
                'following': False,
                'followers_count': user_to_follow.rel_to_set.count()
            })
        
        create_action(request.user, 'is following', user_to_follow)
        return Response({
            'status': 'followed', 
            'following': True,
            'followers_count': user_to_follow.rel_to_set.count()
        })

    @action(detail=True, methods=['post'])
    def unfollow(self, request, username=None):
        user_to_unfollow = self.get_object()
        deleted = Contact.objects.filter(
            user_from=request.user,
            user_to=user_to_unfollow
        ).delete()
        
        return Response({
            'status': 'unfollowed', 
            'following': False,
            'followers_count': user_to_unfollow.rel_to_set.count()
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


# ... existing code ...
from rest_framework_simplejwt.tokens import RefreshToken
from social_django.utils import psa

# ... existing code ...

class FollowToggleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        target_user = get_object_or_404(User, username=username)
        # Prevent self follow
        if request.user == target_user:
             return Response({'error': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        contact, created = Contact.objects.get_or_create(user_from=request.user, user_to=target_user)
        
        if not created:
            # Already following, so unfollow
            contact.delete()
            return Response({
                'status': 'unfollowed',
                'following': False,
                'followers_count': target_user.rel_to_set.count()
            })
        
        create_action(request.user, 'is following', target_user)
        return Response({
            'status': 'followed',
            'following': True,
            'followers_count': target_user.rel_to_set.count()
        })


class SocialLoginAPIView(APIView):
    permission_classes = [AllowAny]

    @psa('social:complete')
    def post(self, request, backend):
        """
        Exchange an access_token (Google) or code (GitHub) for a JWT.
        """
        token = request.data.get('access_token')
        code = request.data.get('code')

        if not token and not code:
            return Response({'error': 'No access token or code provided.'}, status=status.HTTP_400_BAD_REQUEST)

        user = None
        try:
            if code:
                # For authorization code flow (like GitHub)
                # We need to manually perform the code exchange if the strategy doesn't handle it entirely via state 
                # (which custom API doesn't usually have)
                # However, python-social-auth's `auth_complete` is designed to handle this if request parameters are present.
                # But here we have them in JSON body/request.data, not GET parameters.
                # simpler approach: let the backend exchange the code.
                
                # Note: `request.backend` is injected by @psa
                # For GitHub, we can force the exchange if we have the code.
                user = request.backend.auth_complete(user=None) 
                # auth_complete usually expects args in request.GET/POST. 
                # We might need to mock that or use lower level methods.
                # Since we are in a custom view, let's try a direct exchange if auth_complete fails or for clarity.
                pass
            
            if not user and token:
                user = request.backend.do_auth(token)
            
            # If we still don't have a user, and we have a code, let's try manual exchange if generic auth_complete didn't work
            if not user and code:
                # This is backend specific, but generally:
                try:
                    # auth_complete relies on query params. Let's monkeypatch or ensure query params exist?
                    # Or just use the backend's request_access_token if available.
                    # GitHub backend has `auth_complete` which calls `request_access_token`.
                    # Let's try to pass the code directly if possible.
                    # It seems `do_auth` with a code is NOT standard for all backends.
                    
                    # Safer fallback for DRF integration:
                    # For GitHub, we can just put 'code' into request.GET or request.POST to satisfy auth_complete
                    # But request is immutable.
                    # Let's assume for now we use 'access_token' for Google (Client Side) 
                    # and for GitHub we might need to handle it. 
                    # Actually, for GitHub, if we just send the `code` as `access_token` parameter 
                    # SOME strategies/backends handle it, but standard OAuth2 expects a token.
                    
                    # Let's stick to: Google sends access_token. GitHub sends code.
                    # If code:
                    if backend == 'github':
                        # Manual exchange
                         response = request.backend.request_access_token(code)
                         # response is usually a dict or string depending on backend
                         if isinstance(response, dict) and 'access_token' in response:
                             access_token = response['access_token']
                             user = request.backend.do_auth(access_token)
                         else:
                             # Some backends return bytes or text
                             pass
            
            # If implicit flow or we got token
            if user:
                 if not user.is_active:
                     return Response({'error': 'User account is disabled.'}, status=status.HTTP_400_BAD_REQUEST)

                 refresh = RefreshToken.for_user(user)
                 return Response({
                     'access': str(refresh.access_token),
                     'refresh': str(refresh),
                     'user': UserSerializer(user).data
                 })
            else:
                 return Response({'error': 'Authentication failed.'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
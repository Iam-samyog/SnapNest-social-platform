import os
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

    @action(detail=True, methods=['get'])
    def followers(self, request, username=None):
        user = self.get_object()
        # Get users who follow this user (user_from in Contact where user_to=user)
        followers_contacts = user.rel_to_set.all()
        follower_users = [contact.user_from for contact in followers_contacts]
        serializer = UserSerializer(follower_users, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def following(self, request, username=None):
        user = self.get_object()
        # Get users this user follows (user_to in Contact where user_from=user)
        following_contacts = user.rel_from_set.all()
        following_users = [contact.user_to for contact in following_contacts]
        serializer = UserSerializer(following_users, many=True, context={'request': request})
        return Response(serializer.data)


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
            
            # Use configured frontend URL or default to localhost:5173 for dev
            frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
            reset_link = f"{frontend_url}/password-reset/{uid}/{token}"
            
            try:
                send_mail(
                    'Password Reset Request',
                    f'Click the following link to reset your password for user {user.username}: {reset_link}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending email: {e}")
                return Response({'error': 'Failed to send email. Please check server configuration.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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
        import traceback
        try:
            token = request.data.get('access_token')
            code = request.data.get('code')

            # ... (rest of logic)
            if not token and not code:
                return Response({'error': 'No access token or code provided.'}, status=status.HTTP_400_BAD_REQUEST)

            user = None
            
            if code:
                # GitHub flow
                # For GitHub, we attempt to use the code to fetch the access_token
                # The python-social-auth backend might expect 'code' in query params,
                # so we might need to manually call `request_access_token`
                try:
                    if backend == 'github':
                        resp = request.backend.request_access_token(code)
                        # resp is usually a dict: {'access_token': '...', 'scope': '...', 'token_type': 'bearer'}
                        if isinstance(resp, dict) and 'access_token' in resp:
                            token = resp['access_token']
                            # Now continue as if we had a token
                            user = request.backend.do_auth(token)
                        else:
                             print(f"GitHub Token Exchange Failed. Response: {resp}")
                             return Response({'error': 'GitHub token exchange failed'}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        # Fallback for other code-based backends if any
                        user = request.backend.auth_complete()
                except Exception as e:
                     print(f"Code Exchange Error: {str(e)}")
                     traceback.print_exc()
                     return Response({'error': f'Code exchange failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

            elif token:
                # Google flow (Implicit/Client-side)
                try:
                    user = request.backend.do_auth(token)
                except Exception as e:
                    print(f"Token Auth Error: {str(e)}")
                    traceback.print_exc()
                    return Response({'error': f'Token auth failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
            
            if user:
                 if not user.is_active:
                     return Response({'error': 'User account is disabled.'}, status=status.HTTP_400_BAD_REQUEST)

                 refresh = RefreshToken.for_user(user)
                 
                 # Create profile if not exists (safety net)
                 Profile.objects.get_or_create(user=user)

                 return Response({
                     'access': str(refresh.access_token),
                     'refresh': str(refresh),
                     'user': UserSerializer(user).data
                 })
            else:
                 return Response({'error': 'Authentication failed. User could not be created or found.'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Social Login Critical Error: {str(e)}")
            traceback.print_exc()
            return Response({'error': 'Internal Server Error during Social Login'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
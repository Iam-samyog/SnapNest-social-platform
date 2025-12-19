from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Contact

User = get_user_model()


class SimpleProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['photo', 'date_of_birth']


class UserSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_following', 'followers_count', 'following_count', 'profile']
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Contact.objects.filter(
                user_from=request.user,
                user_to=obj
            ).exists()
        return False
    
    def get_followers_count(self, obj):
        # Use Contact model's reverse relationship instead of removed 'followers' field
        return obj.rel_to_set.count()
    
    def get_following_count(self, obj):
        # Use Contact model's reverse relationship instead of removed 'following' field
        return obj.rel_from_set.count()

    def get_profile(self, obj):
        if hasattr(obj, 'profile'):
            return SimpleProfileSerializer(obj.profile, context=self.context).data
        return None


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['date_of_birth', 'photo', 'user', 'followers_count', 'following_count']
    
    def get_followers_count(self, obj):
        # Use Contact model's reverse relationship instead of removed 'followers' field
        return obj.user.rel_to_set.count()
    
    def get_following_count(self, obj):
        # Use Contact model's reverse relationship instead of removed 'following' field
        return obj.user.rel_from_set.count()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        Profile.objects.get_or_create(user=user)
        return user

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model=Contact
        fields=['user_from','user_to','created']
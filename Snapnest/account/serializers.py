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
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_following', 'followers_count', 'following_count', 'posts_count', 'profile']
    
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

    def get_posts_count(self, obj):
        return obj.images_created.count()

    def get_profile(self, obj):
        if hasattr(obj, 'profile'):
            return SimpleProfileSerializer(obj.profile, context=self.context).data
        return None


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['date_of_birth', 'photo', 'user', 'first_name', 'last_name', 'email', 'followers_count', 'following_count', 'posts_count']
    
    def get_followers_count(self, obj):
        # Use Contact model's reverse relationship instead of removed 'followers' field
        return obj.user.rel_to_set.count()
    
    def get_following_count(self, obj):
        # Use Contact model's reverse relationship instead of removed 'following' field
        return obj.user.rel_from_set.count()

    def get_posts_count(self, obj):
        return obj.user.images_created.count()

    def validate_email(self, value):
        user = self.instance.user if self.instance else None
        if User.objects.filter(email=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError("Another user is already using this email.")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        
        # Update User fields if any are present
        user = instance.user
        if user_data:
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        # Update Profile fields
        return super().update(instance, validated_data)


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
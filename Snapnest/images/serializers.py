from rest_framework import serializers
from .models import Image, Comment


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_photo = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'user_photo', 'body', 'created']
    
    def get_user_photo(self, obj):
        try:
            if obj.user.profile.photo:
                return obj.user.profile.photo.url
        except:
            pass
        return None


class ImageSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_photo = serializers.SerializerMethodField()
    total_likes = serializers.IntegerField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    total_views = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = [
            'id',
            'title',
            'slug',
            'url',
            'image',
            'description',
            'created',
            'user',
            'user_photo',
            'total_likes',
            'comments',
            'is_liked',
            'total_views'
        ]
        extra_kwargs = {
            'image': {'required': False},
            'url': {'required': False}
        }
    
    def get_user_photo(self, obj):
        try:
            if obj.user.profile.photo:
                return obj.user.profile.photo.url
        except:
            pass
        return None
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.users_like.all()
        return False
    
    def get_total_views(self, obj):
        try:
            import redis
            from django.conf import settings
            r = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB
            )
            views = r.get(f'image:{obj.id}:views')
            if views is None:
                return 0
            return int(views)
        except:
            return 0

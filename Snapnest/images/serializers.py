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
            'uuid',
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
            # Use prefetched data if available to avoid extra query
            if hasattr(obj, '_prefetched_objects_cache') and 'users_like' in obj._prefetched_objects_cache:
                return request.user in obj.users_like.all()
            return request.user in obj.users_like.all()
        return False
    
    def get_total_views(self, obj):
        # First check if we have the view count in a temporary attribute (set by batch fetch in ViewSet)
        if hasattr(obj, '_redis_views'):
            return obj._redis_views
            
        try:
            # Fallback to individual fetch if not batched (e.g. single object retrieve)
            from .api_views import r
            # We still use .id for internal Redis key stability
            views = r.get(f'image:{obj.id}:views')
            if views is None:
                return 0
            return int(views)
        except:
            return 0

from rest_framework import serializers, viewsets
from .models import Image

class ImageSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = Image
        fields = ['id', 'title', 'slug', 'url', 'image', 'description', 'created', 'user', 'users_like', 'total_likes']

class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
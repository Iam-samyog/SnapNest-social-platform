from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Action
from account.serializers import UserSerializer

User = get_user_model()

class ActionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Action
        fields = ['id', 'user', 'verb', 'created']

from django.urls import path
from .api import ImageLikeApiView, UserFollowApiView, ActionListApiView

urlpatterns = [
    path('images/<int:id>/like/', ImageLikeApiView.as_view(), name='image_like'),
    path('users/<int:id>/follow/', UserFollowApiView.as_view(), name='user_follow'),
    path('actions/', ActionListApiView.as_view(), name='action_list'),
]
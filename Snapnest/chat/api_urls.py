from django.urls import path
from .api_views import MessageListView

urlpatterns = [
    path('messages/<int:other_user_id>/', MessageListView.as_view(), name='message-list'),
]

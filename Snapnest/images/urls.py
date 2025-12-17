from django.urls import path
from .import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import ImageViewSet

app_name='images'
router = DefaultRouter()
router.register(r'images', ImageViewSet)

urlpatterns=[
    path('create/',views.image_create,name='create'),
    path('upload/',views.image_upload,name='upload'),
    path('detail/<int:id>/<slug:slug>/',views.image_detail,name='detail'),
    path('detail/<int:id>/<slug:slug>/edit/',views.image_edit,name='edit'),
    path('detail/<int:id>/<slug:slug>/delete/',views.image_delete,name='delete'),
    path('like/',views.image_like,name='like'),
    path('',views.image_list,name='list'),
    path('ranking/',views.image_ranking,name='ranking'),
    path('', include(router.urls)),
]

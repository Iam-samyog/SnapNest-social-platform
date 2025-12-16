from django.urls import path
from .import views

app_name='images'

urlpatterns=[
    path('create/',views.image_create,name='create'),
    path('upload/',views.image_upload,name='upload'),
    path('detail/<int:id>/<slug:slug>/',views.image_detail,name='detail'),
    path('detail/<int:id>/<slug:slug>/edit/',views.image_edit,name='edit'),
    path('detail/<int:id>/<slug:slug>/delete/',views.image_delete,name='delete'),
    path('like/',views.image_like,name='like'),
    path('',views.image_list,name='list'),
    path('ranking/',views.image_ranking,name='ranking'),
]

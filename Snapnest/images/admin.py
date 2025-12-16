from django.contrib import admin
from .models import Image, Comment
# Register your models here.
@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display=['title','slug','image','created']
    list_filter=['created']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'image', 'created', 'body']
    list_filter = ['created']
    search_fields = ['user__username', 'body']
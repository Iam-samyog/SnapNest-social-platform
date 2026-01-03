from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.urls import reverse

import uuid

# Create your models here.
class Image(models.Model):
    user=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='images_created',
        on_delete=models.CASCADE
    )
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    title=models.CharField(max_length=250)

    total_likes=models.PositiveIntegerField(default=0)

    slug=models.SlugField(max_length=250,blank=True)
    url=models.URLField(max_length=2000, blank=True)
    image=models.ImageField(upload_to='images/%Y/%m/%d/', blank=True, null=True)
    description=models.TextField(blank=True)
    created=models.DateTimeField(auto_now_add=True)

    users_like=models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='images_liked',
        blank=True
    )

    class Meta:
        indexes=[
            models.Index(fields=['created']),
            models.Index(fields=['-total_likes']),
        ]
        ordering=['-created']
    
    def __str__(self):
        return self.title

    def save(self,*args,**kwargs):
        if not self.slug:
            self.slug=slugify(self.title)
        super().save(*args,**kwargs)
    
    def get_absolute_url(self):
        return reverse('images:detail',args=[self.uuid, self.slug])


class Comment(models.Model):
    image = models.ForeignKey(Image, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='comments', on_delete=models.CASCADE)
    body = models.TextField()
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created']

    def __str__(self):
        return f'Comment by {self.user.username} on {self.image.title}'

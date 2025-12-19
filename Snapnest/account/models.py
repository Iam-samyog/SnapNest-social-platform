from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
# Create your models here.

class Profile(models.Model):
    user=models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    date_of_birth=models.DateField(blank=True,null=True)

    photo=models.ImageField(
        upload_to='users/%Y/%m/%d/',
        blank=True
    )

    def __str__(self):
        return f'Profile of {self.user.username}'


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
    

class Contact(models.Model):
    user_from=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='rel_from_set',
        on_delete=models.CASCADE

    )
    user_to=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='rel_to_set',
        on_delete=models.CASCADE
    )

    created=models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes=[
            models.Index(fields=['-created'])
        ]
        ordering=['-created']
        
    
        def __str__(self):
            return f'{self.user_from} follow {self.user_to}'
        
# Note: The 'following' relationship is accessed through the Contact model
# Users can access followers via: user.rel_to_set.all()
# Users can access following via: user.rel_from_set.all()
# This avoids the need for add_to_class which causes migration warnings

# user_model=get_user_model()
# user_model.add_to_class(
#         'following',
#         models.ManyToManyField(
#             'self',
#             through=Contact,
#             related_name='followers',
#             symmetrical=False
#         )
#     )
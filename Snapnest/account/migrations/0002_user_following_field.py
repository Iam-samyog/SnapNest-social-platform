# Generated migration to acknowledge dynamically added 'following' field
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        # Empty migration - the 'following' field is added dynamically
        # via add_to_class in account/models.py
    ]

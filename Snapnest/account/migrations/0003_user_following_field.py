# Generated migration to acknowledge dynamically added 'following' field
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0002_contact'),
    ]

    operations = [
        # Empty migration - the 'following' field is added dynamically
        # via add_to_class in account/models.py
    ]

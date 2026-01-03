import uuid
from django.db import migrations

def gen_uuid(apps, schema_editor):
    MyModel = apps.get_model('images', 'Image')
    for row in MyModel.objects.all():
        row.uuid = uuid.uuid4()
        row.save(update_fields=['uuid'])

class Migration(migrations.Migration):

    dependencies = [
        ('images', '0005_image_uuid'),
    ]

    operations = [
        migrations.RunPython(gen_uuid, reverse_code=migrations.RunPython.noop),
    ]

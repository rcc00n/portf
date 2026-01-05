from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("leads", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="contactrequest",
            name="qualification",
            field=models.JSONField(blank=True, null=True),
        ),
    ]

from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("projects", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="PricingTier",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("tier", models.CharField(max_length=120)),
                ("price", models.CharField(max_length=40)),
                ("info", models.CharField(blank=True, max_length=200)),
                ("featured", models.BooleanField(default=False)),
                (
                    "order",
                    models.PositiveSmallIntegerField(
                        default=1,
                        help_text="Slot number from 1 to 5 (unique).",
                        unique=True,
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(5),
                        ],
                    ),
                ),
            ],
            options={
                "ordering": ["order", "id"],
            },
        ),
        migrations.CreateModel(
            name="PricingPoint",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("text", models.CharField(max_length=160)),
                ("order", models.PositiveIntegerField(default=0)),
                (
                    "tier",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="points",
                        to="projects.pricingtier",
                    ),
                ),
            ],
            options={
                "ordering": ["order", "id"],
            },
        ),
    ]

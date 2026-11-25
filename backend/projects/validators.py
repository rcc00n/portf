from django.core.exceptions import ValidationError
from PIL import Image, UnidentifiedImageError

IMAGE_TYPES = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp", "GIF": "image/gif", "AVIF": "image/avif"}


def validate_project_image(value):
    try:
        position = value.tell()
        try:
            image = Image.open(value)
            if image.format not in IMAGE_TYPES:
                raise ValidationError("Use a JPEG, PNG, WebP, GIF or AVIF image.", code="unsupported_image")
        finally:
            value.seek(position)
    except (OSError, UnidentifiedImageError, Image.DecompressionBombError):
        raise ValidationError("Upload a valid project image.", code="invalid_image") from None

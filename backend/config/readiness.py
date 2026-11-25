"""Internal readiness excludes notification providers and returns no details."""
import logging
import os
from django.conf import settings
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.http import JsonResponse
from django.views.decorators.http import require_safe

logger = logging.getLogger(__name__)


@require_safe
def readiness(_request):
    ready = False
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        executor = MigrationExecutor(connection)
        migrated = not executor.migration_plan(executor.loader.graph.leaf_nodes())
        media = settings.MEDIA_ROOT.is_dir() and os.access(settings.MEDIA_ROOT, os.R_OK | os.W_OK | os.X_OK)
        frontend = (settings.FRONTEND_DIST_DIR / "index.html").is_file()
        ready = migrated and media and frontend
        if not ready:
            logger.warning("Readiness unavailable: check migrations, media and frontend artifact.")
    except Exception:
        # Database errors may include credentials; only log the fixed category.
        logger.warning("Readiness dependency check failed.")
    response = JsonResponse({"ok": ready}, status=200 if ready else 503)
    response["Cache-Control"] = "no-store"
    response["X-Robots-Tag"] = "noindex"
    return response

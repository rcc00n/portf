import signal
import time

from django.core.management.base import BaseCommand
from django.db import close_old_connections
from django.utils import timezone

from leads.models import InquiryRateBucket
from leads.notifications import process_one


class Command(BaseCommand):
    help = "Process durable inquiry notifications. Run one supervised worker; --once drains due jobs and exits."

    def add_arguments(self, parser):
        parser.add_argument("--once", action="store_true")

    def handle(self, *args, **options):
        stopping = False

        def stop(*_):
            nonlocal stopping
            stopping = True

        previous = {}
        if not options["once"]:
            for kind in (signal.SIGTERM, signal.SIGINT):
                previous[kind] = signal.signal(kind, stop)
        try:
            while not stopping:
                close_old_connections()
                InquiryRateBucket.objects.filter(expires_at__lt=timezone.now()).delete()
                if process_one():
                    continue
                if options["once"]:
                    break
                time.sleep(2)
        finally:
            for kind, handler in previous.items():
                signal.signal(kind, handler)

release: python release.py
web: gunicorn --config gunicorn.conf.py config.wsgi:application
worker: python manage.py process_inquiry_notifications

web: sh -c 'exec gunicorn --config gunicorn.conf.py config.wsgi:application --bind 0.0.0.0:${PORT:-8000}'
worker: python manage.py process_inquiry_notifications

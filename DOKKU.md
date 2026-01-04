Dokku deployment (Django + React)

This repo ships with a Dockerfile that builds the React frontend and serves it from Django.

Prereqs
- Dokku installed
- dokku-postgres plugin installed

1) Create app + database
- dokku apps:create portf
- dokku postgres:create portf-db
- dokku postgres:link portf-db portf

2) Configure env
- dokku config:set portf DJANGO_SECRET_KEY=change-me
- dokku config:set portf DJANGO_ALLOWED_HOSTS=yourdomain.com
- dokku config:set portf DJANGO_DEBUG=false
- dokku config:set portf DJANGO_SECURE_SSL_REDIRECT=true
- dokku config:set portf DJANGO_SESSION_COOKIE_SECURE=true
- dokku config:set portf DJANGO_CSRF_COOKIE_SECURE=true
- dokku config:set portf DJANGO_SERVE_MEDIA=true

Optional (HSTS):
- dokku config:set portf DJANGO_SECURE_HSTS_SECONDS=31536000
- dokku config:set portf DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS=true
- dokku config:set portf DJANGO_SECURE_HSTS_PRELOAD=true

Optional (DB SSL):
- dokku config:set portf DJANGO_DB_SSL=true

3) Persist uploaded media
- dokku storage:ensure-directory /var/lib/dokku/data/storage/portf-media
- dokku storage:mount portf /var/lib/dokku/data/storage/portf-media:/srv/app/media

4) Deploy
- git push dokku main

5) Migrate + create admin user
- dokku run portf python manage.py migrate
- dokku run portf python manage.py createsuperuser

6) Domain + TLS
- dokku domains:set portf yourdomain.com
- dokku letsencrypt:enable portf

Frontend build args
If you need a custom base path or a separate API host, pass build args:
- dokku docker-options:add portf build "--build-arg VITE_BASE=/"
- dokku docker-options:add portf build "--build-arg VITE_API_BASE=https://api.yourdomain.com"

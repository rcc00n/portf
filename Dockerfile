FROM node:20-slim AS frontend
WORKDIR /app
COPY app/package*.json ./
RUN npm ci
COPY app/ ./
ARG VITE_BASE=/
ARG VITE_API_BASE=
ENV VITE_BASE=$VITE_BASE
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

FROM python:3.12-slim AS backend
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /srv/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        libjpeg62-turbo-dev \
        zlib1g-dev \
        libpng-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /srv/app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ /srv/app/
COPY --from=frontend /app/dist /srv/app/frontend_dist

ENV DJANGO_SETTINGS_MODULE=config.settings
ENV PORT=8000

RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["sh", "-c", "gunicorn config.wsgi:application --bind 0.0.0.0:${PORT}"]

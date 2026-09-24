Backend (Django)

Local setup
1) Create a virtualenv and install deps
- python -m venv .venv
- source .venv/bin/activate
- pip install -r backend/requirements.txt

2) Configure env
- cp backend/.env.example backend/.env
- edit backend/.env

3) Run migrations + create admin
- python backend/manage.py migrate
- python backend/manage.py createsuperuser

4) Start backend
- python backend/manage.py runserver

Frontend dev
- cd app
- npm install
- cp .env.example .env (optional)
- npm run dev

Notes
- The API endpoints are /api/projects/, /api/pricing/, /api/contacts/ and the admin is /admin/.
- Inquiry acceptance is database-backed and independent of Telegram. Set TELEGRAM_BOT_TOKEN, add active recipients in admin, and run the separate `python manage.py process_inquiry_notifications` worker from `backend/`. See [contact reliability contract](../CONTACT_RELIABILITY.md) and [Dokku runtime](../DOKKU.md).
- Settings read process environment; copying `.env` alone does not load it. Export the reviewed values through your shell/process manager without committing them.
- Uploaded images are stored under backend/media/.
- Set DJANGO_SERVE_MEDIA=true if you want Django to serve uploads without a CDN.
- For a production build, the Dockerfile builds the frontend and copies it into backend/frontend_dist.

from pathlib import Path
import os

import dj_database_url
from django.core.management.utils import get_random_secret_key
from django.core.exceptions import ImproperlyConfigured
from urllib.parse import urlsplit
import ipaddress
from corsheaders.defaults import default_headers


def env_bool(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name, default=None):
    value = os.getenv(name)
    if value is None:
        return default or []
    return [item.strip() for item in value.split(",") if item.strip()]


BASE_DIR = Path(__file__).resolve().parent.parent

ENVIRONMENT = os.getenv("DJANGO_ENV", "production")
if ENVIRONMENT not in {"production", "development", "test", "build"}:
    raise ImproperlyConfigured("DJANGO_ENV must be production, development, test or build.")
PRODUCTION = ENVIRONMENT == "production"
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "")
if PRODUCTION and (len(SECRET_KEY) < 50 or len(set(SECRET_KEY)) < 5):
    raise ImproperlyConfigured("Production requires a private stable DJANGO_SECRET_KEY (50+ characters).")
if not SECRET_KEY:
    SECRET_KEY = get_random_secret_key()  # Only explicitly non-production environments.
DEBUG = env_bool("DJANGO_DEBUG", False)

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", ["localhost", "127.0.0.1"])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "projects",
    "leads",
]

MIDDLEWARE = [
    "config.middleware.TrustedProxyMiddleware",
    "config.middleware.ResponsePolicyMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

FRONTEND_DIST_DIR = Path(os.getenv("DJANGO_FRONTEND_DIST_DIR", BASE_DIR / "frontend_dist"))

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [str(FRONTEND_DIST_DIR)],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=env_bool("DJANGO_DB_SSL", not DEBUG),
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = os.getenv("DJANGO_STATIC_URL", "/static/")
STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_DIRS = []
if FRONTEND_DIST_DIR.exists():
    STATICFILES_DIRS.append(FRONTEND_DIST_DIR)

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

MEDIA_URL = os.getenv("DJANGO_MEDIA_URL", "/media/")
MEDIA_ROOT = Path(os.getenv("DJANGO_MEDIA_ROOT", BASE_DIR / "media"))
SERVE_MEDIA = env_bool("DJANGO_SERVE_MEDIA", DEBUG)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_CREDENTIALS = env_bool("CORS_ALLOW_CREDENTIALS", False)

CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS")

# Middleware strips forwarded protocol unless the socket peer is explicitly trusted.
TRUSTED_PROXY_NETWORKS = [ipaddress.ip_network(value) for value in env_list("DJANGO_TRUSTED_PROXY_CIDRS")]
if any(network.prefixlen == 0 for network in TRUSTED_PROXY_NETWORKS):
    raise ImproperlyConfigured("Trust explicit proxy CIDRs, never all addresses.")
TRUST_PROXY_CLIENT_IP = env_bool("DJANGO_TRUST_PROXY_CLIENT_IP", False)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https") if TRUSTED_PROXY_NETWORKS else None
SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", not DEBUG)
SESSION_COOKIE_SECURE = env_bool("DJANGO_SESSION_COOKIE_SECURE", not DEBUG)
CSRF_COOKIE_SECURE = env_bool("DJANGO_CSRF_COOKIE_SECURE", not DEBUG)
SECURE_HSTS_SECONDS = int(os.getenv("DJANGO_SECURE_HSTS_SECONDS", "0")) if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS", False)
SECURE_HSTS_PRELOAD = env_bool("DJANGO_SECURE_HSTS_PRELOAD", False)

# Public inquiries: one shared-network budget per hour; verified proxy identity is opt-in.
INQUIRY_RATE_LIMIT = int(os.getenv("INQUIRY_RATE_LIMIT", "60"))
INQUIRY_ALLOWED_ORIGINS = [value.strip() for value in os.getenv("INQUIRY_ALLOWED_ORIGINS", "").split(",") if value.strip()]

# Required only for an explicitly configured cross-origin frontend.
CORS_ALLOW_HEADERS = (*default_headers, "idempotency-key")

# Default retains the repository's existing host. Verify it before staging;
# request Host/forwarded headers must never choose public canonical URLs.
from .metadata import CONTRACT as _ROUTE_CONTRACT
CANONICAL_ORIGIN = os.getenv("DJANGO_CANONICAL_ORIGIN", _ROUTE_CONTRACT["origin"])

# Public pages use same-origin scripts/fonts/API. Explicit extra API origins are
# only needed for a separately hosted frontend build; never infer from requests.
CSP_CONNECT_ORIGINS = env_list("DJANGO_CSP_CONNECT_ORIGINS")
for origin in CSP_CONNECT_ORIGINS:
    parts = urlsplit(origin)
    if parts.scheme not in {"http", "https"} or not parts.netloc or parts.username or parts.password or parts.path or parts.query or parts.fragment or any(c.isspace() for c in origin) or any(c in origin for c in ";\'\"<>*"):
        raise ImproperlyConfigured("CSP connect sources must be explicit HTTP(S) origins.")
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"
SECURE_REDIRECT_EXEMPT = [r"^health/$", r"^ready/$"]

if PRODUCTION:
    if DEBUG:
        raise ImproperlyConfigured("Production cannot enable DJANGO_DEBUG.")
    if not os.getenv("DJANGO_ALLOWED_HOSTS") or not ALLOWED_HOSTS or any("*" in host for host in ALLOWED_HOSTS):
        raise ImproperlyConfigured("Production requires explicit DJANGO_ALLOWED_HOSTS.")
    if not os.getenv("DATABASE_URL") or DATABASES["default"]["ENGINE"] != "django.db.backends.postgresql":
        raise ImproperlyConfigured("Production requires an attached PostgreSQL DATABASE_URL.")
    origin = urlsplit(os.getenv("DJANGO_CANONICAL_ORIGIN", ""))
    if origin.scheme != "https" or not origin.hostname or origin.username or origin.password or origin.path or origin.query or origin.fragment:
        raise ImproperlyConfigured("Production requires an explicit HTTPS DJANGO_CANONICAL_ORIGIN (no trailing slash).")
    if not SECURE_SSL_REDIRECT or not SESSION_COOKIE_SECURE or not CSRF_COOKIE_SECURE:
        raise ImproperlyConfigured("Production requires HTTPS redirects and secure cookies.")
    if not os.getenv("DJANGO_MEDIA_ROOT") or not MEDIA_ROOT.is_absolute() or MEDIA_ROOT == STATIC_ROOT:
        raise ImproperlyConfigured("Production requires an explicit absolute persistent DJANGO_MEDIA_ROOT.")
    if not SERVE_MEDIA or MEDIA_URL != "/media/" or STATIC_URL != "/static/":
        raise ImproperlyConfigured("This deployment requires registered project media at /media/ and static at /static/.")

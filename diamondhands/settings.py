import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, ".env"))
SECRET_KEY = os.getenv("SECRET_KEY")
ROOT_URLCONF = "diamondhands.urls"
WSGI_APPLICATION = "diamondhands.wsgi.application"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            str(BASE_DIR.joinpath("templates")),
        ],
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

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

SITE_ID = 1

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


DEBUG = True
ALLOWED_HOSTS = []


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "allauth",
    "allauth.account",
    "widget_tweaks",
    "backtest",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]


# DATABASES = {
#      "default": {
#          "ENGINE": "django.db.backends.sqlite3",
#          "NAME": BASE_DIR / "db.sqlite3",
#      }
# }

DATABASES = {
   "default": {
       "ENGINE": "django.db.backends.postgresql",
       "NAME": os.getenv("POSTGRES_DB", "your_default_db_name"),
       "USER": os.getenv("POSTGRES_USER", "your_default_user"),
       "PASSWORD": os.getenv("POSTGRES_PASSWORD", "your_default_password"),
       "HOST": os.getenv("POSTGRES_HOST", "localhost"),
       "PORT": os.getenv("POSTGRES_PORT", "5432"),
   }
}


CSRF_TRUSTED_ORIGINS = ['http://62.146.176.99']

STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")

TWELVE_API_KEY = os.getenv("TWELVE_API_KEY")

AUTH_USER_MODEL = "backtest.CustomUser"

ACCOUNT_FORMS = {"signup": "backtest.forms.CustomSignupForm"}
ACCOUNT_EMAIL_VERIFICATION = "none"
LOGIN_REDIRECT_URL = "home"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_AUTHENTICATION_METHOD = "username_email"
ACCOUNT_LOGOUT_ON_GET = True


CSRF_TRUSTED_ORIGINS = ['https://diamondhands.space', 'https://www.diamondhands.space', 'http://diamondhands.space', 'http://www.diamondhands.space']

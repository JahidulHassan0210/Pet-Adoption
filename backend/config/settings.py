import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='your-secret-key-here-change-in-production')

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.contenttypes',  # Required for DRF
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'django_filters',
    'utils',  # Custom utilities including authentication
    'users',
    'badges',
    'blogs',
    'posts',
    'donations',
    'items',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = config('STATIC_URL', default='/static/')
STATIC_ROOT = config('STATIC_ROOT', default='staticfiles/')

MEDIA_URL = config('MEDIA_URL', default='/media/')
MEDIA_ROOT = config('MEDIA_ROOT', default='media/')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# JWT Settings
JWT_SECRET_KEY = config('JWT_SECRET_KEY', default='your-jwt-secret-key-change-in-production')

# MongoDB Settings
DB_NAME = config('DB_NAME', default='pet_adoption_db')
DB_HOST = config('DB_HOST', default='localhost')
DB_PORT = config('DB_PORT', default=27017, cast=int)
DB_USER = config('DB_USER', default='')
DB_PASSWORD = config('DB_PASSWORD', default='')

# Disable Django's built-in authentication completely
AUTHENTICATION_BACKENDS = []
AUTH_USER_MODEL = None
AUTH_PASSWORD_VALIDATORS = []

# Disable Django's auth system
AUTH_USER_MODEL = None
AUTH_PASSWORD_VALIDATORS = []
AUTHENTICATION_BACKENDS = []

# Disable Django's sessions and messages
SESSION_ENGINE = None
MESSAGE_STORAGE = None

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'utils.jwt_auth.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'UNAUTHENTICATED_USER': None,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

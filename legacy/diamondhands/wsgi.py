import os

from django.core.wsgi import get_wsgi_application

# importing whitenoise
from whitenoise import WhiteNoise

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "diamondhands.settings")

application = get_wsgi_application()

# wrapping up existing wsgi application
application = WhiteNoise(application, root="static")

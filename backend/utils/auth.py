from rest_framework import authentication
from rest_framework import exceptions
from users.models import User

class MongoEngineAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        # For now, return None to indicate no authentication
        # You can implement token-based auth here later
        return None

    def authenticate_header(self, request):
        return 'MongoEngine'

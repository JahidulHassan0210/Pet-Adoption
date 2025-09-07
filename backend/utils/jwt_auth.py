import jwt
import datetime
from django.conf import settings
from django.utils import timezone
from rest_framework import authentication
from rest_framework import exceptions
from users.models import User

# JWT Settings
JWT_SECRET_KEY = getattr(settings, 'JWT_SECRET_KEY', 'your-jwt-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DELTA = datetime.timedelta(days=1)  # 1 day

def generate_jwt_token(user):
    """Generate JWT token for a user"""
    try:
        now = timezone.now()
        payload = {
            'user_id': str(user.id),
            'username': user.username,
            'email': user.email,
            'exp': now + JWT_EXPIRATION_DELTA,
            'iat': now
        }
        # Convert datetime objects to timestamps for JWT
        if hasattr(payload['exp'], 'timestamp'):
            payload['exp'] = int(payload['exp'].timestamp())
        if hasattr(payload['iat'], 'timestamp'):
            payload['iat'] = int(payload['iat'].timestamp())
        
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        return token
    except Exception as e:
        print(f"Error generating JWT token: {e}")
        raise

def decode_jwt_token(token):
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed('Token has expired')
    except jwt.InvalidTokenError:
        raise exceptions.AuthenticationFailed('Invalid token')
    except Exception as e:
        print(f"Error decoding JWT token: {e}")
        raise exceptions.AuthenticationFailed('Invalid token')

class JWTAuthentication(authentication.BaseAuthentication):
    """Custom JWT Authentication class"""
    
    def authenticate(self, request):
        try:
            # Get token from Authorization header
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            
            if not auth_header.startswith('Bearer '):
                return None
            
            token = auth_header.split(' ')[1]
            
            try:
                # Decode token
                payload = decode_jwt_token(token)
                user_id = payload.get('user_id')
                
                if not user_id:
                    raise exceptions.AuthenticationFailed('Invalid token payload')
                
                # Get user from database
                try:
                    user = User.objects.get(id=user_id)
                    if not user.is_active:
                        raise exceptions.AuthenticationFailed('User is inactive')
                    return (user, token)
                except User.DoesNotExist:
                    raise exceptions.AuthenticationFailed('User not found')
                    
            except jwt.ExpiredSignatureError:
                raise exceptions.AuthenticationFailed('Token has expired')
            except jwt.InvalidTokenError:
                raise exceptions.AuthenticationFailed('Invalid token')
            except Exception as e:
                raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')
        except Exception as e:
            print(f"Error in JWT authentication: {e}")
            return None
    
    def authenticate_header(self, request):
        return 'Bearer realm="api"'

def get_user_from_token(request):
    """Helper function to get user from token without using DRF authentication"""
    try:
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print(f"Auth header: {auth_header}")
        
        if not auth_header.startswith('Bearer '):
            print("No Bearer token found")
            return None
        
        token = auth_header.split(' ')[1]
        print(f"Token: {token[:20]}...")
        
        try:
            payload = decode_jwt_token(token)
            user_id = payload.get('user_id')
            print(f"User ID from token: {user_id}")
            
            if not user_id:
                print("No user_id in token payload")
                return None
            
            user = User.objects.get(id=user_id)
            print(f"User found: {user.username}")
            if not user.is_active:
                print("User is inactive")
                return None
            return user
        except Exception as e:
            print(f"Error processing token: {e}")
            return None
    except Exception as e:
        print(f"Error getting user from token: {e}")
        return None

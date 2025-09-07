from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from users.serializers.user_serializer import UserRegistrationSerializer, UserProfileSerializer
from users.models import User
from utils.jwt_auth import generate_jwt_token, get_user_from_token
import hashlib
import os
import uuid
from django.conf import settings

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def check_password(password, hashed):
    return hash_password(password) == hashed

@api_view(['GET'])
@permission_classes([AllowAny])
def test_connection(request):
    return Response({'message': 'API is working', 'status': 'ok'})

@api_view(['POST'])
@permission_classes([AllowAny])
def user_register(request):
    try:
        # Debug: Print received data
        print("Received data:", request.data)
        print("Received files:", request.FILES)
        
        serializer = UserRegistrationSerializer(data=request.data)
        
        # Debug: Check if serializer is valid and what errors occur
        if not serializer.is_valid():
            print("Serializer validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Check if user already exists
            try:
                if User.objects(email=data['email']).first():
                    return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
                
                if User.objects(username=data['username']).first():
                    return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'error': f'Database connection error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Handle file upload for nid_photo
            nid_photo_path = ''
            if 'nid_photo' in request.FILES:
                nid_photo = request.FILES['nid_photo']
                try:
                    # Save file to media directory
                    media_dir = os.path.join(settings.BASE_DIR, 'media', 'nid_photos')
                    os.makedirs(media_dir, exist_ok=True)
                    
                    # Generate unique filename
                    file_extension = os.path.splitext(nid_photo.name)[1]
                    filename = f"{uuid.uuid4()}{file_extension}"
                    file_path = os.path.join(media_dir, filename)
                    
                    # Save file
                    with open(file_path, 'wb+') as destination:
                        for chunk in nid_photo.chunks():
                            destination.write(chunk)
                    
                    # Store relative path
                    nid_photo_path = f"nid_photos/{filename}"
                except Exception as e:
                    return Response({'error': f'File upload error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Create user with hashed password
            try:
                user = User(
                    username=data['username'],
                    email=data['email'],
                    password=hash_password(data['password']),
                    first_name=data.get('first_name', ''),
                    last_name=data.get('last_name', ''),
                    nid_photo=nid_photo_path
                )
                user.save()
            except Exception as e:
                return Response({'error': f'User creation error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Generate JWT token
            try:
                token = generate_jwt_token(user)
            except Exception as e:
                return Response({'error': f'Token generation error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'user': UserProfileSerializer(user).data,
                'token': token,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if email and password:
        try:
            user = User.objects.get(email=email)
            if check_password(password, user.password):
                # Generate JWT token
                token = generate_jwt_token(user)
                return Response({
                    'user': UserProfileSerializer(user).data,
                    'token': token,
                    'message': 'Login successful'
                })
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({'error': 'Please provide email and password'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def user_logout(request):
    # For JWT, we don't need to do anything server-side
    # The client should remove the token
    return Response({'message': 'Successfully logged out'})

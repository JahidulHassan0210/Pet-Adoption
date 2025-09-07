from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from users.serializers.user_serializer import UserProfileSerializer, UserUpdateSerializer, PasswordChangeSerializer
from utils.jwt_auth import get_user_from_token
import hashlib

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def check_password(password, hashed):
    return hash_password(password) == hashed

@api_view(['GET'])
@permission_classes([AllowAny])
def get_profile(request):
    # Get user from token
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_profile(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        # Update fields manually since MongoEngine doesn't support partial updates like Django ORM
        for field, value in serializer.validated_data.items():
            if value is not None:  # Only update if value is provided
                setattr(user, field, value)
        user.save()
        return Response(UserProfileSerializer(user).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def change_password(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    serializer = PasswordChangeSerializer(data=request.data)
    if serializer.is_valid():
        if check_password(serializer.validated_data['old_password'], user.password):
            user.password = hash_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully'})
        else:
            return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def upload_photo(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if 'photo' in request.FILES:
        # Save file and update user profile_photo field
        # This is simplified - you'll need to implement proper file handling
        user.profile_photo = str(request.FILES['photo'])
        user.save()
        return Response(UserProfileSerializer(user).data)
    return Response({'error': 'No photo provided'}, status=status.HTTP_400_BAD_REQUEST)

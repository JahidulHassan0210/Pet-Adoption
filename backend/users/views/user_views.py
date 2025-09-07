from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from users.models import User
from users.serializers.user_serializer import UserSerializer, UserProfileSerializer
from posts.models import Post, Comment
from utils.jwt_auth import get_user_from_token
import os
import uuid
from django.conf import settings

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_profile(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        serializer = UserProfileSerializer(user)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_user_profile(request, user_id):
    try:
        current_user = get_user_from_token(request)
        if not current_user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if str(current_user.id) != str(user_id) and not current_user.is_staff:
            return Response({'error': 'Not authorized to update this profile'}, status=status.HTTP_403_FORBIDDEN)
        
        user = User.objects.get(id=user_id)
        data = request.data.copy()
        
        if 'nid_photo' in request.FILES:
            try:
                media_dir = os.path.join(settings.BASE_DIR, 'media', 'nid_photos')
                os.makedirs(media_dir, exist_ok=True)
                
                file_extension = os.path.splitext(request.FILES['nid_photo'].name)[1]
                filename = f"{uuid.uuid4()}{file_extension}"
                file_path = os.path.join(media_dir, filename)
                
                with open(file_path, 'wb+') as destination:
                    for chunk in request.FILES['nid_photo'].chunks():
                        destination.write(chunk)
                
                data['nid_photo'] = f"nid_photos/{filename}"
            except Exception as e:
                print(f"Photo upload error: {e}")
        
        if 'profile_photo' in request.FILES:
            try:
                media_dir = os.path.join(settings.BASE_DIR, 'media', 'profile_photos')
                os.makedirs(media_dir, exist_ok=True)
                
                file_extension = os.path.splitext(request.FILES['profile_photo'].name)[1]
                filename = f"{uuid.uuid4()}{file_extension}"
                file_path = os.path.join(media_dir, filename)
                
                with open(file_path, 'wb+') as destination:
                    for chunk in request.FILES['profile_photo'].chunks():
                        destination.write(chunk)
                
                data['profile_photo'] = f"profile_photos/{filename}"
            except Exception as e:
                print(f"Photo upload error: {e}")
        
        serializer = UserProfileSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response({
                'data': UserProfileSerializer(updated_user).data,
                'message': 'Profile updated successfully',
                'success': True
            })
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_users(request):
    try:
        user = get_user_from_token(request)
        if not user or not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.all().order_by('-created_at')
        serializer = UserSerializer(users, many=True)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_user(request, user_id):
    try:
        current_user = get_user_from_token(request)
        if not current_user or not current_user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        if str(current_user.id) == str(user_id):
            return Response({'error': 'Cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({'message': 'User deleted successfully', 'success': True})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([AllowAny])
def toggle_user_status(request, user_id):
    try:
        current_user = get_user_from_token(request)
        if not current_user or not current_user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        if str(current_user.id) == str(user_id):
            return Response({'error': 'Cannot modify your own account status'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.get(id=user_id)
        user.is_active = not user.is_active
        user.save()
        
        return Response({
            'data': UserSerializer(user).data,
            'message': f"User {'activated' if user.is_active else 'deactivated'} successfully",
            'success': True
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_posts(request):
    try:
        user = get_user_from_token(request)
        if not user or not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        posts = Post.objects.all().order_by('-created_at')
        from posts.serializers.post_serializer import PostSerializer
        serializer = PostSerializer(posts, many=True)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def admin_delete_post(request, post_id):
    try:
        user = get_user_from_token(request)
        if not user or not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        post = Post.objects.get(id=post_id)
        post.delete()
        return Response({'message': 'Post deleted successfully', 'success': True})
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_comments(request):
    try:
        user = get_user_from_token(request)
        if not user or not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        comments = Comment.objects.all().order_by('-created_at')
        from posts.serializers.post_serializer import CommentSerializer
        serializer = CommentSerializer(comments, many=True)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def admin_delete_comment(request, comment_id):
    try:
        user = get_user_from_token(request)
        if not user or not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        comment = Comment.objects.get(id=comment_id)
        comment.delete()
        return Response({'message': 'Comment deleted successfully', 'success': True})
    except Comment.DoesNotExist:
        return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

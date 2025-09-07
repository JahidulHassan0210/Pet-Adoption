from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from posts.models import Post, PostImage, PostUpdate, Comment, Bookmark
from posts.serializers.post_serializer import PostSerializer, PostUpdateSerializer, PostImageSerializer, CommentSerializer, BookmarkSerializer
from users.models import User
from utils.jwt_auth import get_user_from_token
import os
import uuid
from django.conf import settings

@api_view(['GET'])
@permission_classes([AllowAny])
def get_posts(request):
    try:
        post_type = request.GET.get('type')
        status_filter = request.GET.get('status', 'active')
        limit = int(request.GET.get('limit', 20))
        
        query = Post.objects(status=status_filter)
        if post_type:
            query = query.filter(type=post_type)
        
        posts = query.order_by('-created_at').limit(limit)
        
        posts_with_images = []
        for post in posts:
            post_data = PostSerializer(post).data
            images = PostImage.objects(post=post)
            post_data['images'] = PostImageSerializer(images, many=True).data
            posts_with_images.append(post_data)
        
        return Response({
            'data': posts_with_images,
            'total': len(posts_with_images),
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_post_detail(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        post_data = PostSerializer(post).data
        
        images = PostImage.objects(post=post)
        post_data['images'] = PostImageSerializer(images, many=True).data
        
        return Response({
            'data': post_data,
            'success': True
        })
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_post(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required. Please provide a valid JWT token in the Authorization header.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        print(f"Creating post for user: {user.username}")
        print(f"Request data: {request.data}")
        print(f"Request FILES: {request.FILES}")
        
        data = request.data.copy()
        data['user'] = str(user.id)
        
        print(f"Processed data: {data}")
        
        serializer = PostSerializer(data=data, context={'user': user})
        if serializer.is_valid():
            print(f"Serializer is valid, validated data: {serializer.validated_data}")
            post = serializer.save()
            
            if 'images' in request.FILES:
                for image_file in request.FILES.getlist('images'):
                    try:
                        media_dir = os.path.join(settings.BASE_DIR, 'media', 'post_images')
                        os.makedirs(media_dir, exist_ok=True)
                        
                        file_extension = os.path.splitext(image_file.name)[1]
                        filename = f"{uuid.uuid4()}{file_extension}"
                        file_path = os.path.join(media_dir, filename)
                        
                        with open(file_path, 'wb+') as destination:
                            for chunk in image_file.chunks():
                                destination.write(chunk)
                        
                        PostImage(
                            post=post,
                            image_url=f"post_images/{filename}"
                        ).save()
                    except Exception as e:
                        print(f"Image upload error: {e}")
            
            return Response({
                'data': PostSerializer(post).data,
                'message': 'Post created successfully',
                'success': True
            }, status=status.HTTP_201_CREATED)
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Error creating post: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def update_post(request, post_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        post = Post.objects.get(id=post_id)
        if str(post.user.id) != str(user.id):
            return Response({'error': 'Not authorized to update this post'}, status=status.HTTP_403_FORBIDDEN)
        
        update_text = request.data.get('update_text')
        new_images = request.FILES.getlist('new_images') if 'new_images' in request.FILES else []
        
        if not update_text and not new_images:
            return Response({'error': 'Please provide update text or new images'}, status=status.HTTP_400_BAD_REQUEST)
        
        update = PostUpdate(
            post=post,
            user=user,
            update_text=update_text,
            update_type='text' if not new_images else 'both' if update_text else 'image'
        )
        
        if new_images:
            image_paths = []
            for image_file in new_images:
                try:
                    media_dir = os.path.join(settings.BASE_DIR, 'media', 'post_images')
                    os.makedirs(media_dir, exist_ok=True)
                    
                    file_extension = os.path.splitext(image_file.name)[1]
                    filename = f"{uuid.uuid4()}{file_extension}"
                    file_path = os.path.join(media_dir, filename)
                    
                    with open(file_path, 'wb+') as destination:
                        for chunk in image_file.chunks():
                            destination.write(chunk)
                    
                    image_path = f"post_images/{filename}"
                    image_paths.append(image_path)
                    
                    PostImage(
                        post=post,
                        image_url=image_path
                    ).save()
                except Exception as e:
                    print(f"Image upload error: {e}")
            
            update.new_images = image_paths
        
        update.save()
        
        return Response({
            'data': PostUpdateSerializer(update).data,
            'message': 'Post updated successfully',
            'success': True
        })
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_post_updates(request, post_id):
    try:
        updates = PostUpdate.objects(post=post_id).order_by('-created_at')
        serializer = PostUpdateSerializer(updates, many=True)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_post(request, post_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        post = Post.objects.get(id=post_id)
        if str(post.user.id) != str(user.id) and not user.is_staff:
            return Response({'error': 'Not authorized to delete this post'}, status=status.HTTP_403_FORBIDDEN)
        
        post.delete()
        return Response({'message': 'Post deleted successfully', 'success': True})
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_post_comments(request, post_id):
    try:
        comments = Comment.objects(post=post_id).order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_comment(request, post_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        data = request.data.copy()
        data['post'] = post_id
        
        serializer = CommentSerializer(data=data, context={'user': user})
        if serializer.is_valid():
            comment = serializer.save()
            return Response({
                'data': CommentSerializer(comment).data,
                'message': 'Comment created successfully',
                'success': True
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_comment(request, comment_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        comment = Comment.objects.get(id=comment_id)
        if str(comment.user.id) != str(user.id) and not user.is_staff:
            return Response({'error': 'Not authorized to delete this comment'}, status=status.HTTP_403_FORBIDDEN)
        
        comment.delete()
        return Response({'message': 'Comment deleted successfully', 'success': True})
    except Comment.DoesNotExist:
        return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def toggle_bookmark(request, post_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        existing_bookmark = Bookmark.objects(user=user, post=post_id).first()
        
        if existing_bookmark:
            existing_bookmark.delete()
            return Response({
                'message': 'Bookmark removed successfully',
                'is_bookmarked': False,
                'success': True
            })
        else:
            data = {'post': post_id}
            serializer = BookmarkSerializer(data=data, context={'user': user})
            if serializer.is_valid():
                bookmark = serializer.save()
                return Response({
                    'data': BookmarkSerializer(bookmark).data,
                    'message': 'Post bookmarked successfully',
                    'is_bookmarked': True,
                    'success': True
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_bookmarks(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        bookmarks = Bookmark.objects(user=user).order_by('-created_at')
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def check_bookmark_status(request, post_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'is_bookmarked': False})
        
        is_bookmarked = Bookmark.objects(user=user, post=post_id).first() is not None
        return Response({'is_bookmarked': is_bookmarked})
    except Exception as e:
        return Response({'is_bookmarked': False})

@api_view(['PUT'])
@permission_classes([AllowAny])
def edit_post(request, post_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        post = Post.objects.get(id=post_id)
        if str(post.user.id) != str(user.id) and not user.is_staff:
            return Response({'error': 'Not authorized to edit this post'}, status=status.HTTP_403_FORBIDDEN)
        
        # Update post fields
        if 'title' in request.data and request.data['title'].strip():
            post.title = request.data['title'].strip()
        if 'description' in request.data and request.data['description'].strip():
            post.description = request.data['description'].strip()
        if 'type' in request.data and request.data['type'] in ['adoption', 'donation']:
            post.type = request.data['type']
        if 'pet_age' in request.data:
            post.pet_age = request.data['pet_age']
        if 'pet_breed' in request.data:
            post.pet_breed = request.data['pet_breed']
        if 'pet_gender' in request.data:
            post.pet_gender = request.data['pet_gender']
        if 'location' in request.data:
            post.location = request.data['location']
        if 'contact_info' in request.data:
            post.contact_info = request.data['contact_info']
        if 'special_requirements' in request.data:
            post.special_requirements = request.data['special_requirements']
        if 'donation_goal' in request.data and post.type == 'donation':
            try:
                post.donation_goal = float(request.data['donation_goal'])
            except (ValueError, TypeError):
                pass
        
        # Handle existing images removal
        if 'existing_images' in request.data:
            try:
                import json
                existing_image_ids = json.loads(request.data['existing_images'])
                # Remove images not in the list
                current_images = PostImage.objects(post=post)
                for img in current_images:
                    if img.image_url not in existing_image_ids and str(img.id) not in existing_image_ids:
                        img.delete()
            except (json.JSONDecodeError, Exception) as e:
                print(f"Error handling existing images: {e}")
        
        # Handle new images
        if 'new_images' in request.FILES:
            for image_file in request.FILES.getlist('new_images'):
                try:
                    media_dir = os.path.join(settings.BASE_DIR, 'media', 'post_images')
                    os.makedirs(media_dir, exist_ok=True)
                    
                    file_extension = os.path.splitext(image_file.name)[1]
                    filename = f"{uuid.uuid4()}{file_extension}"
                    file_path = os.path.join(media_dir, filename)
                    
                    with open(file_path, 'wb+') as destination:
                        for chunk in image_file.chunks():
                            destination.write(chunk)
                    
                    PostImage(
                        post=post,
                        image_url=f"post_images/{filename}"
                    ).save()
                except Exception as e:
                    print(f"Image upload error: {e}")
        
        post.save()
        
        # Get updated post with images
        post_images = PostImage.objects(post=post)
        post_data = PostSerializer(post).data
        post_data['images'] = [{'id': str(img.id), 'image_url': img.image_url} for img in post_images]
        
        return Response({
            'data': post_data,
            'message': 'Post updated successfully',
            'success': True
        })
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error editing post: {e}")
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

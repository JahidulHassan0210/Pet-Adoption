import os
import uuid
import json
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from blogs.models import Blog
from blogs.serializers.blog_serializer import BlogSerializer, BlogCreateSerializer
from utils.jwt_auth import get_user_from_token
from django.conf import settings

@api_view(['GET'])
@permission_classes([AllowAny])
def list_blogs(request):
    blogs = Blog.objects.all()
    serializer = BlogSerializer(blogs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_blog_detail(request, blog_id):
    try:
        blog = Blog.objects.get(id=blog_id)
        serializer = BlogSerializer(blog)
        return Response(serializer.data)
    except Blog.DoesNotExist:
        return Response({'error': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_blog(request):
    user = get_user_from_token(request)
    if not user:
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Handle image upload
        image_path = None
        if 'image' in request.FILES:
            image_file = request.FILES['image']
            # Generate unique filename
            file_extension = os.path.splitext(image_file.name)[1]
            filename = f"blog_images/{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(settings.MEDIA_ROOT, filename)
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Save the file
            with open(file_path, 'wb+') as destination:
                for chunk in image_file.chunks():
                    destination.write(chunk)
            
            image_path = filename
        
        # Prepare data for serializer
        data = {
            'title': request.data.get('title'),
            'content': request.data.get('content'),
            'image': image_path
        }
        
        # Handle tags
        tags_input = request.data.get('tags')
        if tags_input:
            try:
                if tags_input.startswith('['):
                    # Parse JSON array
                    data['tags'] = json.loads(tags_input)
                else:
                    # Handle comma-separated string
                    data['tags'] = [tag.strip() for tag in tags_input.split(',') if tag.strip()]
            except json.JSONDecodeError:
                # Fallback to comma-separated
                data['tags'] = [tag.strip() for tag in tags_input.split(',') if tag.strip()]
        else:
            data['tags'] = []
        
        serializer = BlogCreateSerializer(data=data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            validated_data['author'] = user
            blog = serializer.save()
            return Response(BlogSerializer(blog).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_blog(request, blog_id):
    user = get_user_from_token(request)
    if not user or not user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        blog = Blog.objects.get(id=blog_id)
        serializer = BlogSerializer(blog, data=request.data, partial=True)
        if serializer.is_valid():
            blog = serializer.save()
            return Response(BlogSerializer(blog).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Blog.DoesNotExist:
        return Response({'error': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_blog(request, blog_id):
    user = get_user_from_token(request)
    if not user or not user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        blog = Blog.objects.get(id=blog_id)
        blog.delete()
        return Response({'message': 'Blog deleted successfully'})
    except Blog.DoesNotExist:
        return Response({'error': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)

from rest_framework import serializers
from posts.models import Post, PostImage, PostUpdate, Comment, Bookmark
from users.serializers.user_serializer import UserSerializer
from decimal import Decimal

class PostImageSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    image_url = serializers.CharField()
    caption = serializers.CharField(required=False, allow_blank=True)
    uploaded_at = serializers.DateTimeField(read_only=True)

class PostSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)
    type = serializers.ChoiceField(choices=['adoption', 'donation'])
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    pet_type = serializers.CharField(max_length=100, required=False, allow_blank=True)
    pet_age = serializers.IntegerField(required=False, min_value=0)
    pet_size = serializers.ChoiceField(choices=['small', 'medium', 'large'], required=False)
    pet_species = serializers.CharField(max_length=100, required=False, allow_blank=True)
    donation_goal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, min_value=Decimal('0'))
    current_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    status = serializers.CharField(max_length=20, read_only=True)
    donations_enabled = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)

    def create(self, validated_data):
        user = self.context.get('user')
        if not user:
            raise serializers.ValidationError("User is required")
        
        validated_data['user'] = user
        
        # Ensure required fields have default values
        if 'donations_enabled' not in validated_data:
            validated_data['donations_enabled'] = True
        
        post = Post(**validated_data)
        post.save()
        return post

class PostUpdateSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    post = serializers.CharField()
    user = UserSerializer(read_only=True)
    update_text = serializers.CharField(required=False, allow_blank=True)
    new_images = serializers.ListField(child=serializers.CharField(), required=False)
    update_type = serializers.ChoiceField(choices=['text', 'image', 'both'], read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

class CommentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    post = serializers.CharField()
    user = UserSerializer(read_only=True)
    content = serializers.CharField(max_length=1000)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        user = self.context.get('user')
        if not user:
            raise serializers.ValidationError("User is required")
        
        validated_data['user'] = user
        comment = Comment(**validated_data)
        comment.save()
        return comment

class BookmarkSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)
    post = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        user = self.context.get('user')
        if not user:
            raise serializers.ValidationError("User is required")
        
        validated_data['user'] = user
        return Bookmark(**validated_data)

from rest_framework import serializers
from blogs.models import Blog
from users.serializers.user_serializer import UserSerializer

class BlogSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    content = serializers.CharField(read_only=True)
    author = UserSerializer(read_only=True)
    image = serializers.CharField(read_only=True, allow_null=True, required=False)
    tags = serializers.ListField(child=serializers.CharField(), read_only=True)
    published_at = serializers.DateTimeField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class BlogCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    content = serializers.CharField()
    image = serializers.CharField(required=False, allow_null=True)
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)

    def create(self, validated_data):
        return Blog.objects.create(**validated_data)

class BlogUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False)
    content = serializers.CharField(required=False)
    image = serializers.CharField(required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)

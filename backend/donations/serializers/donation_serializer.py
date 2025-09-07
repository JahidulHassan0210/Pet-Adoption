from rest_framework import serializers
from donations.models import Donation
from posts.serializers.post_serializer import PostSerializer
from users.serializers.user_serializer import UserSerializer

class DonationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    post = PostSerializer(read_only=True)
    donor = UserSerializer(read_only=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    payment_method = serializers.CharField(read_only=True)
    reference_id = serializers.CharField(read_only=True)
    message = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    receipt_image = serializers.CharField(read_only=True)
    is_manual = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    verified_at = serializers.DateTimeField(read_only=True)

class DonationCreateSerializer(serializers.Serializer):
    post_id = serializers.CharField(required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.CharField(max_length=100)
    reference_id = serializers.CharField(max_length=255, required=False)

class DonationUpdateSerializer(serializers.Serializer):
    status = serializers.CharField(max_length=20, required=False)

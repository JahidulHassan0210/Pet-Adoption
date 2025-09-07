from rest_framework import serializers
from badges.models import Badge, UserBadge, UserContribution
from users.serializers.user_serializer import UserProfileSerializer

class BadgeSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)
    icon = serializers.CharField(max_length=255, required=False, allow_blank=True)
    criteria = serializers.CharField(required=False, allow_blank=True)
    category = serializers.ChoiceField(choices=['adoption', 'donation', 'community', 'volunteer'], default='community')
    points_required = serializers.IntegerField(default=0, min_value=0)
    created_at = serializers.DateTimeField(read_only=True)

class UserBadgeSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user = UserProfileSerializer(read_only=True)
    badge = BadgeSerializer(read_only=True)
    assigned_at = serializers.DateTimeField(read_only=True)

class UserContributionSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user = UserProfileSerializer(read_only=True)
    contribution_type = serializers.ChoiceField(choices=['adoption', 'donation', 'item_donation', 'blog_post', 'volunteer'])
    contribution_id = serializers.CharField()
    points_earned = serializers.IntegerField(default=0, min_value=0)
    description = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(read_only=True)

class BadgeAssignmentSerializer(serializers.Serializer):
    user = serializers.CharField(required=True)
    badge = serializers.CharField(required=True)

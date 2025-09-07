from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from badges.models import Badge, UserBadge, UserContribution
from badges.serializers.badge_serializer import BadgeSerializer, UserBadgeSerializer
from users.models import User
from utils.jwt_auth import get_user_from_token

@api_view(['GET'])
@permission_classes([AllowAny])
def get_badges(request):
    try:
        category = request.GET.get('category')
        limit = int(request.GET.get('limit', 50))
        
        query = Badge.objects
        if category:
            query = query.filter(category=category)
        
        badges = query.order_by('name').limit(limit)
        serializer = BadgeSerializer(badges, many=True)
        
        return Response({
            'data': serializer.data,
            'total': len(serializer.data),
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_badge_detail(request, badge_id):
    try:
        badge = Badge.objects.get(id=badge_id)
        serializer = BadgeSerializer(badge)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Badge.DoesNotExist:
        return Response({'error': 'Badge not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_badges(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user_badges = UserBadge.objects(user=user).order_by('-assigned_at')
        serializer = UserBadgeSerializer(user_badges, many=True)
        
        return Response({
            'data': serializer.data,
            'total': len(serializer.data),
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_badges_public(request, user_id):
    try:
        user_badges = UserBadge.objects(user=user_id).order_by('-assigned_at')
        serializer = UserBadgeSerializer(user_badges, many=True)
        
        return Response({
            'data': serializer.data,
            'total': len(serializer.data),
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def assign_badge(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_staff:
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user_id')
        badge_id = request.data.get('badge_id')
        
        if not all([user_id, badge_id]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_user = User.objects.get(id=user_id)
            badge = Badge.objects.get(id=badge_id)
        except (User.DoesNotExist, Badge.DoesNotExist):
            return Response({'error': 'User or badge not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user already has this badge
        existing_badge = UserBadge.objects(user=target_user, badge=badge).first()
        if existing_badge:
            return Response({'error': 'User already has this badge'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Assign badge
        user_badge = UserBadge(user=target_user, badge=badge)
        user_badge.save()
        
        return Response({
            'data': UserBadgeSerializer(user_badge).data,
            'message': 'Badge assigned successfully',
            'success': True
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def record_contribution(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        contribution_type = request.data.get('contribution_type')
        contribution_id = request.data.get('contribution_id')
        points = request.data.get('points', 0)
        description = request.data.get('description', '')
        
        if not all([contribution_type, contribution_id]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create contribution record
        contribution = UserContribution(
            user=user,
            contribution_type=contribution_type,
            contribution_id=contribution_id,
            points_earned=points,
            description=description
        )
        contribution.save()
        
        # Check for badge eligibility
        check_badge_eligibility(user.id)
        
        return Response({
            'data': {
                'contribution_id': str(contribution.id),
                'points_earned': points,
                'total_points': UserContribution.get_user_points(user.id)
            },
            'message': 'Contribution recorded successfully',
            'success': True
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def check_badge_eligibility(user_id):
    """Check if user is eligible for any new badges based on their contributions"""
    try:
        user = User.objects.get(id=user_id)
        user_points = UserContribution.get_user_points(user_id)
        
        # Get all badges
        all_badges = Badge.objects.all()
        
        for badge in all_badges:
            # Check if user already has this badge
            existing_badge = UserBadge.objects(user=user, badge=badge).first()
            if existing_badge:
                continue
            
            # Check if user meets criteria
            if badge.points_required and user_points >= badge.points_required:
                # Auto-assign badge
                user_badge = UserBadge(user=user, badge=badge)
                user_badge.save()
                print(f"Auto-assigned badge '{badge.name}' to user {user.username}")
        
        # Check specific contribution-based badges
        check_contribution_badges(user_id)
        
    except Exception as e:
        print(f"Error checking badge eligibility: {e}")

def check_contribution_badges(user_id):
    """Check for badges based on specific contribution types"""
    try:
        user = User.objects.get(id=user_id)
        
        # Check adoption badges
        adoption_count = UserContribution.objects(user=user, contribution_type='adoption').count()
        if adoption_count >= 1:
            assign_badge_if_eligible(user, 'pet-guardian')
        if adoption_count >= 5:
            assign_badge_if_eligible(user, 'super-helper')
        
        # Check donation badges
        donation_contributions = UserContribution.objects(user=user, contribution_type='donation')
        total_donation_points = sum(c.points_earned for c in donation_contributions)
        if total_donation_points >= 500:
            assign_badge_if_eligible(user, 'generous-donor')
        
        # Check item donation badges
        item_count = UserContribution.objects(user=user, contribution_type='item_donation').count()
        if item_count >= 10:
            assign_badge_if_eligible(user, 'item-supporter')
        
        # Check community badges
        blog_count = UserContribution.objects(user=user, contribution_type='blog_post').count()
        if blog_count >= 5:
            assign_badge_if_eligible(user, 'community-leader')
        
    except Exception as e:
        print(f"Error checking contribution badges: {e}")

def assign_badge_if_eligible(user, badge_name):
    """Assign a badge to a user if they don't already have it"""
    try:
        badge = Badge.objects.get(name__icontains=badge_name)
        existing_badge = UserBadge.objects(user=user, badge=badge).first()
        
        if not existing_badge:
            user_badge = UserBadge(user=user, badge=badge)
            user_badge.save()
            print(f"Auto-assigned badge '{badge.name}' to user {user.username}")
            
    except Badge.DoesNotExist:
        pass
    except Exception as e:
        print(f"Error assigning badge: {e}")

@api_view(['POST'])
@permission_classes([AllowAny])
def record_contribution(request):
    """Record a user contribution and check for badge eligibility"""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        contribution_type = request.data.get('contribution_type')
        contribution_id = request.data.get('contribution_id')
        points_earned = request.data.get('points_earned', 0)
        description = request.data.get('description', '')
        
        if not all([contribution_type, contribution_id]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create contribution record
        contribution = UserContribution(
            user=user,
            contribution_type=contribution_type,
            contribution_id=contribution_id,
            points_earned=points_earned,
            description=description
        )
        contribution.save()
        
        # Check for badge eligibility
        check_badge_eligibility(str(user.id))
        
        return Response({
            'data': {
                'contribution_id': str(contribution.id),
                'points_earned': points_earned,
                'message': 'Contribution recorded successfully'
            },
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_stats(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        total_points = UserContribution.get_user_points(user.id)
        badge_count = UserBadge.objects(user=user).count()
        
        # Get contribution counts by type
        contribution_stats = {}
        for contribution_type in ['adoption', 'donation', 'item_donation', 'blog_post', 'volunteer']:
            count = UserContribution.objects(user=user, contribution_type=contribution_type).count()
            contribution_stats[contribution_type] = count
        
        return Response({
            'data': {
                'total_points': total_points,
                'badge_count': badge_count,
                'contribution_stats': contribution_stats
            },
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

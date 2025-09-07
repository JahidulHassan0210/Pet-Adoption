from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from donations.models import Donation
from donations.serializers.donation_serializer import DonationSerializer, DonationCreateSerializer
from posts.models import Post
from users.models import User
from utils.jwt_auth import get_user_from_token
import uuid
import os
from django.conf import settings

@api_view(['GET'])
@permission_classes([AllowAny])
def get_donations(request):
    try:
        post_id = request.GET.get('post_id')
        status_filter = request.GET.get('status', 'all')
        limit = int(request.GET.get('limit', 20))
        
        query = Donation.objects
        if post_id:
            query = query.filter(post=post_id)
        if status_filter != 'all':
            query = query.filter(status=status_filter)
        
        donations = query.order_by('-created_at').limit(limit)
        serializer = DonationSerializer(donations, many=True)
        
        return Response({
            'data': serializer.data,
            'total': len(serializer.data),
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_donation_detail(request, donation_id):
    try:
        donation = Donation.objects.get(id=donation_id)
        serializer = DonationSerializer(donation)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Donation.DoesNotExist:
        return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_donation(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Validate input data using serializer
        serializer = DonationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        post_id = serializer.validated_data.get('post_id')
        amount = serializer.validated_data.get('amount')
        payment_method = serializer.validated_data.get('payment_method')
        reference_id = serializer.validated_data.get('reference_id', '')
        message = request.data.get('message', '')
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not post.donations_enabled:
            return Response({'error': 'Donations are currently disabled for this post'}, status=status.HTTP_400_BAD_REQUEST)
        
        if post.type != 'donation':
            return Response({'error': 'This post does not accept donations'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create donation with auto-verification
        donation = Donation(
            post=post,
            donor=user,
            amount=amount,
            payment_method=payment_method,
            reference_id=reference_id,
            message=message,
            status='verified'  # Auto-verify the donation
        )
        donation.save()
        
        # Update the post's current donation amount
        post.update_donation_amount(amount)
        
        return Response({
            'data': DonationSerializer(donation).data,
            'message': 'Donation completed successfully! Your contribution has been added to the pet\'s funding.',
            'success': True
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_donation_auto_verify(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Validate input data using serializer
        serializer = DonationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        post_id = serializer.validated_data.get('post_id')
        amount = serializer.validated_data.get('amount')
        payment_method = serializer.validated_data.get('payment_method')
        message = request.data.get('message', '')
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not post.donations_enabled:
            return Response({'error': 'Donations are currently disabled for this post'}, status=status.HTTP_400_BAD_REQUEST)
        
        if post.type != 'donation':
            return Response({'error': 'This post does not accept donations'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate a unique reference ID for demo purposes
        reference_id = f"DEMO_{uuid.uuid4().hex[:8].upper()}"
        
        # Create donation with auto-verification
        donation = Donation(
            post=post,
            donor=user,
            amount=amount,
            payment_method=payment_method,
            reference_id=reference_id,
            message=message,
            status='verified'  # Auto-verify the donation
        )
        donation.save()
        
        # Update the post's current donation amount
        post.update_donation_amount(amount)
        
        return Response({
            'data': DonationSerializer(donation).data,
            'message': 'Donation completed successfully! Your contribution has been added to the pet\'s funding.',
            'success': True
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_donation(request, donation_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_staff:
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        
        action = request.data.get('action')
        if action not in ['verify', 'reject']:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            donation = Donation.objects.get(id=donation_id)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if action == 'verify':
            donation.verify(user)
            message = 'Donation verified successfully'
        else:
            donation.reject(user)
            message = 'Donation rejected'
        
        return Response({
            'data': DonationSerializer(donation).data,
            'message': message,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_donations(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        donations = Donation.objects(donor=user).order_by('-created_at')
        serializer = DonationSerializer(donations, many=True)
        
        return Response({
            'data': serializer.data,
            'total': len(serializer.data),
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_post_donations(request, post_id):
    try:
        donations = Donation.objects(post=post_id, status='verified').order_by('-created_at')
        serializer = DonationSerializer(donations, many=True)
        
        total_amount = sum(d.amount for d in donations)
        
        return Response({
            'data': serializer.data,
            'total_amount': float(total_amount),
            'total_donations': len(serializer.data),
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_manual_donation(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        post_id = request.data.get('post_id')
        amount = request.data.get('amount')
        message = request.data.get('message', '')
        receipt_image = request.FILES.get('receipt_image')
        
        if not post_id or not amount:
            return Response({'error': 'Post ID and amount are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not receipt_image:
            return Response({'error': 'Receipt image is required for manual donations'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not post.donations_enabled:
            return Response({'error': 'Donations are currently disabled for this post'}, status=status.HTTP_400_BAD_REQUEST)
        
        if post.type != 'donation':
            return Response({'error': 'This post does not accept donations'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save receipt image
        receipt_path = None
        if receipt_image:
            try:
                media_dir = os.path.join(settings.BASE_DIR, 'media', 'receipts')
                os.makedirs(media_dir, exist_ok=True)
                
                file_extension = os.path.splitext(receipt_image.name)[1]
                filename = f"{uuid.uuid4()}{file_extension}"
                file_path = os.path.join(media_dir, filename)
                
                with open(file_path, 'wb+') as destination:
                    for chunk in receipt_image.chunks():
                        destination.write(chunk)
                
                receipt_path = f"receipts/{filename}"
            except Exception as e:
                return Response({'error': f'Failed to save receipt image: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Create manual donation with pending status
        donation = Donation(
            post=post,
            donor=user,
            amount=float(amount),
            payment_method='manual',
            reference_id=f"MANUAL_{uuid.uuid4().hex[:8].upper()}",
            message=message,
            status='pending',  # Manual donations need admin approval
            receipt_image=receipt_path,
            is_manual=True
        )
        donation.save()
        
        return Response({
            'data': DonationSerializer(donation).data,
            'message': 'Manual donation submitted successfully. It will be reviewed by an admin.',
            'success': True
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_pending_manual_donations(request):
    """Get all pending manual donations for admin review"""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        donations = Donation.objects.filter(
            is_manual=True,
            status='pending'
        ).order_by('-created_at')
        
        serializer = DonationSerializer(donations, many=True)
        
        return Response({
            'data': serializer.data,
            'total': len(serializer.data),
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([AllowAny])
def review_manual_donation(request, donation_id):
    """Approve or reject a manual donation"""
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        donation = Donation.objects.get(id=donation_id)
        
        if not donation.is_manual:
            return Response({'error': 'This is not a manual donation'}, status=status.HTTP_400_BAD_REQUEST)
        
        if donation.status != 'pending':
            return Response({'error': 'This donation has already been reviewed'}, status=status.HTTP_400_BAD_REQUEST)
        
        action = request.data.get('action')  # 'approve' or 'reject'
        admin_notes = request.data.get('admin_notes', '')
        
        if action == 'approve':
            donation.verify(user)
            message = 'Donation approved successfully'
        elif action == 'reject':
            donation.reject(user)
            message = 'Donation rejected'
        else:
            return Response({'error': 'Invalid action. Use "approve" or "reject"'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add admin notes if provided
        if admin_notes:
            donation.message = f"{donation.message or ''}\n\nAdmin Notes: {admin_notes}".strip()
            donation.save()
        
        return Response({
            'data': DonationSerializer(donation).data,
            'message': message,
            'success': True
        })
    except Donation.DoesNotExist:
        return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

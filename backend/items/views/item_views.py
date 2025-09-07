from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from items.models import Item, Store, Product, Order, VolunteerDonation
from items.serializers.item_serializer import ItemSerializer, StoreSerializer, ProductSerializer, OrderSerializer
from users.models import User
from utils.jwt_auth import get_user_from_token
import os
import uuid
from django.conf import settings
from datetime import datetime

@api_view(['GET'])
@permission_classes([AllowAny])
def get_items(request):
    try:
        items = Item.objects.filter(status='available').order_by('-created_at')
        serializer = ItemSerializer(items, many=True)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_item(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        data = request.data.copy()
        serializer = ItemSerializer(data=data, context={'user': user})
        if serializer.is_valid():
            item = serializer.save()
            return Response({
                'data': ItemSerializer(item).data,
                'message': 'Item created successfully',
                'success': True
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def claim_item(request, item_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        item = Item.objects.get(id=item_id)
        if item.is_claimed:
            return Response({'error': 'Item is already claimed'}, status=status.HTTP_400_BAD_REQUEST)
        
        item.is_claimed = True
        item.claimed_by = user
        item.claimed_at = datetime.utcnow()
        item.status = 'claimed'
        item.save()
        
        return Response({
            'data': ItemSerializer(item).data,
            'message': 'Item claimed successfully',
            'success': True
        })
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_stores(request):
    try:
        stores = Store.objects.filter(is_active=True).order_by('-created_at')
        serializer = StoreSerializer(stores, many=True)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_products(request):
    try:
        products = Product.objects.filter(is_active=True).order_by('-created_at')
        serializer = ProductSerializer(products, many=True)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_store(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Allow all authenticated users to create stores
        # if not user.is_staff:
        #     return Response({'error': 'Only staff members can create stores'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        serializer = StoreSerializer(data=data, context={'user': user})
        if serializer.is_valid():
            store = serializer.save()
            return Response({
                'data': StoreSerializer(store).data,
                'message': 'Store created successfully',
                'success': True
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_store(request, store_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        store = Store.objects.get(id=store_id)
        if str(store.owner.id) != str(user.id) and not user.is_staff:
            return Response({'error': 'Not authorized to update this store'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        serializer = StoreSerializer(store, data=data, partial=True)
        if serializer.is_valid():
            updated_store = serializer.save()
            return Response({
                'data': StoreSerializer(updated_store).data,
                'message': 'Store updated successfully',
                'success': True
            })
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Store.DoesNotExist:
        return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_store(request, store_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        store = Store.objects.get(id=store_id)
        if str(store.owner.id) != str(user.id) and not user.is_staff:
            return Response({'error': 'Not authorized to delete this store'}, status=status.HTTP_403_FORBIDDEN)
        
        store.delete()
        return Response({'message': 'Store deleted successfully', 'success': True})
    except Store.DoesNotExist:
        return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_store_products(request, store_id):
    try:
        products = Product.objects.filter(store=store_id, is_active=True).order_by('-created_at')
        serializer = ProductSerializer(products, many=True)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_product(request, store_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        store = Store.objects.get(id=store_id)
        if str(store.owner.id) != str(user.id) and not user.is_staff:
            return Response({'error': 'Not authorized to add products to this store'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        data['store'] = store_id
        
        serializer = ProductSerializer(data=data, context={'user': user})
        if serializer.is_valid():
            product = serializer.save()
            return Response({
                'data': ProductSerializer(product).data,
                'message': 'Product created successfully',
                'success': True
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Store.DoesNotExist:
        return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_product(request, product_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        product = Product.objects.get(id=product_id)
        store = Store.objects.get(id=product.store.id)
        
        if str(store.owner.id) != str(user.id) and not user.is_staff:
            return Response({'error': 'Not authorized to update this product'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        serializer = ProductSerializer(product, data=data, partial=True)
        if serializer.is_valid():
            updated_product = serializer.save()
            return Response({
                'data': ProductSerializer(updated_product).data,
                'message': 'Product updated successfully',
                'success': True
            })
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_product(request, product_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        product = Product.objects.get(id=product_id)
        store = Store.objects.get(id=product.store.id)
        
        if str(store.owner.id) != str(user.id) and not user.is_staff:
            return Response({'error': 'Not authorized to delete this product'}, status=status.HTTP_403_FORBIDDEN)
        
        product.delete()
        return Response({'message': 'Product deleted successfully', 'success': True})
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request, store_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        data = request.data.copy()
        data['store'] = store_id
        
        serializer = OrderSerializer(data=data, context={'user': user})
        if serializer.is_valid():
            order = serializer.save()
            return Response({
                'data': OrderSerializer(order).data,
                'message': 'Order created successfully',
                'success': True
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_orders(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        orders = Order.objects.filter(user=user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response({
            'data': serializer.data,
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_order_status(request, order_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_staff:
            return Response({'error': 'Only staff members can update order status'}, status=status.HTTP_403_FORBIDDEN)
        
        order = Order.objects.get(id=order_id)
        new_status = request.data.get('status')
        
        if new_status not in ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        
        return Response({
            'data': OrderSerializer(order).data,
            'message': 'Order status updated successfully',
            'success': True
        })
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_volunteer_donation(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        required_fields = ['item_type', 'description', 'pickup_location', 'contact_number']
        for field in required_fields:
            if not request.data.get(field):
                return Response({'error': f'{field} is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        donation = VolunteerDonation(
            donor=user,
            item_type=request.data['item_type'],
            description=request.data['description'],
            quantity=request.data.get('quantity', ''),
            estimated_value=float(request.data.get('estimated_value', 0)) if request.data.get('estimated_value') else None,
            pickup_location=request.data['pickup_location'],
            contact_number=request.data['contact_number'],
            available_times=request.data.get('available_times', ''),
            special_instructions=request.data.get('special_instructions', '')
        )
        donation.save()
        
        return Response({
            'data': {
                'id': donation.id,
                'item_type': donation.item_type,
                'description': donation.description,
                'status': donation.status,
                'created_at': donation.created_at.isoformat()
            },
            'message': 'Volunteer donation created successfully. A volunteer will contact you soon.',
            'success': True
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_volunteer_donations(request):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # If staff, show all donations, otherwise show only user's donations
        if user.is_staff:
            donations = VolunteerDonation.objects.all().order_by('-created_at')
        else:
            donations = VolunteerDonation.objects(donor=user).order_by('-created_at')
        
        data = []
        for donation in donations:
            data.append({
                'id': donation.id,
                'donor': {
                    'id': donation.donor.id,
                    'username': donation.donor.username,
                    'email': donation.donor.email
                },
                'item_type': donation.item_type,
                'description': donation.description,
                'quantity': donation.quantity,
                'estimated_value': float(donation.estimated_value) if donation.estimated_value else None,
                'pickup_location': donation.pickup_location,
                'contact_number': donation.contact_number,
                'available_times': donation.available_times,
                'special_instructions': donation.special_instructions,
                'status': donation.status,
                'assigned_volunteer': {
                    'id': donation.assigned_volunteer.id,
                    'username': donation.assigned_volunteer.username,
                    'email': donation.assigned_volunteer.email
                } if donation.assigned_volunteer else None,
                'created_at': donation.created_at.isoformat(),
                'updated_at': donation.updated_at.isoformat()
            })
        
        return Response({
            'data': data,
            'total': len(data),
            'success': True
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([AllowAny])
def assign_volunteer_donation(request, donation_id):
    try:
        user = get_user_from_token(request)
        if not user or not user.is_staff:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        donation = VolunteerDonation.objects.get(id=donation_id)
        volunteer_id = request.data.get('volunteer_id')
        
        if volunteer_id:
            volunteer = User.objects.get(id=volunteer_id)
            donation.assigned_volunteer = volunteer
            donation.status = 'assigned'
            donation.assigned_at = datetime.utcnow()
        else:
            donation.assigned_volunteer = None
            donation.status = 'pending'
            donation.assigned_at = None
        
        donation.save()
        
        return Response({
            'message': 'Volunteer assignment updated successfully',
            'success': True
        })
    except VolunteerDonation.DoesNotExist:
        return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'Volunteer not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_volunteer_donation_status(request, donation_id):
    try:
        user = get_user_from_token(request)
        if not user:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        donation = VolunteerDonation.objects.get(id=donation_id)
        
        # Only staff or assigned volunteer can update status
        if not user.is_staff and str(donation.assigned_volunteer.id) != str(user.id):
            return Response({'error': 'Not authorized to update this donation'}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status not in ['pending', 'assigned', 'collected', 'completed']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        donation.status = new_status
        if new_status == 'collected':
            donation.collected_at = datetime.utcnow()
        
        donation.save()
        
        return Response({
            'message': 'Donation status updated successfully',
            'success': True
        })
    except VolunteerDonation.DoesNotExist:
        return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

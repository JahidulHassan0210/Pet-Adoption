from rest_framework import serializers
from items.models import Item, Store, Product, Order
from users.serializers.user_serializer import UserSerializer
from decimal import Decimal

class ItemSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    post = serializers.CharField()
    donor = UserSerializer(read_only=True)
    item_type = serializers.ChoiceField(choices=['food', 'toy'])
    item_name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    quantity = serializers.IntegerField(min_value=1)
    image = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(read_only=True)
    is_claimed = serializers.BooleanField(read_only=True)
    claimed_by = UserSerializer(read_only=True)
    claimed_at = serializers.DateTimeField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        donor = self.context.get('user')
        if not donor:
            raise serializers.ValidationError("User is required")
        
        validated_data['donor'] = donor
        item = Item(**validated_data)
        item.save()
        return item

class StoreSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    owner = UserSerializer(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        owner = self.context.get('user')
        if not owner:
            raise serializers.ValidationError("User is required")
        
        validated_data['owner'] = owner
        store = Store(**validated_data)
        store.save()
        return store

class ProductSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    store = serializers.CharField()
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.ChoiceField(choices=['food', 'toy', 'accessory'])
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    stock_quantity = serializers.CharField(max_length=100, required=False, allow_blank=True)
    image = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        store_owner = self.context.get('user')
        if not store_owner:
            raise serializers.ValidationError("User is required")
        product = Product(**validated_data)
        product.save()
        return product

class OrderSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)
    store = serializers.CharField()
    products = serializers.ListField(child=serializers.CharField())
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    status = serializers.CharField(read_only=True)
    shipping_address = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        user = self.context.get('user')
        if not user:
            raise serializers.ValidationError("User is required")
        
        validated_data['user'] = user
        order = Order(**validated_data)
        order.save()
        return order

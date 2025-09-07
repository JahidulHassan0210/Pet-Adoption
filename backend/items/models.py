from mongoengine import Document, StringField, DateTimeField, ReferenceField, BooleanField, DecimalField
from users.models import User
import uuid
from datetime import datetime

class Item(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    title = StringField(required=True, max_length=255)
    description = StringField()
    item_type = StringField(choices=['food', 'toy', 'accessory'], required=True)
    donor = ReferenceField(User, required=True)
    location = StringField(max_length=255)
    contact_info = StringField(max_length=255)
    status = StringField(choices=['available', 'claimed', 'collected'], default='available')
    claimed_by = ReferenceField(User)
    claimed_at = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'items',
        'indexes': [
            'donor',
            'item_type',
            'status',
            'created_at'
        ]
    }
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

class VolunteerDonation(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    donor = ReferenceField(User, required=True)
    item_type = StringField(choices=['food', 'toys', 'accessories', 'mixed'], required=True)
    description = StringField(required=True)
    quantity = StringField(max_length=100)  # e.g., "5 bags", "10 pieces"
    estimated_value = DecimalField(precision=2)  # Optional estimated value
    pickup_location = StringField(required=True, max_length=500)
    contact_number = StringField(required=True, max_length=50)
    available_times = StringField(max_length=500)  # When donor is available
    special_instructions = StringField(max_length=1000)
    status = StringField(choices=['pending', 'assigned', 'collected', 'completed'], default='pending')
    assigned_volunteer = ReferenceField(User)
    assigned_at = DateTimeField()
    collected_at = DateTimeField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'volunteer_donations',
        'indexes': [
            'donor',
            'status',
            'item_type',
            'assigned_volunteer',
            'created_at'
        ]
    }
    
    def __str__(self):
        return f"{self.item_type} donation by {self.donor.username}"
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

class Store(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    name = StringField(required=True, max_length=255)
    description = StringField()
    owner = ReferenceField(User, required=True)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'stores',
        'indexes': [
            'owner',
            'is_active',
            'created_at'
        ]
    }
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

class Product(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    store = ReferenceField(Store, required=True)
    name = StringField(required=True, max_length=255)
    description = StringField()
    price = DecimalField(required=True, precision=2)
    category = StringField(choices=['food', 'toy', 'accessory'], required=True)
    stock_quantity = StringField(max_length=100)
    image_url = StringField()
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'products',
        'indexes': [
            'store',
            'category',
            'is_active',
            'created_at'
        ]
    }
    
    def __str__(self):
        return f"{self.name} - {self.store.name}"
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

class Order(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    store = ReferenceField(Store, required=True)
    customer = ReferenceField(User, required=True)
    products = StringField()  # JSON string of products and quantities
    total_amount = DecimalField(required=True, precision=2)
    status = StringField(choices=['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default='pending')
    shipping_address = StringField(required=True)
    contact_number = StringField(required=True)
    order_notes = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'orders',
        'indexes': [
            'store',
            'customer',
            'status',
            'created_at'
        ]
    }
    
    def __str__(self):
        return f"Order {self.id} - ${self.total_amount}"
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
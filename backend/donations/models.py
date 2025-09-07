from mongoengine import Document, StringField, DecimalField, DateTimeField, ReferenceField, BooleanField
from users.models import User
from posts.models import Post
import uuid
from datetime import datetime

class Donation(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    post = ReferenceField(Post, required=True)
    donor = ReferenceField(User, required=True)
    amount = DecimalField(required=True, precision=2)
    payment_method = StringField(max_length=100, required=True)
    reference_id = StringField(max_length=255, required=True)
    message = StringField(max_length=500)
    status = StringField(max_length=20, choices=['pending', 'verified', 'rejected'], default='verified')
    verified_by = ReferenceField(User)
    verified_at = DateTimeField()
    receipt_image = StringField()  # Store receipt image path
    is_manual = BooleanField(default=False)  # Distinguish manual donations
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'donations',
        'indexes': [
            'post',
            'donor',
            'status',
            'created_at'
        ]
    }
    
    def __str__(self):
        return f"${self.amount} donation by {self.donor.username}"
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        
        if self.status == 'verified' and not self.verified_at:
            self.verified_at = datetime.utcnow()
            if not self.verified_by:
                self.verified_by = self.donor
        
        return super().save(*args, **kwargs)
    
    def verify(self, verified_by_user):
        self.status = 'verified'
        self.verified_by = verified_by_user
        self.verified_at = datetime.utcnow()
        self.save()
        
        post = self.post
        if post:
            post.update_donation_amount(self.amount)
    
    def reject(self, verified_by_user):
        self.status = 'rejected'
        self.verified_by = verified_by_user
        self.verified_at = datetime.utcnow()
        self.save()

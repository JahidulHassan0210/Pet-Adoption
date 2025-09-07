from mongoengine import Document, StringField, IntField, DecimalField, DateTimeField, ReferenceField, ListField, BooleanField
from users.models import User
import uuid
from datetime import datetime
from decimal import Decimal

class Post(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    user = ReferenceField(User, required=True)
    type = StringField(required=True, choices=['adoption', 'donation'])
    title = StringField(required=True, max_length=255)
    description = StringField()
    pet_type = StringField(max_length=100)
    pet_age = IntField()
    pet_size = StringField(max_length=50, choices=['small', 'medium', 'large'])
    pet_species = StringField(max_length=100)
    donation_goal = DecimalField(precision=2)
    current_amount = DecimalField(precision=2, default=Decimal('0.00'))
    status = StringField(max_length=20, choices=['active', 'completed', 'cancelled'], default='active')
    donations_enabled = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'posts',
        'indexes': [
            'user',
            'type',
            'status',
            'pet_type',
            'created_at'
        ]
    }
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        
        if self.type == 'donation' and self.donation_goal:
            if self.current_amount and self.current_amount >= self.donation_goal:
                self.donations_enabled = False
                self.status = 'completed'
        
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    def update_donation_amount(self, amount):
        self.current_amount += amount
        if self.donation_goal and self.current_amount >= self.donation_goal:
            self.donations_enabled = False
            self.status = 'completed'
        self.save()

class PostImage(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    post = ReferenceField(Post, required=True)
    image_url = StringField(required=True, max_length=255)
    caption = StringField()
    uploaded_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'post_images',
        'indexes': [
            'post',
            'uploaded_at'
        ]
    }
    
    def __str__(self):
        return f"Image for {self.post.title}"
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        return super().save(*args, **kwargs)

class PostUpdate(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    post = ReferenceField(Post, required=True)
    user = ReferenceField(User, required=True)
    update_text = StringField()
    new_images = ListField(StringField())
    update_type = StringField(choices=['text', 'image', 'both'], default='text')
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'post_updates',
        'indexes': [
            'post',
            'user',
            'created_at'
        ]
    }
    
    def __str__(self):
        return f"Update for {self.post.title}"
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        return super().save(*args, **kwargs)

class Comment(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    post = ReferenceField(Post, required=True)
    user = ReferenceField(User, required=True)
    content = StringField(required=True, max_length=1000)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'comments',
        'indexes': [
            'post',
            'user',
            'created_at'
        ]
    }
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.title}"
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

class Bookmark(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    user = ReferenceField(User, required=True)
    post = ReferenceField(Post, required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'bookmarks',
        'indexes': [
            'user',
            'post',
            'created_at'
        ]
    }
    
    def __str__(self):
        return f"Bookmark by {self.user.username} for {self.post.title}"
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        return super().save(*args, **kwargs)

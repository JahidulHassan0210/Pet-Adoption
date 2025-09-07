from mongoengine import Document, StringField, DateTimeField, ReferenceField, IntField, ListField
from users.models import User
import uuid
from datetime import datetime

class Badge(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    name = StringField(required=True, max_length=100)
    description = StringField()
    icon = StringField(max_length=255)
    criteria = StringField()
    category = StringField(choices=['adoption', 'donation', 'community', 'volunteer'], default='community')
    points_required = IntField(default=0)
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'badges',
        'indexes': [
            'name',
            'category',
            'created_at'
        ]
    }
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        return super().save(*args, **kwargs)

class UserBadge(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    user = ReferenceField(User, required=True)
    badge = ReferenceField(Badge, required=True)
    assigned_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_badges',
        'indexes': [
            'user',
            'badge',
            'assigned_at'
        ]
    }
    
    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        return super().save(*args, **kwargs)

class UserContribution(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    user = ReferenceField(User, required=True)
    contribution_type = StringField(choices=['adoption', 'donation', 'item_donation', 'blog_post', 'volunteer'], required=True)
    contribution_id = StringField(required=True)
    points_earned = IntField(default=0)
    description = StringField()
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_contributions',
        'indexes': [
            'user',
            'contribution_type',
            'created_at'
        ]
    }
    
    def __str__(self):
        return f"{self.user.username} - {self.contribution_type}"
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        return super().save(*args, **kwargs)
    
    @classmethod
    def get_user_points(cls, user_id):
        contributions = cls.objects(user=user_id)
        return sum(cont.points_earned for cont in contributions)
    
    @classmethod
    def check_badge_eligibility(cls, user_id, badge):
        user_points = cls.get_user_points(user_id)
        return user_points >= badge.points_required

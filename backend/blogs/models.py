from mongoengine import Document, StringField, DateTimeField, ReferenceField, ListField
from users.models import User
import uuid
from datetime import datetime

class Blog(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    title = StringField(required=True, max_length=255)
    content = StringField()
    author = ReferenceField(User, required=True)
    image = StringField(max_length=255)
    tags = ListField(StringField())
    published_at = DateTimeField(default=datetime.utcnow)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'blogs',
        'indexes': [
            'title',
            'author',
            'published_at',
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

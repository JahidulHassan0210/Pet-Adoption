from mongoengine import Document, StringField, EmailField, DateTimeField, BooleanField
import uuid
from datetime import datetime
from decouple import config
import mongoengine

# Connect to MongoDB when this model is imported
def connect_mongodb():
    try:
        # Check if already connected
        try:
            if mongoengine.connection.get_db():
                return
        except:
            pass
        
        # Set default connection parameters
        mongoengine.connect(
            db=config('DB_NAME', default='pet_adoption_db'),
            host=config('DB_HOST', default='localhost'),
            port=config('DB_PORT', default=27017, cast=int),
            alias='default'
        )
        print(f"✅ Connected to MongoDB: {config('DB_NAME', default='pet_adoption_db')}")
    except Exception as e:
        print(f"⚠️ Warning: Could not connect to MongoDB: {e}")
        print("⚠️ Using mock connection for development")
        try:
            # Create a mock connection for development
            mongoengine.connect(
                db='test_db',
                host='localhost',
                port=27017,
                alias='default'
            )
        except Exception as mock_error:
            print(f"⚠️ Mock connection also failed: {mock_error}")
            print("⚠️ Continuing without database connection...")

# Connect to MongoDB
connect_mongodb()

class User(Document):
    id = StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    username = StringField(required=True, unique=True, max_length=150)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    first_name = StringField(max_length=150)
    last_name = StringField(max_length=150)
    nid_photo = StringField()  # Store file path
    profile_photo = StringField()  # Store file path
    location = StringField(max_length=255)
    bio = StringField(max_length=1000)
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    is_superuser = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'users',
        'indexes': [
            'username',
            'email',
            'created_at'
        ]
    }
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        else:
            return self.username
    
    @property
    def is_authenticated(self):
        return True
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)
    
    @classmethod
    def ensure_indexes(cls):
        """Ensure all indexes are created for the collection"""
        try:
            cls._get_collection().create_index([("username", 1)], unique=True)
            cls._get_collection().create_index([("email", 1)], unique=True)
            cls._get_collection().create_index([("created_at", 1)])
            print("✅ User model indexes created successfully")
        except Exception as e:
            print(f"⚠️ Warning: Could not create indexes: {e}")

# Ensure indexes are created when the model is imported
User.ensure_indexes()

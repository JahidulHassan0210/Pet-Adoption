#!/bin/bash

echo "Setting up Pet Adoption Platform Backend with MongoEngine..."

# Activate virtual environment
source env_site/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Create media directories
echo "Creating media directories..."
mkdir -p media/profile_photos
mkdir -p media/nid_photos
mkdir -p media/post_images
mkdir -p media/receipts
mkdir -p media/item_images
mkdir -p media/blog_images

# Create static directory
mkdir -p staticfiles

# Note: No need for Django migrations with MongoEngine
# The database collections will be created automatically when models are first used

# Create superuser
echo "Creating superuser..."
python manage.py create_superuser

# Create default badges
echo "Creating default badges..."
python manage.py create_badges

echo "Setup complete! You can now run: python manage.py runserver"
echo "Note: This setup uses MongoEngine instead of Django ORM"

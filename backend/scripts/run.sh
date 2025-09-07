#!/bin/bash

echo "Starting Pet Adoption Platform Backend..."

# Activate virtual environment
source env_site/bin/activate

# Run the development server
python manage.py runserver

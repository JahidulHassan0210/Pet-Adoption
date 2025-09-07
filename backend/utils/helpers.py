import uuid
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

def generate_unique_filename(original_filename):
    ext = original_filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    return unique_filename

def save_uploaded_file(uploaded_file, folder_path):
    if uploaded_file:
        filename = generate_unique_filename(uploaded_file.name)
        file_path = f"{folder_path}/{filename}"
        saved_path = default_storage.save(file_path, ContentFile(uploaded_file.read()))
        return saved_path
    return None

def calculate_donation_progress(current_amount, goal_amount):
    if goal_amount and goal_amount > 0:
        return min((current_amount / goal_amount) * 100, 100)
    return 0

def is_donation_goal_reached(current_amount, goal_amount):
    if goal_amount and goal_amount > 0:
        return current_amount >= goal_amount
    return False

# Note: MongoEngine models don't integrate directly with Django admin
# You'll need to create custom admin views or use a different approach
# For now, we'll disable admin registration to avoid errors

# from django.contrib import admin
# from users.models import User

# @admin.register(User)
# class CustomUserAdmin(admin.ModelAdmin):
#     list_display = ['email', 'username', 'first_name', 'last_name', 'location', 'is_active', 'created_at']
#     list_filter = ['is_active', 'is_staff', 'created_at']
#     search_fields = ['email', 'username', 'first_name', 'last_name']
#     ordering = ['-created_at']
    
#     # Note: These fieldsets won't work with MongoEngine models
#     # You'll need to implement custom admin functionality
    
#     def has_add_permission(self, request):
#         return False  # Disable add permission for now
    
#     def has_change_permission(self, request, obj=None):
#         return False  # Disable change permission for now
    
#     def has_delete_permission(self, request, obj=None):
#         return False  # Disable delete permission for now

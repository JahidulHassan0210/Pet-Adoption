# Note: MongoEngine models don't integrate directly with Django admin
# You'll need to create custom admin views or use a different approach
# For now, we'll disable admin registration to avoid errors

# from django.contrib import admin
# from items.models import Item

# @admin.register(Item)
# class ItemAdmin(admin.ModelAdmin):
#     list_display = ['item_name', 'donor', 'post', 'item_type', 'quantity', 'status', 'created_at']
#     list_filter = ['item_type', 'status', 'created_at']
#     search_fields = ['item_name', 'donor__username', 'post__title']
#     ordering = ['-created_at']
#     readonly_fields = ['created_at']
    
#     actions = ['mark_as_claimed', 'mark_as_available']
    
#     def mark_as_claimed(self, request, queryset):
#         updated = queryset.update(status='claimed')
#         self.message_user(request, f'{updated} items were marked as claimed.')
#     mark_as_claimed.short_description = "Mark selected items as claimed"
    
#     def mark_as_available(self, request, queryset):
#         updated = queryset.update(status='available')
#         self.message_user(request, f'{updated} items were marked as available.')
#     mark_as_available.short_description = "Mark selected items as available"

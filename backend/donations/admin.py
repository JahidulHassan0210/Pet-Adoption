# Note: MongoEngine models don't integrate directly with Django admin
# You'll need to create custom admin views or use a different approach
# For now, we'll disable admin registration to avoid errors

# from django.contrib import admin
# from donations.models import Donation

# @admin.register(Donation)
# class DonationAdmin(admin.ModelAdmin):
#     list_display = ['donor', 'post', 'amount', 'payment_method', 'status', 'created_at']
#     list_filter = ['status', 'payment_method', 'created_at']
#     search_fields = ['donor__username', 'post__title', 'reference_id']
#     ordering = ['-created_at']
#     readonly_fields = ['created_at']
    
#     actions = ['verify_donations', 'reject_donations']
    
#     def verify_donations(self, request, queryset):
#         from django.utils import timezone
#         updated = queryset.update(status='verified', verified_at=timezone.now())
#         self.message_user(request, f'{updated} donations were successfully verified.')
#     verify_donations.short_description = "Verify selected donations"
    
#     def reject_donations(self, request, queryset):
#         updated = queryset.update(status='rejected')
#         self.message_user(request, f'{updated} donations were successfully rejected.')
#     reject_donations.short_description = "Reject selected donations"

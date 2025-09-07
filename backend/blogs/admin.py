# Note: MongoEngine models don't integrate directly with Django admin
# You'll need to create custom admin views or use a different approach
# For now, we'll disable admin registration to avoid errors

# from django.contrib import admin
# from blogs.models import Blog

# @admin.register(Blog)
# class BlogAdmin(admin.ModelAdmin):
#     list_display = ['title', 'author', 'published_at', 'created_at']
#     list_filter = ['published_at', 'created_at']
#     search_fields = ['title', 'content', 'author__username']
#     ordering = ['-published_at']
#     readonly_fields = ['created_at', 'updated_at']

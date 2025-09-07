# Note: MongoEngine models don't integrate directly with Django admin
# You'll need to create custom admin views or use a different approach
# For now, we'll disable admin registration to avoid errors

# from django.contrib import admin
# from posts.models import Post, PostImage

# class PostImageInline(admin.TabularInline):
#     model = PostImage
#     extra = 1

# @admin.register(Post)
# class PostAdmin(admin.ModelAdmin):
#     list_display = ['title', 'user', 'type', 'pet_type', 'status', 'created_at']
#     list_filter = ['type', 'status', 'pet_type', 'pet_size', 'created_at']
#     search_fields = ['title', 'description', 'user__username']
#     ordering = ['-created_at']
#     inlines = [PostImageInline]
#     readonly_fields = ['created_at', 'updated_at']

# @admin.register(PostImage)
# class PostImageAdmin(admin.ModelAdmin):
#     list_display = ['post', 'caption', 'uploaded_at']
#     list_filter = ['uploaded_at']
#     search_fields = ['post__title', 'caption']
#     ordering = ['-uploaded_at']

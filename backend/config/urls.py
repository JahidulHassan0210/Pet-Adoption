from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/auth/', include('users.urls')),
    path('api/users/', include('users.urls')),
    path('api/badges/', include('badges.urls')),
    path('api/blogs/', include('blogs.urls')),
    path('api/posts/', include('posts.urls')),
    path('api/pets/', include('posts.urls')),  # Map pets to posts for frontend compatibility
    path('api/donations/', include('donations.urls')),
    path('api/items/', include('items.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

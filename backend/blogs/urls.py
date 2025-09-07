from django.urls import path
from blogs.views import blog_views

urlpatterns = [
    path('', blog_views.list_blogs, name='list_blogs'),
    path('create/', blog_views.create_blog, name='create_blog'),
    path('<str:blog_id>/', blog_views.get_blog_detail, name='get_blog_detail'),
    path('<str:blog_id>/update/', blog_views.update_blog, name='update_blog'),
    path('<str:blog_id>/delete/', blog_views.delete_blog, name='delete_blog'),
]

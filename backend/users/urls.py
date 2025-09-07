from django.urls import path
from users.views import auth_views, profile_views, user_views

urlpatterns = [
    path('test/', auth_views.test_connection, name='test_connection'),
    path('register/', auth_views.user_register, name='user_register'),
    path('login/', auth_views.user_login, name='user_login'),
    path('logout/', auth_views.user_logout, name='user_logout'),
    path('profile/', profile_views.get_profile, name='get_profile'),
    path('profile/update/', profile_views.update_profile, name='update_profile'),
    path('password/change/', profile_views.change_password, name='password_change'),
    path('upload-photo/', profile_views.upload_photo, name='upload_photo'),
    path('admin/users/', user_views.get_all_users, name='get_all_users'),
    path('admin/users/<str:user_id>/', user_views.delete_user, name='delete_user'),
    path('admin/users/<str:user_id>/toggle-status/', user_views.toggle_user_status, name='toggle_user_status'),
    path('admin/posts/', user_views.get_all_posts, name='get_all_posts'),
    path('admin/posts/<str:post_id>/', user_views.admin_delete_post, name='admin_delete_post'),
    path('admin/comments/', user_views.get_all_comments, name='get_all_comments'),
    path('admin/comments/<str:comment_id>/', user_views.admin_delete_comment, name='admin_delete_comment'),
]

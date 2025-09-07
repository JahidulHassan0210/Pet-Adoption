from django.urls import path
from posts.views.post_views import (
    get_posts,
    get_post_detail,
    create_post,
    update_post,
    edit_post,
    get_post_updates,
    delete_post,
    get_post_comments,
    create_comment,
    delete_comment,
    toggle_bookmark,
    get_user_bookmarks,
    check_bookmark_status
)

urlpatterns = [
    path('', get_posts, name='get_posts'),
    path('create/', create_post, name='create_post'),
    path('<str:post_id>/', get_post_detail, name='get_post_detail'),
    path('<str:post_id>/update/', update_post, name='update_post'),
    path('<str:post_id>/edit/', edit_post, name='edit_post'),
    path('<str:post_id>/updates/', get_post_updates, name='get_post_updates'),
    path('<str:post_id>/delete/', delete_post, name='delete_post'),
    path('<str:post_id>/comments/', get_post_comments, name='get_post_comments'),
    path('<str:post_id>/comment/', create_comment, name='create_comment'),
    path('comments/<str:comment_id>/delete/', delete_comment, name='delete_comment'),
    path('<str:post_id>/bookmark/', toggle_bookmark, name='toggle_bookmark'),
    path('bookmarks/', get_user_bookmarks, name='get_user_bookmarks'),
    path('<str:post_id>/bookmark-status/', check_bookmark_status, name='check_bookmark_status'),
]

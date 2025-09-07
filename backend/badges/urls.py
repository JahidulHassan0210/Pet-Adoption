from django.urls import path
from badges.views.badge_views import (
    get_badges,
    get_badge_detail,
    get_user_badges,
    get_user_badges_public,
    assign_badge,
    record_contribution,
    get_user_stats
)

urlpatterns = [
    path('', get_badges, name='get_badges'),
    path('<str:badge_id>/', get_badge_detail, name='get_badge_detail'),
    path('user/', get_user_badges, name='get_user_badges'),
    path('user/<str:user_id>/', get_user_badges_public, name='get_user_badges_public'),
    path('assign/', assign_badge, name='assign_badge'),
    path('contribution/', record_contribution, name='record_contribution'),
    path('stats/', get_user_stats, name='get_user_stats'),
]

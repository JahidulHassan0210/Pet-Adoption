from django.urls import path
from donations.views.donation_views import (
    get_donations,
    get_donation_detail,
    create_donation,
    create_manual_donation,
    verify_donation,
    get_user_donations,
    get_post_donations,
    get_pending_manual_donations,
    review_manual_donation
)

urlpatterns = [
    path('', get_donations, name='get_donations'),
    path('create/', create_donation, name='create_donation'),
    path('create-manual/', create_manual_donation, name='create_manual_donation'),
    path('admin/pending/', get_pending_manual_donations, name='get_pending_manual_donations'),
    path('<str:donation_id>/', get_donation_detail, name='get_donation_detail'),
    path('<str:donation_id>/verify/', verify_donation, name='verify_donation'),
    path('<str:donation_id>/review/', review_manual_donation, name='review_manual_donation'),
    path('user/', get_user_donations, name='get_user_donations'),
    path('post/<str:post_id>/', get_post_donations, name='get_post_donations'),
]

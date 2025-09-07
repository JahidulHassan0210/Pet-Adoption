from django.urls import path
from items.views import item_views

urlpatterns = [
    path('', item_views.get_items, name='get_items'),
    path('create/', item_views.create_item, name='create_item'),
    path('<str:item_id>/claim/', item_views.claim_item, name='claim_item'),
    path('stores/', item_views.get_stores, name='get_stores'),
    path('products/', item_views.get_all_products, name='get_all_products'),
    path('stores/create/', item_views.create_store, name='create_store'),
    path('stores/<str:store_id>/', item_views.update_store, name='update_store'),
    path('stores/<str:store_id>/delete/', item_views.delete_store, name='delete_store'),
    path('stores/<str:store_id>/products/', item_views.get_store_products, name='get_store_products'),
    path('stores/<str:store_id>/products/create/', item_views.create_product, name='create_product'),
    path('products/<str:product_id>/', item_views.update_product, name='update_product'),
    path('products/<str:product_id>/delete/', item_views.delete_product, name='delete_product'),
    path('stores/<str:store_id>/orders/', item_views.create_order, name='create_order'),
    path('orders/', item_views.get_user_orders, name='get_user_orders'),
    path('orders/<str:order_id>/status/', item_views.update_order_status, name='update_order_status'),
    path('volunteer-donations/', item_views.get_volunteer_donations, name='get_volunteer_donations'),
    path('volunteer-donations/create/', item_views.create_volunteer_donation, name='create_volunteer_donation'),
    path('volunteer-donations/<str:donation_id>/assign/', item_views.assign_volunteer_donation, name='assign_volunteer_donation'),
    path('volunteer-donations/<str:donation_id>/status/', item_views.update_volunteer_donation_status, name='update_volunteer_donation_status'),
]

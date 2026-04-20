from django.urls import path
from . import views

urlpatterns = [
    path('cart/',              views.cart_list,    name='cart-list'),
    path('cart/add/',          views.cart_add,     name='cart-add'),
    path('cart/<int:item_id>/update/', views.cart_update, name='cart-update'),
    path('cart/<int:item_id>/remove/', views.cart_remove, name='cart-remove'),
    path('checkout/',          views.checkout,     name='checkout'),
    path('orders/',            views.order_history, name='order-history'),
]
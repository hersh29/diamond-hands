from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("forex/", views.forex, name="forex"),
    path("stock/", views.stock, name="stock"),
    path("crypto/", views.crypto, name="crypto"),
]

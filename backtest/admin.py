from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    Crypto,
    CryptoPrice,
    CustomUser,
    Forex,
    ForexPrice,
    Stock,
    StockPrice,
)


class StockAdmin(admin.ModelAdmin):
    list_display = ["symbol", "exchange", "company_name"]
    search_fields = ["symbol", "company_name"]


admin.site.register(Stock, StockAdmin)


class StockPriceAdmin(admin.ModelAdmin):
    list_display = ["stock", "date", "open", "high", "low", "close", "volume"]
    search_fields = ["stock__symbol", "date"]
    list_filter = ["date", "stock"]


admin.site.register(StockPrice, StockPriceAdmin)


class CryptoAmin(admin.ModelAdmin):
    list_display = ["symbol", "exchange", "crypto_name"]
    search_fields = ["symbol", "crypto_name"]


admin.site.register(Crypto, CryptoAmin)


class CryptoPriceAdmin(admin.ModelAdmin):
    list_display = ["crypto", "date", "open", "high", "low", "close"]
    search_fields = ["crypto__symbol", "date"]
    list_filter = ["date", "crypto"]


admin.site.register(CryptoPrice, CryptoPriceAdmin)


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = [
        "username",
        "email",
        "first_name",
        "last_name",
        "date_of_birth",
        "gender",
        "phone_number",
    ]
    fieldsets = UserAdmin.fieldsets + (
        (None, {"fields": ("date_of_birth", "gender", "phone_number")}),
    )


admin.site.register(CustomUser, CustomUserAdmin)


class ForexAdmin(admin.ModelAdmin):
    list_display = ["symbol", "exchange", "country"]
    search_fields = ["symbol", "country"]


admin.site.register(Forex, ForexAdmin)


class ForexPriceAdmin(admin.ModelAdmin):
    list_display = ["forex", "date", "open", "high", "low", "close", "volume"]
    search_fields = ["forex__symbol", "date"]
    list_filter = ["date", "forex"]


admin.site.register(ForexPrice, ForexPriceAdmin)

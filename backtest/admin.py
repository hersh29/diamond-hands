from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser, Stock, StockPrice


class StockAdmin(admin.ModelAdmin):
    list_display = ["symbol", "exchange", "company_name"]
    search_fields = ["symbol", "company_name"]


admin.site.register(Stock, StockAdmin)


class StockPriceAdmin(admin.ModelAdmin):
    list_display = ["stock", "date", "open", "high", "low", "close", "volume"]
    search_fields = ["stock__symbol", "date"]
    list_filter = ["date", "stock"]


admin.site.register(StockPrice, StockPriceAdmin)


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

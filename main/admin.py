from django.contrib import admin

from .models import Stock, StockPrice


class StockAdmin(admin.ModelAdmin):
    list_display = ["symbol", "exchange", "company_name"]
    search_fields = ["symbol", "company_name"]


admin.site.register(Stock, StockAdmin)


class StockPriceAdmin(admin.ModelAdmin):
    list_display = ["stock", "date", "open", "high", "low", "close", "volume"]
    search_fields = ["stock__symbol", "date"]
    list_filter = ["date", "stock"]


admin.site.register(StockPrice, StockPriceAdmin)

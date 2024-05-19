from django.contrib.auth.models import AbstractUser
from django.db import models


class Stock(models.Model):
    """
    Stock Model
    Represents a company's stock with attributes like symbol, exchange, and company name.
    """

    symbol = models.CharField(
        max_length=10, unique=True, help_text="Stock ticker symbol (e.g., AAPL)"
    )
    exchange = models.CharField(
        max_length=255, help_text="Stock exchange (e.g., NASDAQ)"
    )
    company_name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Name of the company (e.g., Apple Inc.)",
    )

    class Meta:
        verbose_name = "Stock"
        verbose_name_plural = "Stocks"

    def __str__(self):
        return self.symbol


class StockPrice(models.Model):
    """
    StockPrice Model
    Represents a specific price point for a stock on a given date/time with attributes like date, open, high, low, close, and volume.
    """

    stock = models.ForeignKey(
        Stock,
        on_delete=models.CASCADE,
        help_text="Foreign key referencing the Stock table.",
    )
    date = models.DateField(help_text="Date of the stock price.")
    open = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Opening price of the stock on that date.",
    )
    high = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Highest price of the stock on that date.",
    )
    low = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Lowest price of the stock on that date.",
    )
    close = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Closing price of the stock on that date.",
    )
    volume = models.BigIntegerField(help_text="Volume of shares traded on that date.")

    class Meta:
        verbose_name = "Stock Price"
        verbose_name_plural = "Stock Prices"

    def __str__(self):
        return f"{self.stock.symbol} - {self.date}"


class Crypto(models.Model):
    """
    Crypto Model
    Represents a crypto price with attributes like symbol, exchange, and company name.
    """

    symbol = models.CharField(
        max_length=10, unique=True, help_text="Crypto  symbol (e.g., BTC)"
    )
    exchange = models.CharField(max_length=255, help_text="Exchange (e.g., NASDAQ)")
    crypto_name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Name of the Crypto (e.g., Bitcoin.)",
    )

    class Meta:
        verbose_name = "Crypto"
        verbose_name_plural = "Crypto"

    def __str__(self):
        return self.symbol


class CryptoPrice(models.Model):
    """
    CryptoPrice Model
    Represents a specific price point for a crypto on a given date/time with attributes like date, open, high, low, close, and volume.
    """

    crypto = models.ForeignKey(
        Crypto,
        on_delete=models.CASCADE,
        help_text="Foreign key referencing the Crypto table.",
    )
    date = models.DateField(help_text="Date of the crypto price.")
    open = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Opening price of the crypto on that date.",
    )
    high = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Highest price of the crypto on that date.",
    )
    low = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Lowest price of the crypto on that date.",
    )
    close = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Closing price of the crypto on that date.",
    )
    volume = models.BigIntegerField(
        help_text="Volume of currencies traded on that date."
    )

    class Meta:
        verbose_name = "Crypto Price"
        verbose_name_plural = "Crypto Prices"

    def __str__(self):
        return f"{self.stock.symbol} - {self.date}"


class CustomUser(AbstractUser):
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=1, choices=[("M", "Male"), ("F", "Female")], null=True, blank=True
    )
    phone_number = models.CharField(max_length=15, null=True, blank=True)

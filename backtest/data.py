import time
from datetime import datetime, timedelta

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from twelvedata import TDClient

from .models import Crypto, CryptoPrice, Stock, StockPrice

td = TDClient(apikey=settings.TWELVE_API_KEY)


def save_stock_prices(symbol):
    INTERVAL = "1day"
    START_DATE = datetime.strptime("2014-01-01", "%Y-%m-%d")
    END_DATE = datetime.now()

    try:
        stock = Stock.objects.get(symbol=symbol)
    except ObjectDoesNotExist:
        print(f"Stock with symbol {symbol} does not exist.")
        return

    current_start_date = START_DATE
    request_count = 0
    while current_start_date < END_DATE:
        current_end_date = current_start_date + timedelta(days=30)
        if current_end_date > END_DATE:
            current_end_date = END_DATE

        prices = td.time_series(
            symbol=symbol,
            interval=INTERVAL,
            start_date=current_start_date.strftime("%Y-%m-%d"),
            end_date=current_end_date.strftime("%Y-%m-%d"),
        ).as_json()

        for price in prices:
            stock_price, created = StockPrice.objects.get_or_create(
                stock=stock,
                date=price["datetime"],
                defaults={
                    "open": price["open"],
                    "high": price["high"],
                    "low": price["low"],
                    "close": price["close"],
                    "volume": price["volume"],
                },
            )
            if created:
                print(f"Created StockPrice for {price['datetime']}")
            else:
                print(f"StockPrice for {price['datetime']} already exists")

        current_start_date += timedelta(days=31)  # Move the start date forward

        request_count += 1
        if request_count % 7 == 0:
            time.sleep(60)


def save_crypto_prices(symbol):
    INTERVAL = "1day"
    START_DATE = datetime.strptime("2021-5-15", "%Y-%m-%d")
    END_DATE = datetime.now()

    try:
        crypto = Crypto.objects.get(symbol=symbol)
    except ObjectDoesNotExist:
        print(f"Crypto with symbol {symbol} does not exist.")
        return

    current_start_date = START_DATE
    request_count = 0
    while current_start_date < END_DATE:
        current_end_date = current_start_date + timedelta(days=30)
        if current_end_date > END_DATE:
            current_end_date = END_DATE

        prices = td.time_series(
            symbol=symbol,
            interval=INTERVAL,
            start_date=current_start_date.strftime("%Y-%m-%d"),
            end_date=current_end_date.strftime("%Y-%m-%d"),
        ).as_json()

        for price in prices:
            crypto_price, created = CryptoPrice.objects.get_or_create(
                crypto=crypto,
                date=price["datetime"],
                defaults={
                    "open": price["open"],
                    "high": price["high"],
                    "low": price["low"],
                    "close": price["close"],
                },
            )
            if created:
                print(f"Created CryptoPrice for {price['datetime']}")
            else:
                print(f"CryptoPrice for {price['datetime']} already exists")

        current_start_date += timedelta(days=31)  # Move the start date forward

        request_count += 1
        if request_count % 7 == 0:
            time.sleep(60)

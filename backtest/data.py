from datetime import datetime

from django.core.exceptions import ObjectDoesNotExist
from twelvedata import TDClient

from .models import Stock, StockPrice

API_KEY = "0430bc832afa407f8d10a4a1070e950d"
td = TDClient(apikey=API_KEY)


def save_stock_prices(symbol):
    START_DATE = "2024-05-01"
    INTERVAL = "1day"
    today = datetime.now().strftime("%Y-%m-%d")

    try:
        stock = Stock.objects.get(symbol=symbol)
    except ObjectDoesNotExist:
        print(f"Stock with symbol {symbol} does not exist.")
        return

    prices = td.time_series(
        symbol=symbol,
        interval=INTERVAL,
        start_date=START_DATE,
        end_date=today,
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


save_stock_prices(symbol="AAPL")

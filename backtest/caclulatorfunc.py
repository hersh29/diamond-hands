from datetime import date, datetime, timedelta
from decimal import Decimal

from django.conf import settings
from twelvedata import TDClient

from .models import StockPrice

td = TDClient(apikey=settings.TWELVE_API_KEY)


def total_shares(start_date: date, amount: float, symbol: str) -> float:
    """Get total shares based on start date"""
    return amount / day_opening_price(start_date, symbol)


def opening_amount(amount: float) -> float:
    """Get initial investment of user"""
    return amount


def ending_amount(end_date: date, amount: float, symbol: str):
    """Get total amount of ending date"""
    return amount_on_date(end_date, amount, symbol)


def amount_on_date(on_date: date, amount: float, symbol: str) -> float:
    """Get invested amount value on specific date"""
    return total_shares(on_date, amount, symbol) * day_opening_price(on_date, symbol)


def day_opening_price(on_date: date, symbol: str, rate: float = None) -> float:
    """Get opening price of specific day"""
    fail_count = 0
    while True:
        if on_date <= datetime(2014, 1, 1).date():
            end_date = on_date + timedelta(days=1)
            try:
                price = td.time_series(
                    symbol=symbol,
                    interval="1day",
                    start_date=on_date.strftime("%Y-%m-%d"),
                    end_date=end_date.strftime("%Y-%m-%d"),
                ).as_json()

                if price:
                    return Decimal(price[0]["open"])
            except Exception as e:
                fail_count += 1
                print(e)
                if fail_count > 3:
                    break
                on_date -= timedelta(days=1)

        elif on_date > date.today() and rate is not None:
            current_price = day_opening_price(
                date.today() - timedelta(days=1), symbol, rate
            )
            years = Decimal((on_date - date.today()).days / 365)
            percent_rate = rate / 100
            future_price = current_price * (1 + percent_rate) ** years
            print(future_price)
            return future_price

        else:
            price = StockPrice.objects.filter(
                date=on_date, stock__symbol=symbol
            ).first()
            if price is not None:
                return price.open
            else:
                on_date -= timedelta(days=1)


def difference_in_amount(
    start_date: date, end_date: date, amount: float, symbol: str
) -> float:
    """Get amount difference between start and end date"""
    return ending_amount(end_date, amount, symbol) - opening_amount(amount)


def state(start_date: date, end_date: date, amount: float, symbol: str) -> str:
    return (
        "profit"
        if difference_in_amount(start_date, end_date, amount, symbol) > 0
        else "loss"
    )


def difference_in_percentage(
    start_date: date, end_date: date, amount: float, symbol: str
) -> float:
    """Get difference percentage between start and end date"""
    return (
        difference_in_amount(start_date, end_date, amount, symbol)
        / opening_amount(amount)
    ) * 100


def year_to_year_return(
    start_date: date, end_date: date, amount: float, symbol: str
) -> float:
    """Calculate year-over-year return"""
    years = Decimal((end_date - start_date).days / 365)
    return (
        (
            (ending_amount(end_date, amount, symbol) / opening_amount(amount))
            ** (Decimal(1) / years)
        )
        - 1
    ) * 100


def month_to_month_return(
    start_date: date, end_date: date, amount: float, symbol: str
) -> float:
    """Calculate month-over-month return"""
    months = Decimal((end_date - start_date).days / 30)
    return (
        (
            (ending_amount(end_date, amount, symbol) / opening_amount(amount))
            ** (Decimal(1) / months)
        )
        - 1
    ) * 100


def get_periods_date(start_date: date, end_date: date) -> list:
    """Get years/months periods between two dates"""
    dates = []
    if (end_date - start_date).days < 365 * 2:
        while start_date <= end_date:
            if start_date.month == 12:
                dates.append(date(start_date.year, 12, 31))
                start_date = date(start_date.year + 1, 1, 1)
            else:
                next_month = start_date.month + 1
                dates.append(date(start_date.year, next_month, 1) - timedelta(days=1))
                start_date = date(start_date.year, next_month, 1)
    else:
        while start_date.year <= end_date.year:
            dates.append(date(start_date.year, 12, 31))
            start_date += timedelta(days=365)
    return dates


def get_periods_values(
    start_date: date, end_date: date, amount: float, symbol: str
) -> list:
    """Get investment amount for each period between start and end date"""
    periods = get_periods_date(start_date, end_date)
    periods_price = []
    for period in periods:
        periods_price.append([period, amount_on_date(period, amount, symbol)])
    return [
        [date.strftime("%Y-%m"), round(float(value), 2)]
        for date, value in periods_price
    ]

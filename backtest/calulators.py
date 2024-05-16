from datetime import date, datetime, timedelta
from decimal import Decimal

from twelvedata import TDClient

from .models import StockPrice

API_KEY = "ecdb33a477a04200924abc5782580f36"


class Calculator:
    """Calculate stock periods and price"""

    def __init__(
        self, start_date: date, end_date: date, symbol: str, amount: float, rate: float
    ) -> None:
        self.start_date = start_date
        self.end_date = end_date
        self.symbol = symbol
        self.amount = amount
        self.rate = rate
        self.td = TDClient(apikey=API_KEY)

    def total_shares(self) -> float:
        """Get total shares based on start date"""
        return self.amount / self.day_opening_price(self.start_date)

    def opening_amount(self) -> float:
        """Get initial investment of user"""
        return self.amount

    def ending_amount(self):
        """Get total amount of ending date"""
        return self.amount_on_date(self.end_date)

    def amount_on_date(self, on_date: date) -> float:
        """Get invested amount value on specific date"""
        return self.total_shares() * self.day_opening_price(on_date)

    def day_opening_price(self, on_date: date) -> float:
        """Get opening price of specific day"""
        print("Called Opening Price")
        fail_count = 0
        while True:
            if on_date <= datetime(2014, 1, 1).date():
                end_date = on_date + timedelta(days=1)
                try:
                    price = self.td.time_series(
                        symbol=self.symbol,
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
            else:
                price = StockPrice.objects.filter(
                    date=on_date, stock__symbol=self.symbol
                ).first()
                if price is not None:
                    return price.open
                else:
                    on_date -= timedelta(days=1)

    def start_date_opening_price(self) -> float:
        """Get opening price on start date"""
        return self.day_opening_price(self.start_date)

    def end_date_opening_price(self) -> float:
        """Get opening price on end date"""
        return self.day_opening_price(self.end_date)

    def difference_in_amount(self) -> float:
        """Get amount difference between start and end date"""
        return self.ending_amount() - self.opening_amount()

    def state(self) -> str:
        return "profit" if self.difference_in_amount() > 0 else "loss"

    def difference_in_percentage(self) -> float:
        """Get difference percentage between start and end date"""
        return (self.difference_in_amount() / self.opening_amount()) * 100

    def year_to_year_return(self) -> float:
        """Calculate year-over-year return"""
        years = Decimal((self.end_date - self.start_date).days / 365)
        return (
            ((self.ending_amount() / self.opening_amount()) ** (Decimal(1) / years)) - 1
        ) * 100

    def month_to_month_return(self) -> float:
        """Calculate month-over-month return"""
        months = Decimal((self.end_date - self.start_date).days / 30)
        return (
            ((self.ending_amount() / self.opening_amount()) ** (Decimal(1) / months))
            - 1
        ) * 100

    def get_periods_date(self, start_date: date, end_date: date) -> list:
        """Get years/months periods between two dates"""
        dates = []
        if (end_date - start_date).days < 365 * 2:
            while start_date <= end_date:
                if start_date.month == 12:
                    dates.append(date(start_date.year, 12, 31))
                    start_date = date(start_date.year + 1, 1, 1)
                else:
                    next_month = start_date.month + 1
                    dates.append(
                        date(start_date.year, next_month, 1) - timedelta(days=1)
                    )
                    start_date = date(start_date.year, next_month, 1)
        else:
            while start_date.year <= end_date.year:
                dates.append(date(start_date.year, 12, 31))
                start_date += timedelta(days=365)
        return dates

    def get_periods_values(self) -> list:
        """Get investment amount for each period between start and end date"""
        periods = self.get_periods_date(self.start_date, self.end_date)
        periods_price = []
        for period in periods:
            periods_price.append([period, self.amount_on_date(period)])
        return [
            [date.strftime("%Y-%m"), round(float(value), 2)]
            for date, value in periods_price
        ]

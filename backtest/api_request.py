import os

import requests
from dotenv import load_dotenv

load_dotenv()


def get_time_series(start_date, symbol, end_date):
    """Returns the timeseries value of asset on json format"""
    api_key = os.getenv("TWELVE_API_KEY")
    base_url = "https://api.twelvedata.com/time_series"
    params = {
        "apikey": api_key,
        "interval": "1day",
        "symbol": symbol,
        "format": "JSON",
        "start_date": start_date,
        "end_date": end_date,
    }

    response = requests.get(base_url, params=params)
    return response.json()

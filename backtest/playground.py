# from datetime import datetime, timedelta
# from pprint import pprint

# from twelvedata import TDClient


# td = TDClient(apikey=API_KEY)
# start_date = datetime.strptime("2014-01-01", "%Y-%m-%d")

# # Add one day to the start_date
# end_date = start_date + timedelta(days=1)

# try:
#     price = td.time_series(
#         symbol="AAPL",
#         interval="1day",
#         start_date=start_date,
#         end_date=end_date,
#     ).as_json()
# except Exception:
#     # If a BadRequestError is raised, subtract one day from the start_date and end_date and try again
#     start_date -= timedelta(days=1)
#     end_date -= timedelta(days=1)
#     price = td.time_series(
#         symbol="AAPL",
#         interval="1day",
#         start_date=start_date,
#         end_date=end_date,
#     ).as_json()

# pprint(price[0]["open"])


# def get_periods_date(start_date: date, end_date: date) -> list:
#     """Get years/months periods between two dates"""

#     dates = []
#     if (end_date - start_date).days < 365 * 2:
#         while start_date <= end_date:
#             if start_date.month == 12:
#                 dates.append(date(start_date.year, 12, 31))
#                 start_date = date(start_date.year + 1, 1, 1)
#             else:
#                 next_month = start_date.month + 1
#                 dates.append(date(start_date.year, next_month, 1) - timedelta(days=1))
#                 start_date = date(start_date.year, next_month, 1)
#     else:
#         while start_date.year <= end_date.year:
#             dates.append(date(start_date.year, 12, 31))
#             start_date += timedelta(days=365)
#     return dates


# datess = get_periods_date(start_date, end_date)
# print(datess)

# from datetime import date, datetime, timedelta
# from pprint import pprint

# from twelvedata import TDClient

# td = TDClient(apikey=API_KEY)

# start_date = datetime.strptime("2020-01-10", "%Y-%m-%d").date()


# def dummy():
#     start_date = datetime.strptime("2013-03-12", "%Y-%m-%d").date()
#     while True:
#         if start_date <= datetime(2022, 1, 1).date():
#             end_date = start_date + timedelta(days=1)
#             try:
#                 price = td.time_series(
#                     symbol="AAPL",
#                     interval="1day",
#                     start_date=start_date,
#                     end_date=end_date,
#                 ).as_json()
#                 if price:
#                     print(price[0]["open"])
#                     return
#             except Exception as e:
#                 pprint(e)
#                 start_date -= timedelta(days=1)


# dummy()

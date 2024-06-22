from datetime import datetime, timedelta

# Set START_DATE to the first day of the current month
START_DATE = (datetime.now().replace(day=1) - timedelta(days=1)).replace(
    day=1, hour=0, minute=0, second=0, microsecond=0
)

print(START_DATE)

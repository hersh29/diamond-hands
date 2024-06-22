#!/bin/bash
# Activate the virtual environment
source /path/to/your/virtualenv/bin/activate

# Navigate to jango project directory
cd /path/to/your/django/project

# Execute the save_all_prices function
echo "from backtest.data import save_all_prices; save_all_prices()" | python manage.py shell

# Deactivate the virtual environment
deactivate
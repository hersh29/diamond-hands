#!/bin/bash

# Navigate to jango project directory
cd /root/diamond-hands

# Execute the save_all_prices function
echo "from backtest.data import save_all_prices; save_all_prices()" | python3 manage.py shell

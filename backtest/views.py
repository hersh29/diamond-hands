from pprint import pprint

from django.http import HttpResponse
from django.shortcuts import redirect, render

from .calulators import Calculator
from .forms import StockForm
from .models import Stock


def home(request):
    return render(request, "backtest/home.html")


def stock(request):
    if request.method == "POST":
        form = StockForm(request.POST)
        if form.is_valid():
            stock = str(form.cleaned_data.get("stock"))
            start_date = form.cleaned_data.get("start_date")
            end_date = form.cleaned_data.get("end_date")
            amount = form.cleaned_data.get("amount")
            rate = form.cleaned_data.get("rate", 0)
            calculator = Calculator(start_date, end_date, stock, amount, rate)
            stock = Stock.objects.get(symbol=stock)

            context = {
                "success": True,
                "stock": stock.company_name,
                "start_date": start_date,
                "end_date": end_date,
                "starting_amount": amount,
                "ending_amount": calculator.ending_amount(),
                "start_opening_price": calculator.start_date_opening_price(),
                "end_opening_price": calculator.end_date_opening_price(),
                "total_shares": calculator.total_shares(),
                "difference_in_amount": calculator.difference_in_amount(),
                "difference_in_percentage": calculator.difference_in_percentage(),
                "yearly_return": calculator.year_to_year_return(),
                "monthly_return": calculator.month_to_month_return(),
                "state": calculator.state(),
                "period_values": calculator.get_periods_values(),
                "form": form,
            }
            pprint(context)
            return render(request, "backtest/stock.html", context=context)

    else:
        form = StockForm()
    return render(request, "backtest/stock.html", {"form": form})


def crypto(request):
    if request.method == "POST":
        form = StockForm(request.POST)
        if form.is_valid():
            print(form.cleaned_data)
    else:
        form = StockForm()
    return render(request, "backtest/crypto.html", {"form": form})


def forex(request):
    if request.method == "POST":
        form = StockForm(request.POST)
        if form.is_valid():
            print(form.cleaned_data)
    else:
        form = StockForm()
    return render(request, "backtest/forex.html", {"form": form})

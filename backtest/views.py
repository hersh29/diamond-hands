from django.http import HttpResponse
from django.shortcuts import redirect, render

from .forms import StockForm
from .models import StockPrice


def home(request):
    return render(request, "backtest/home.html")


def stock(request):
    if request.method == "POST":
        form = StockForm(request.POST)
        if form.is_valid():
            stock = form.cleaned_data.get("stock")
            start_date = form.cleaned_data.get("start_date")
            end_date = form.cleaned_data.get("end_date")
            amount = form.cleaned_data.get("amount")
            rate = form.cleaned_data.get("rate", 0)

            if start_date or end_date < "2014-01-01":
                pass

            else:
                start_date_price = StockPrice.objects.filter(
                    stock=stock, date=start_date
                )
                end_date_price = StockPrice.objects.filter(stock=stock, date=end_date)

            print(form.cleaned_data)
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

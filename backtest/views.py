from django.http import HttpResponse
from django.shortcuts import redirect, render

from .forms import StockForm


def home(request):
    return render(request, "backtest/home.html")


def forex(request):
    return HttpResponse("Forex Page")


def stock(request):
    if request.method == "POST":
        form = StockForm(request.POST)
        if form.is_valid():
            print(form.cleaned_data)
    else:
        form = StockForm()

    return render(request, "backtest/stock.html", {"form": form})


def crypto(request):
    return render(request, "backtest/crypto.html")

from django.http import HttpResponse
from django.shortcuts import render


def home(request):
    return render(request, "backtest/home.html")


def forex(request):
    return HttpResponse("Forex Page")


def stock(request):
    return HttpResponse("Stock Page")


def crypto(request):
    return HttpResponse("Crypto Page")

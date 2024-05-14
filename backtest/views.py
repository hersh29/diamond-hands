from django.http import HttpResponse


def forex(request):
    return HttpResponse("Forex Page")


def stock(request):
    return HttpResponse("Stock Page")


def crypto(request):
    return HttpResponse("Crypto Page")

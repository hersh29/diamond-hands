from pprint import pprint

from django.http import HttpResponse
from django.shortcuts import redirect, render

from .caclulatorfunc import *
from .calulators import Calculator
from .forms import (
    BackTestCryptoForm,
    BackTestForm,
    FutureTestCryptoForm,
    FutureTestForm,
)
from .models import Crypto, Stock


def home(request):
    return render(request, "backtest/home.html")


def stock(request):
    context = {}
    f_form = FutureTestForm()
    b_form = BackTestForm()

    if request.method == "POST":
        if "f_test" in request.POST:
            f_form = FutureTestForm(request.POST)
            if f_form.is_valid():
                f_calc = Calculator(
                    f_form.cleaned_data["f_start_date"],
                    f_form.cleaned_data["f_end_date"],
                    f_form.cleaned_data["f_stock"],
                    f_form.cleaned_data["f_amount"],
                    f_form.cleaned_data["f_rate"],
                )
                f_company = Stock.objects.get(symbol=f_form.cleaned_data["f_stock"])
                context.update(
                    {
                        "f_success": True,
                        "f_stock": f_company.company_name,
                        "f_start_date": f_form.cleaned_data["f_start_date"],
                        "f_end_date": f_form.cleaned_data["f_end_date"],
                        "f_starting_amount": f_form.cleaned_data["f_amount"],
                        "f_ending_amount": f_calc.ending_amount(),
                        "f_start_opening_price": f_calc.start_date_opening_price(),
                        "f_end_opening_price": f_calc.end_date_opening_price(),
                        "f_total_shares": f_calc.total_shares(),
                        "f_difference_in_amount": f_calc.difference_in_amount(),
                        "f_difference_in_percentage": f_calc.difference_in_percentage(),
                        "f_yearly_return": f_calc.year_to_year_return(),
                        "f_monthly_return": f_calc.month_to_month_return(),
                        "f_state": f_calc.state(),
                        "f_period_values": f_calc.get_periods_values(),
                        "f_form": f_form,
                        "tab_id": "two",
                        "link_id": "two_link",
                        "otab_id": "one",
                        "olink_id": "one_link",
                    }
                )

        if "b_test" in request.POST:
            b_form = BackTestForm(request.POST)
            if b_form.is_valid():
                b_calc = Calculator(
                    b_form.cleaned_data["b_start_date"],
                    b_form.cleaned_data["b_end_date"],
                    b_form.cleaned_data["b_stock"],
                    b_form.cleaned_data["b_amount"],
                    None,
                )
                b_company = Stock.objects.get(symbol=b_form.cleaned_data["b_stock"])
                context.update(
                    {
                        "b_success": True,
                        "b_stock": b_company.company_name,
                        "b_start_date": b_form.cleaned_data["b_start_date"],
                        "b_end_date": b_form.cleaned_data["b_end_date"],
                        "b_starting_amount": b_form.cleaned_data["b_amount"],
                        "b_ending_amount": b_calc.ending_amount(),
                        "b_start_opening_price": b_calc.start_date_opening_price(),
                        "b_end_opening_price": b_calc.end_date_opening_price(),
                        "b_total_shares": b_calc.total_shares(),
                        "b_difference_in_amount": b_calc.difference_in_amount(),
                        "b_difference_in_percentage": b_calc.difference_in_percentage(),
                        "b_yearly_return": b_calc.year_to_year_return(),
                        "b_monthly_return": b_calc.month_to_month_return(),
                        "b_state": b_calc.state(),
                        "b_period_values": b_calc.get_periods_values(),
                        "b_form": b_form,
                        "tab_id": "one",
                        "link_id": "one_link",
                        "otab_id": "two",
                        "olink_id": "two_link",
                    }
                )
    context.update({"f_form": f_form, "b_form": b_form})
    pprint(context)
    return render(request, "backtest/stock.html", context=context)


def crypto(request):
    context = {}
    f_form = FutureTestCryptoForm()
    b_form = BackTestCryptoForm()

    if request.method == "POST":
        if "f_test" in request.POST:
            f_form = FutureTestCryptoForm(request.POST)
        if f_form.is_valid():
            f_crypto = Crypto.objects.get(symbol=f_form.cleaned_data["f_crypto"])
            start_date = f_form.cleaned_data["f_start_date"]
            end_date = f_form.cleaned_data["f_end_date"]
            amount = f_form.cleaned_data["f_amount"]
            symbol = f_form.cleaned_data["f_crypto"]
            rate = f_form.cleaned_data["f_rate"]

            context.update(
                {
                    "f_success": True,
                    "f_crypto": f_crypto.crypto_name,
                    "f_start_date": start_date,
                    "f_end_date": end_date,
                    "f_starting_amount": amount,
                    "f_ending_amount": ending_amount(
                        start_date, end_date, amount, symbol, rate
                    ),
                    "f_start_opening_price": day_opening_price(
                        start_date, symbol, rate
                    ),
                    "f_end_opening_price": day_opening_price(end_date, symbol, rate),
                    "f_total_shares": total_shares(start_date, amount, symbol),
                    "f_difference_in_amount": difference_in_amount(
                        start_date, end_date, amount, symbol, rate
                    ),
                    "f_difference_in_percentage": difference_in_percentage(
                        start_date, end_date, amount, symbol
                    ),
                    "f_yearly_return": year_to_year_return(
                        start_date, end_date, amount, symbol, rate
                    ),
                    "f_monthly_return": month_to_month_return(
                        start_date, end_date, amount, symbol, rate
                    ),
                    "f_state": state(start_date, end_date, amount, symbol, rate),
                    "f_period_values": get_periods_values(
                        start_date, end_date, amount, symbol, rate
                    ),
                    "f_form": f_form,
                    "tab_id": "two",
                    "link_id": "two_link",
                    "otab_id": "one",
                    "olink_id": "one_link",
                }
            )

        if "b_test" in request.POST:
            b_form = BackTestCryptoForm(request.POST)

            if b_form.is_valid():
                print(b_form.cleaned_data)
                b_crypto = Crypto.objects.get(symbol=b_form.cleaned_data["b_crypto"])
                start_date = b_form.cleaned_data["b_start_date"]
                end_date = b_form.cleaned_data["b_end_date"]
                amount = b_form.cleaned_data["b_amount"]
                symbol = b_form.cleaned_data["b_crypto"]
                if b_crypto.start_date > start_date:
                    context.update(
                        {"date_error": True, "ini_date": b_crypto.start_date}
                    )
                else:
                    context.update(
                        {
                            "b_success": True,
                            "b_crypto": b_crypto.crypto_name,
                            "b_start_date": start_date,
                            "b_end_date": end_date,
                            "b_starting_amount": amount,
                            "b_ending_amount": ending_amount(
                                start_date, end_date, amount, symbol
                            ),
                            "b_start_opening_price": day_opening_price(
                                start_date, symbol
                            ),
                            "b_end_opening_price": day_opening_price(end_date, symbol),
                            "b_total_shares": total_shares(start_date, amount, symbol),
                            "b_difference_in_amount": difference_in_amount(
                                start_date, end_date, amount, symbol
                            ),
                            "b_difference_in_percentage": difference_in_percentage(
                                start_date, end_date, amount, symbol
                            ),
                            "b_yearly_return": year_to_year_return(
                                start_date, end_date, amount, symbol
                            ),
                            "b_monthly_return": month_to_month_return(
                                start_date, end_date, amount, symbol
                            ),
                            "b_state": state(start_date, end_date, amount, symbol),
                            "b_period_values": get_periods_values(
                                start_date, end_date, amount, symbol
                            ),
                            "b_form": b_form,
                            "tab_id": "one",
                            "link_id": "one_link",
                            "otab_id": "two",
                            "olink_id": "two_link",
                        }
                    )
    context.update({"f_form": f_form, "b_form": b_form})
    pprint(context)
    return render(request, "backtest/crypto.html", context=context)


def forex(request):
    return HttpResponse("Hi")

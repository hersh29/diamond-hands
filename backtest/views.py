from pprint import pprint

from django.http import HttpResponse
from django.shortcuts import redirect, render

from .calulators import Calculator
from .forms import BackTestForm, FutureTestForm
from .models import Stock


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
                    }
                )
    context.update({"f_form": f_form, "b_form": b_form})
    pprint(context)
    return render(request, "backtest/stock.html", context=context)


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

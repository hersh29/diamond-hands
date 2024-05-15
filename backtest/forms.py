from django import forms

from .models import Stock


class StockForm(forms.Form):
    stock = forms.ModelChoiceField(
        queryset=Stock.objects.all(),
        to_field_name="symbol",
        empty_label="Choose the stock",
        widget=forms.Select(
            attrs={
                "class": "form-control assets_dropdown",
                "id": "form-assets",
                "required": True,
            }
        ),
    )
    amount = forms.DecimalField(
        widget=forms.NumberInput(
            attrs={
                "class": "form-control",
                "placeholder": "Enter the amount",
                "step": "any",
                "required": True,
            }
        )
    )
    rate = forms.DecimalField(
        required=False,
        widget=forms.NumberInput(
            attrs={
                "class": "form-control",
                "placeholder": "Enter the return rate",
                "step": "any",
            },
        ),
    )
    start_date = forms.DateField(
        widget=forms.DateInput(
            attrs={
                "class": "form-control",
                "placeholder": "Choose the starting date",
                "type": "date",
                "required": True,
            }
        )
    )
    end_date = forms.DateField(
        widget=forms.DateInput(
            attrs={
                "class": "form-control",
                "placeholder": "Choose the ending date",
                "type": "date",
                "required": True,
            }
        )
    )

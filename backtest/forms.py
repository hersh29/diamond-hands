from django import forms

from .models import Stock


class BackTestForm(forms.Form):
    b_stock = forms.ModelChoiceField(
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
    b_amount = forms.DecimalField(
        widget=forms.NumberInput(
            attrs={
                "class": "form-control",
                "placeholder": "Enter the amount",
                "step": "any",
                "required": True,
            }
        )
    )
    b_start_date = forms.DateField(
        widget=forms.DateInput(
            attrs={
                "class": "form-control",
                "placeholder": "Choose the starting date",
                "type": "date",
                "required": True,
            }
        )
    )
    b_end_date = forms.DateField(
        widget=forms.DateInput(
            attrs={
                "class": "form-control",
                "placeholder": "Choose the ending date",
                "type": "date",
                "required": True,
            }
        )
    )


class FutureTestForm(forms.Form):
    f_stock = forms.ModelChoiceField(
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
    f_amount = forms.DecimalField(
        widget=forms.NumberInput(
            attrs={
                "class": "form-control",
                "placeholder": "Enter the amount",
                "step": "any",
                "required": True,
            }
        )
    )
    f_rate = forms.DecimalField(
        required=True,
        widget=forms.NumberInput(
            attrs={
                "class": "form-control",
                "placeholder": "Enter the return rate",
                "step": "any",
                "required": True,
            },
        ),
    )
    f_start_date = forms.DateField(
        widget=forms.DateInput(
            attrs={
                "class": "form-control",
                "placeholder": "Choose the starting date",
                "type": "date",
                "required": True,
            }
        )
    )
    f_end_date = forms.DateField(
        widget=forms.DateInput(
            attrs={
                "class": "form-control",
                "placeholder": "Choose the ending date",
                "type": "date",
                "required": True,
            }
        )
    )

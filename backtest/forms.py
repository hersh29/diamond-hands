from allauth.account.forms import SignupForm
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


class BackTestCryptoForm(forms.Form):
    b_crypto = forms.ModelChoiceField(
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


class FutureTestCryptoForm(forms.Form):
    f_crypto = forms.ModelChoiceField(
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


class CustomSignupForm(SignupForm):
    first_name = forms.CharField(
        max_length=30,
        label="First Name",
        widget=forms.TextInput(attrs={"placeholder": "First Name"}),
    )
    last_name = forms.CharField(
        max_length=30,
        label="Last Name",
        widget=forms.TextInput(attrs={"placeholder": "Last Name"}),
    )

    date_of_birth = forms.DateField(
        required=False,
        label="Date of Birth",
        widget=forms.DateInput(attrs={"type": "date", "placeholder": "Date of Birth"}),
    )
    gender = forms.ChoiceField(
        required=False,
        choices=[("M", "Male"), ("F", "Female")],
        label="Gender",
        widget=forms.Select(
            attrs={
                "style": "background: #070F0C !important; color: #c0c0c0 !important; height: 40px; box-shadow:none !important;"
            }
        ),
    )
    phone_number = forms.CharField(
        required=False,
        max_length=15,
        label="Phone Number",
        widget=forms.TextInput(attrs={"placeholder": "Phone Number"}),
    )

    def save(self, request):
        user = super(CustomSignupForm, self).save(request)
        user.first_name = self.cleaned_data.get("first_name")
        user.last_name = self.cleaned_data.get("last_name")
        user.date_of_birth = self.cleaned_data.get("date_of_birth")
        user.gender = self.cleaned_data.get("gender")
        user.phone_number = self.cleaned_data.get("phone_number")
        user.save()
        return user

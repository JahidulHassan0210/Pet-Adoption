from django import forms
from donations.models import Donation

class DonationForm(forms.ModelForm):
    class Meta:
        model = Donation
        fields = ['post', 'amount', 'payment_method', 'reference_id']

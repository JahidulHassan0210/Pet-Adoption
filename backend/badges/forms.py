from django import forms
from badges.models import Badge, UserBadge

class BadgeForm(forms.ModelForm):
    class Meta:
        model = Badge
        fields = ['name', 'description', 'icon', 'criteria']

class UserBadgeForm(forms.ModelForm):
    class Meta:
        model = UserBadge
        fields = ['user', 'badge']

from django import forms
from blogs.models import Blog

class BlogForm(forms.ModelForm):
    class Meta:
        model = Blog
        fields = ['title', 'content', 'image', 'tags']
        widgets = {
            'tags': forms.TextInput(attrs={'placeholder': 'Enter tags separated by commas'}),
        }

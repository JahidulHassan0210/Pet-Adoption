from django import forms
from posts.models import Post, PostImage

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['type', 'title', 'description', 'pet_type', 'pet_age', 'pet_size', 'pet_species', 'donation_goal']

class PostImageForm(forms.ModelForm):
    class Meta:
        model = PostImage
        fields = ['image_url', 'caption']

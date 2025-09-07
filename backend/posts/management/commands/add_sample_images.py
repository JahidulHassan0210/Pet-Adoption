from django.core.management.base import BaseCommand
from posts.models import Post, PostImage
import os
import shutil
from django.conf import settings

class Command(BaseCommand):
    help = 'Add sample images to existing posts'

    def handle(self, *args, **options):
        try:
            posts = Post.objects.all()
            
            if not posts:
                self.stdout.write(self.style.WARNING('No posts found to add images to'))
                return
            
            sample_images_dir = os.path.join(settings.BASE_DIR, 'media', 'sample_images')
            post_images_dir = os.path.join(settings.BASE_DIR, 'media', 'post_images')
            
            if not os.path.exists(sample_images_dir):
                self.stdout.write(self.style.WARNING(f'Sample images directory not found: {sample_images_dir}'))
                self.stdout.write('Creating sample images directory...')
                os.makedirs(sample_images_dir, exist_ok=True)
                
                self.stdout.write('Please add some sample images to the sample_images directory and run this command again')
                return
            
            sample_images = [f for f in os.listdir(sample_images_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
            
            if not sample_images:
                self.stdout.write(self.style.WARNING('No sample images found in sample_images directory'))
                return
            
            for i, post in enumerate(posts):
                if PostImage.objects(post=post).count() > 0:
                    self.stdout.write(f'Post {post.title} already has images, skipping...')
                    continue
                
                sample_image = sample_images[i % len(sample_images)]
                sample_image_path = os.path.join(sample_images_dir, sample_image)
                
                filename = f"{post.id}_{sample_image}"
                dest_path = os.path.join(post_images_dir, filename)
                
                shutil.copy2(sample_image_path, dest_path)
                
                PostImage(
                    post=post,
                    image_url=f"post_images/{filename}",
                    caption=f"Sample image for {post.title}"
                ).save()
                
                self.stdout.write(f'Added image {filename} to post: {post.title}')
            
            self.stdout.write(self.style.SUCCESS(f'Successfully added images to {posts.count()} posts'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))

from django.core.management.base import BaseCommand
from posts.models import Post, PostImage
from users.models import User
from decimal import Decimal
import uuid

class Command(BaseCommand):
    help = 'Create sample posts for testing'

    def handle(self, *args, **options):
        # Check if we have any users
        users = User.objects.all()
        if not users:
            self.stdout.write(
                self.style.ERROR('No users found. Please create users first.')
            )
            return

        # Use the first user as the author
        author = users.first()

        sample_posts = [
            {
                'type': 'adoption',
                'title': 'Luna - Sweet Golden Retriever Looking for Home',
                'description': 'Luna is a 2-year-old Golden Retriever who loves children and other dogs. She is house-trained and knows basic commands.',
                'pet_type': 'Dog',
                'pet_age': 2,
                'pet_size': 'medium',
                'pet_species': 'Golden Retriever',
                'donation_goal': None,
                'current_amount': Decimal('0.00'),
            },
            {
                'type': 'donation',
                'title': 'Help Rocky Get Surgery',
                'description': 'Rocky needs emergency surgery for a broken leg. He is a 1-year-old mixed breed dog who was hit by a car.',
                'pet_type': 'Dog',
                'pet_age': 1,
                'pet_size': 'medium',
                'pet_species': 'Mixed Breed',
                'donation_goal': Decimal('2500.00'),
                'current_amount': Decimal('0.00'),
            },
            {
                'type': 'adoption',
                'title': 'Whiskers - Friendly Tabby Cat',
                'description': 'Whiskers is a 3-year-old tabby cat who is very affectionate and loves to cuddle. He gets along well with other cats.',
                'pet_type': 'Cat',
                'pet_age': 3,
                'pet_size': 'small',
                'pet_species': 'Tabby Cat',
                'donation_goal': None,
                'current_amount': Decimal('0.00'),
            },
            {
                'type': 'donation',
                'title': 'Emergency Care for Bella',
                'description': 'Bella is a 4-year-old Persian cat who needs treatment for a severe respiratory infection.',
                'pet_type': 'Cat',
                'pet_age': 4,
                'pet_size': 'small',
                'pet_species': 'Persian Cat',
                'donation_goal': Decimal('800.00'),
                'current_amount': Decimal('0.00'),
            },
            {
                'type': 'adoption',
                'title': 'Buddy - Playful Labrador Puppy',
                'description': 'Buddy is an 8-month-old Labrador puppy who is full of energy and loves to play fetch. He needs an active family.',
                'pet_type': 'Dog',
                'pet_age': 1,
                'pet_size': 'large',
                'pet_species': 'Labrador Retriever',
                'donation_goal': None,
                'current_amount': Decimal('0.00'),
            }
        ]

        created_count = 0
        for post_data in sample_posts:
            # Check if post already exists
            existing_post = Post.objects(title=post_data['title']).first()
            if existing_post:
                self.stdout.write(
                    self.style.WARNING(f'Post already exists: {post_data["title"]}')
                )
                continue

            # Create post
            post = Post(
                user=author,
                **post_data
            )
            post.save()

            # Create sample images for each post
            for i in range(2):
                image = PostImage(
                    post=post,
                    image_url=f"sample_images/{post.id}_{i}.jpg",
                    caption=f"Sample image {i+1} for {post.title}"
                )
                image.save()

            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Created post: {post.title}')
            )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} sample posts')
        )

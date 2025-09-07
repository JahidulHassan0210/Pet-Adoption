from django.core.management.base import BaseCommand
from blogs.models import Blog
from users.models import User

class Command(BaseCommand):
    help = 'Create sample blog posts for testing'

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

        sample_blogs = [
            {
                'title': 'The Complete Guide to Pet Adoption: What Every First-Time Owner Should Know',
                'content': '''Adopting a pet is one of life's most rewarding experiences, but it also comes with significant responsibilities. This comprehensive guide will walk you through everything you need to know before bringing your new furry friend home.

**Before You Adopt:**
- Research different pet types and breeds
- Consider your lifestyle and living situation
- Prepare your home for a new pet
- Budget for food, vet care, and supplies

**The First Few Weeks:**
- Give your pet time to adjust to their new environment
- Establish routines for feeding, walking, and playtime
- Schedule a vet checkup within the first week
- Be patient as your pet learns house rules

**Building a Bond:**
- Spend quality time together daily
- Use positive reinforcement for training
- Respect your pet's boundaries and preferences
- Show consistent love and care

Remember, adoption is a lifelong commitment. Your patience and love will be rewarded with unconditional companionship.''',
                'tags': ['Adoption', 'First-Time Owners', 'Pet Care'],
                'image': 'blog-pet-adoption-guide.png'
            },
            {
                'title': 'Understanding Pet Behavior: Signs Your Dog or Cat is Happy and Healthy',
                'content': '''Learning to read your pet's body language and behavior is crucial for their wellbeing. Here are the key signs that indicate your furry friend is thriving.

**Happy Dog Signs:**
- Wagging tail (relaxed, not stiff)
- Relaxed ears and facial muscles
- Playful behavior and zoomies
- Good appetite and regular bathroom habits
- Enthusiastic greetings

**Happy Cat Signs:**
- Purring and kneading
- Slow blinking (cat kisses)
- Upright tail with slight curve
- Relaxed body posture
- Playful hunting behavior

**When to Be Concerned:**
- Changes in eating or bathroom habits
- Unusual lethargy or hyperactivity
- Aggressive behavior
- Excessive vocalization
- Hiding or avoiding interaction

Always consult your vet if you notice concerning changes in behavior.''',
                'tags': ['Pet Behavior', 'Health', 'Dogs', 'Cats'],
                'image': 'blog-pet-behavior.png'
            },
            {
                'title': 'Emergency Pet Care: What to Do When Your Pet Needs Immediate Help',
                'content': '''Medical emergencies can happen to any pet at any time. Being prepared and knowing what to do can save your pet's life. Here's your emergency action plan.

**Immediate Actions:**
1. Stay calm - your pet can sense your anxiety
2. Assess the situation safely
3. Call your vet or emergency clinic
4. Follow their guidance for immediate care

**Common Emergencies:**
- **Choking**: Don't stick your fingers in their mouth
- **Bleeding**: Apply pressure with clean cloth
- **Seizures**: Clear the area and don't restrain
- **Poisoning**: Don't induce vomiting without vet guidance

**Emergency Kit Essentials:**
- Vet contact information
- First aid supplies
- Pet carrier or leash
- Recent photos of your pet
- Medical records

**Prevention Tips:**
- Keep toxic substances out of reach
- Regular vet checkups
- Pet-proof your home
- Learn pet CPR basics

Remember: When in doubt, call your vet immediately.''',
                'tags': ['Emergency Care', 'Health', 'Safety'],
                'image': 'blog-emergency-care.png'
            }
        ]

        created_count = 0
        for blog_data in sample_blogs:
            # Check if blog already exists
            existing_blog = Blog.objects(title=blog_data['title']).first()
            if existing_blog:
                self.stdout.write(
                    self.style.WARNING(f'Blog already exists: {blog_data["title"]}')
                )
                continue

            # Create blog
            blog = Blog(
                author=author,
                **blog_data
            )
            blog.save()

            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Created blog: {blog.title}')
            )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} sample blogs')
        )

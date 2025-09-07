from django.core.management.base import BaseCommand
from badges.models import Badge
from decimal import Decimal

class Command(BaseCommand):
    help = 'Create default badges for the pet adoption platform'

    def handle(self, *args, **options):
        badges_data = [
            {
                'name': 'Pet Guardian',
                'description': 'For users who successfully adopt pets through the platform',
                'icon': '🏠',
                'criteria': 'Successfully adopt a pet through PawsConnect',
                'category': 'adoption',
                'points_required': 10
            },
            {
                'name': 'Super Helper',
                'description': 'For users who assist with multiple adoptions',
                'icon': '⭐',
                'criteria': 'Help facilitate 5+ successful adoptions',
                'category': 'adoption',
                'points_required': 50
            },
            {
                'name': 'First Responder',
                'description': 'For users who quickly respond to urgent adoption needs',
                'icon': '🚨',
                'criteria': 'Respond to 3+ urgent adoption posts within 24 hours',
                'category': 'adoption',
                'points_required': 30
            },
            {
                'name': 'Big Fan',
                'description': 'For users who frequently engage with posts and show support',
                'icon': '❤️',
                'criteria': 'Like and interact with 50+ posts',
                'category': 'community',
                'points_required': 25
            },
            {
                'name': 'Community Leader',
                'description': 'For users who create helpful blog posts and guide others',
                'icon': '👑',
                'criteria': 'Publish 5+ helpful blog posts or guides',
                'category': 'community',
                'points_required': 100
            },
            {
                'name': 'Loyal Supporter',
                'description': 'For users who have been active for 6+ months',
                'icon': '🏆',
                'criteria': 'Maintain active account for 6+ months',
                'category': 'community',
                'points_required': 60
            },
            {
                'name': 'Generous Donor',
                'description': 'For users who make significant monetary contributions',
                'icon': '💰',
                'criteria': 'Donate $500+ to pet medical care',
                'category': 'donation',
                'points_required': 500
            },
            {
                'name': 'Item Supporter',
                'description': 'For users who donate food, toys, and supplies',
                'icon': '🎁',
                'criteria': 'Donate 10+ items (food, toys, supplies)',
                'category': 'donation',
                'points_required': 100
            },
            {
                'name': 'Emergency Aid',
                'description': 'For users who help with medical emergency posts',
                'icon': '🚑',
                'criteria': 'Contribute to 3+ emergency medical fundraisers',
                'category': 'donation',
                'points_required': 200
            },
            {
                'name': 'Volunteer',
                'description': 'For users who actively help with pet care and adoption events',
                'icon': '🤝',
                'criteria': 'Participate in 3+ volunteer events or activities',
                'category': 'volunteer',
                'points_required': 150
            }
        ]

        created_count = 0
        updated_count = 0

        for badge_data in badges_data:
            # Check if badge already exists
            existing_badge = Badge.objects(name=badge_data['name']).first()
            
            if existing_badge:
                # Update existing badge with new data
                for key, value in badge_data.items():
                    setattr(existing_badge, key, value)
                existing_badge.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated badge: {existing_badge.name}')
                )
            else:
                # Create new badge
                badge = Badge(**badge_data)
                badge.save()
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created badge: {badge.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed {len(badges_data)} badges. '
                f'Created: {created_count}, Updated: {updated_count}'
            )
        )

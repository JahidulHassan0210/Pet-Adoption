from django.core.management.base import BaseCommand
from users.models import User
import hashlib

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

class Command(BaseCommand):
    help = 'Create a superuser for the Pet Adoption Platform'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True, help='Superuser username')
        parser.add_argument('--email', type=str, required=True, help='Superuser email')
        parser.add_argument('--password', type=str, required=True, help='Superuser password')
        parser.add_argument('--first-name', type=str, default='', help='Superuser first name')
        parser.add_argument('--last-name', type=str, default='', help='Superuser last name')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        # Check if user already exists
        if User.objects(username=username).first():
            self.stdout.write(
                self.style.WARNING(f'User with username "{username}" already exists')
            )
            return

        if User.objects(email=email).first():
            self.stdout.write(
                self.style.WARNING(f'User with email "{email}" already exists')
            )
            return

        # Create superuser
        superuser = User(
            username=username,
            email=email,
            password=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_superuser=True
        )
        superuser.save()

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created superuser: {username}')
        )

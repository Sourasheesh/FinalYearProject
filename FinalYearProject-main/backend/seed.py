import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User, LoginHistory
from django.utils import timezone

def seed_db():
    if not User.objects.filter(email='admin@example.com').exists():
        admin = User.objects.create_user(
            username='admin@example.com',
            email='admin@example.com',
            password='password123',
            role='admin',
            email_verified=True,
            is_active=True
        )
        print("Created admin user")
        
        LoginHistory.objects.create(
            user=admin,
            ip_address='127.0.0.1',
            success=True
        )

    if not User.objects.filter(email='user@example.com').exists():
        user = User.objects.create_user(
            username='user@example.com',
            email='user@example.com',
            password='password123',
            role='user',
            email_verified=True,
            is_active=True
        )
        print("Created regular user")

        LoginHistory.objects.create(
            user=user,
            ip_address='127.0.0.1',
            success=True
        )
        
    print("Database seeded")

if __name__ == '__main__':
    seed_db()

from django.db import models
from accounts.models import User
import uuid


class UserProfile(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    uin = models.CharField(max_length=20, unique=True, blank=True)

    phone_number = models.CharField(max_length=15)

    created_at = models.DateTimeField(auto_now_add=True)

    created_by_admin = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_users"
    )

    def generate_uin(self):
        return "UIN-" + uuid.uuid4().hex[:10].upper()

    def save(self, *args, **kwargs):

        if not self.uin:
            self.uin = self.generate_uin()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.uin}"
from django.db import models
from django.conf import settings
from datetime import date
import json

User = settings.AUTH_USER_MODEL


class Identity(models.Model):

    IDENTITY_TYPES = [
        ("AADHAAR", "Aadhaar"),
        ("PAN", "PAN"),
        ("PASSPORT", "Passport"),
        ("VOTER_ID", "Voter ID"),
        ("DRIVING_LICENSE", "Driving License"),
    ]

    VERIFICATION_STATUS = [
        ("PENDING", "Pending"),
        ("VERIFIED", "Verified"),
        ("MISMATCH", "Mismatch"),
        ("REJECTED", "Rejected"),
    ]

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("SUSPENDED", "Suspended"),
        ("REVOKED", "Revoked"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="identities")

    identity_type = models.CharField(max_length=50, choices=IDENTITY_TYPES)

    identity_number = models.CharField(max_length=100, unique=True)

    full_name = models.CharField(max_length=255)
    father_name = models.CharField(max_length=255)
    mother_name = models.CharField(max_length=255)

    gender = models.CharField(max_length=20)

    date_of_birth = models.DateField()

    age = models.PositiveIntegerField(blank=True, null=True)

    nationality = models.CharField(max_length=100, default="Indian")

    address = models.TextField()

    email = models.EmailField()

    phone = models.CharField(max_length=15)

    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS,
        default="PENDING"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "identity_type")

    def save(self, *args, **kwargs):
        if self.date_of_birth:
            today = date.today()
            self.age = (
                today.year
                - self.date_of_birth.year
                - (
                    (today.month, today.day)
                    < (self.date_of_birth.month, self.date_of_birth.day)
                )
            )
        super().save(*args, **kwargs)


class IdentityMismatch(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    identity = models.ForeignKey(Identity, on_delete=models.CASCADE)

    field_name = models.CharField(max_length=100)

    previous_value = models.CharField(max_length=255)

    new_value = models.CharField(max_length=255)

    detected_at = models.DateTimeField(auto_now_add=True)




class Biometric(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    fingerprint_template = models.TextField(null=True, blank=True)

    iris_template = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
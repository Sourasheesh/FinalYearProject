from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class CustomUserManager(BaseUserManager):

    def create_user(self, email, username, password=None, role="user"):
        if not email:
            raise ValueError("Users must have an email")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            username=username,
            role=role
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, username, password):

        user = self.create_user(
            email=email,
            username=username,
            password=password,
            role="admin"
        )

        user.is_staff = True
        user.is_superuser = True
        user.email_verified = True
        user.save(using=self._db)

        return user

#Defines:
#Custom User Model
#LoginHistory model


class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("user", "User"),
    )

    id = models.AutoField(primary_key=True)

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255)

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")

    email_verified = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)

    otp_attempts = models.IntegerField(default=0)

    otp_code = models.CharField(max_length=6, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    def __str__(self):
        return self.email


class LoginHistory(models.Model):

    id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    null=True,
    blank=True
)

    login_time = models.DateTimeField(auto_now_add=True)

    ip_address = models.GenericIPAddressField()

    login_success = models.BooleanField()

    def __str__(self):
        return f"{self.user.email} - {self.login_time}"
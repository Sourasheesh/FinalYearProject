from rest_framework import serializers
from .models import User, LoginHistory
from users.models import UserProfile
import re

#Handles validation and request parsing.
class AdminSignupSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["email", "username", "password"]

    def create(self, validated_data):

        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            role="admin"
        )

        UserProfile.objects.create(
            user=user,
            phone_number=validated_data.get("phone_number", "")
        )

        return user


class SignupSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField()
    role = serializers.ChoiceField(choices=["user", "admin"], default="user")

    def create(self, validated_data):

        username = validated_data["email"].split("@")[0]

        user = User.objects.create_user(
            email=validated_data["email"],
            username=username,
            password=validated_data["password"],
            role=validated_data.get("role", "user")
        )

        UserProfile.objects.create(
            user=user,
            phone_number=validated_data.get("phone_number", "")
        )

        return user


class OTPVerifySerializer(serializers.Serializer):

    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField()

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        return value


class LoginHistorySerializer(serializers.ModelSerializer):

    success = serializers.BooleanField(source="login_success")
    timestamp = serializers.DateTimeField(source="login_time")
    ipAddress = serializers.CharField(source="ip_address")
    userId = serializers.IntegerField(source="user_id", read_only=True)

    class Meta:
        model = LoginHistory
        fields = ["id", "success", "timestamp", "ipAddress", "userId", "user", "login_time", "login_success", "ip_address"]
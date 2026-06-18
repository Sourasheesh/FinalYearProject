from rest_framework import serializers
from accounts.models import User
from .models import UserProfile
from rest_framework import serializers
from accounts.models import User
from .models import UserProfile
from accounts.services import generate_otp, send_otp_email


class CreateUserSerializer(serializers.Serializer):

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    phone_number = serializers.CharField()

    def create(self, validated_data):

        admin = self.context["request"].user

        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            role="user"
        )

        # 🔹 Generate OTP for new user
        otp = generate_otp()

        user.otp_code = otp
        user.email_verified = False
        user.save()

        # 🔹 Send OTP email
        send_otp_email(user.email, otp)

        UserProfile.objects.create(
            user=user,
            phone_number=validated_data["phone_number"],
            created_by_admin=admin
        )

        return user
    
class UserListSerializer(serializers.ModelSerializer):

    phone_number = serializers.CharField(source="profile.phone_number")

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "created_at"
        ]


class UpdateUserSerializer(serializers.Serializer):

    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField(required=False)

    def update(self, instance, validated_data):

        if "username" in validated_data:
            instance.username = validated_data["username"]

        if "email" in validated_data:
            instance.email = validated_data["email"]

        instance.save()

        profile = instance.profile

        if "phone_number" in validated_data:
            profile.phone_number = validated_data["phone_number"]
            profile.save()

        return instance
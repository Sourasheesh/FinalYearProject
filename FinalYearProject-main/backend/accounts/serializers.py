from rest_framework import serializers
from .models import User, LoginHistory

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

        return user


class OTPVerifySerializer(serializers.Serializer):

    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField()


class LoginHistorySerializer(serializers.ModelSerializer):

    class Meta:
        model = LoginHistory
        fields = "__all__"
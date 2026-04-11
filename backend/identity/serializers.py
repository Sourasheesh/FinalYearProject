from rest_framework import serializers
from .models import Identity, IdentityMismatch, Biometric


class IdentitySerializer(serializers.ModelSerializer):

    class Meta:
        model = Identity
        fields = "__all__"
        read_only_fields = ["verification_status", "age", "created_at"]

    def validate(self, data):

        user = data.get("user")
        identity_type = data.get("identity_type")

        if Identity.objects.filter(user=user, identity_type=identity_type).exists():
            raise serializers.ValidationError(
                "This user already has this identity type."
            )

        return data


class IdentityMismatchSerializer(serializers.ModelSerializer):

    class Meta:
        model = IdentityMismatch
        fields = "__all__"


class BiometricSerializer(serializers.ModelSerializer):

    class Meta:
        model = Biometric
        fields = "__all__"

    def validate(self, data):

        fingerprint = data.get("fingerprint_template")
        iris = data.get("iris_template")

        if not fingerprint and not iris:
            raise serializers.ValidationError(
                "Either fingerprint or iris must be provided."
            )

        return data
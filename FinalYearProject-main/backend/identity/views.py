from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Identity, IdentityMismatch, Biometric
from .serializers import (
    IdentitySerializer,
    IdentityMismatchSerializer,
    BiometricSerializer
)

from .models import Identity
from .permissions import IsAdmin
from .models import Identity, Biometric
from .utils import build_unified_identity
from users.models import UserProfile
import json
import numpy as np

from .biometric_utils import (
    extract_fingerprint_template,
    extract_iris_template
)

from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
import json
import numpy as np

from .models import Biometric
from .biometric_utils import (
    extract_fingerprint_template,
    extract_iris_template,
    match_fingerprint_templates,
    match_iris_templates
)

from .utils import detect_identity_mismatch


class CreateIdentity(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):

        serializer = IdentitySerializer(data=request.data)

        if serializer.is_valid():

            identity = serializer.save()

            existing = Identity.objects.filter(
                user=identity.user
            ).exclude(id=identity.id)

            detect_identity_mismatch(identity, existing)

            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


class GetUserIdentities(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, uin):

        try:
            profile = UserProfile.objects.get(uin=uin)
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "UIN not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        identities = Identity.objects.filter(user=profile.user)

        serializer = IdentitySerializer(identities, many=True)

        return Response({
            "uin": uin,
            "identities": serializer.data
        })


class UpdateIdentity(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request):

        identity_id = request.data.get("id")

        try:
            identity = Identity.objects.get(id=identity_id)
        except Identity.DoesNotExist:
            return Response({"error": "Identity not found"}, status=404)

        serializer = IdentitySerializer(identity, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


class DeleteIdentity(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request):

        identity_id = request.data.get("id")

        try:
            identity = Identity.objects.get(id=identity_id)
        except Identity.DoesNotExist:
            return Response({"error": "Identity not found"}, status=404)

        identity.delete()

        return Response({"message": "Identity deleted"})
    


class VerifyIdentity(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, uin):

        try:
            profile = UserProfile.objects.get(uin=uin)
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "UIN not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        identities = Identity.objects.filter(user=profile.user)

        serializer = IdentitySerializer(identities, many=True)

        return Response({
            "uin": uin,
            "identities": serializer.data
        })

    
class IdentityMismatchView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, uin):

        try:
            profile = UserProfile.objects.get(uin=uin)
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "UIN not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        mismatches = IdentityMismatch.objects.filter(user=profile.user)

        serializer = IdentityMismatchSerializer(mismatches, many=True)

        return Response({
            "uin": uin,
            "mismatches": serializer.data
        })
    
    
class ResolveMismatch(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request):

        identity_id = request.data.get("identity_id")
        action = request.data.get("action")

        try:
            identity = Identity.objects.get(id=identity_id)
        except Identity.DoesNotExist:
            return Response(
                {"error": "Identity not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if action == "verify":
            identity.verification_status = "VERIFIED"

        elif action == "reject":
            identity.verification_status = "REJECTED"

        else:
            return Response(
                {"error": "Invalid action"},
                status=status.HTTP_400_BAD_REQUEST
            )

        identity.save()

        return Response({
            "message": "Mismatch resolved",
            "verification_status": identity.verification_status
        })
    

class UploadBiometric(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):

        user_id = request.data.get("user")

        fingerprint = request.FILES.get("fingerprint")

        iris = request.FILES.get("iris")

        biometric, created = Biometric.objects.get_or_create(user_id=user_id)

        if fingerprint:

            template = extract_fingerprint_template(fingerprint)

            if template is not None:
                biometric.fingerprint_template = json.dumps(template.tolist())

        if iris:

            template = extract_iris_template(iris)

            if template is not None:
                biometric.iris_template = json.dumps(template.tolist())

        biometric.save()

        return Response({"message": "Biometric stored successfully"})
    
class ListAllIdentities(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        identities = Identity.objects.select_related("user").all()

        serializer = IdentitySerializer(identities, many=True)

        return Response({
            "count": identities.count(),
            "data": serializer.data
        })



class UnifiedIdentityCard(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        identities = Identity.objects.filter(user=user)

        primary, linked, profile = build_unified_identity(user, identities)

        biometric = Biometric.objects.filter(user=user).first()

        biometric_data = {
            "fingerprint_registered": bool(biometric and biometric.fingerprint_template),
            "iris_registered": bool(biometric and biometric.iris_template)
        }

        # Get UIN from profile
        uin = user.profile.uin if hasattr(user, "profile") else None

        return Response({
            "uin": uin,
            "user": {
                "id": user.id,
                **profile
            },
            "primary_identity": {
                "type": primary.identity_type if primary else None,
                "identity_number": primary.identity_number if primary else None,
                "verification_status": primary.verification_status if primary else None
            },
            "linked_identities": linked,
            "biometric": biometric_data
        })
    

class VerifyBiometric(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        user_id = request.data.get("user")
        fingerprint = request.FILES.get("fingerprint")
        iris = request.FILES.get("iris")

        # Validate request
        if not user_id:
            return Response(
                {"error": "user id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not fingerprint and not iris:
            return Response(
                {"error": "fingerprint or iris is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get biometric record
        try:
            biometric = Biometric.objects.get(user_id=user_id)
        except Biometric.DoesNotExist:
            return Response(
                {"error": "Biometric record not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        user = biometric.user

        # ---------------- Fingerprint Verification ----------------
        if fingerprint and biometric.fingerprint_template:

            input_template = extract_fingerprint_template(fingerprint)

            stored_template = np.array(
                json.loads(biometric.fingerprint_template),
                dtype=np.uint8
            )

            is_match = match_fingerprint_templates(
                input_template,
                stored_template
            )

            if is_match:
                return self.generate_token(user, "Fingerprint verified")

        # ---------------- Iris Verification ----------------
        if iris and biometric.iris_template:

            input_template = extract_iris_template(iris)

            stored_template = np.array(
                json.loads(biometric.iris_template),
                dtype=np.uint8
            )

            is_match = match_iris_templates(
                input_template,
                stored_template
            )

            if is_match:
                return self.generate_token(user, "Iris verified")

        return Response(
            {"error": "Biometric verification failed"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    def generate_token(self, user, message):
        """
        Generate JWT token after successful biometric verification
        """

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": message,
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh)
        })
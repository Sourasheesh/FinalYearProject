from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, LoginHistory
from .serializers import (
    AdminSignupSerializer,
    SignupSerializer,
    OTPVerifySerializer,
    LoginSerializer,
    LoginHistorySerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)

from .services import generate_otp, send_otp_email
from .permissions import IsAdminUser


# Utility function to get client IP
def get_client_ip(request):

    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")

    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")

    return ip



class AdminSignupView(APIView):

    def post(self, request):

        serializer = AdminSignupSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.save()

            otp = generate_otp()

            user.otp_code = otp
            user.save()

            send_otp_email(user.email, otp)

            return Response(
                {"message": "Admin created. OTP sent to email."},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class SignupView(APIView):

    def post(self, request):

        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.save()

            otp = generate_otp()

            user.otp_code = otp
            user.save()

            send_otp_email(user.email, otp)

            return Response(
                {"message": "Account created. OTP sent to email."},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class VerifyOTPView(APIView):

    def post(self, request):

        serializer = OTPVerifySerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if user.is_locked:
            return Response({"error": "Account is locked"}, status=403)

        if user.otp_code == otp:

            user.email_verified = True
            user.otp_attempts = 0
            user.otp_code = None
            user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role,
                "user_id": user.id
            })

        else:

            user.otp_attempts += 1

            if user.otp_attempts >= 3:
                user.is_locked = True

            user.save()

            return Response(
                {"error": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST
            )



class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=401)

        if not check_password(password, user.password):
            return Response({"error": "Invalid credentials"}, status=401)

        if not user.email_verified:
            return Response({"error": "Email not verified"}, status=403)

        if user.is_locked:
            return Response({"error": "Account locked"}, status=403)

        otp = generate_otp()

        user.otp_code = otp
        user.save()

        send_otp_email(user.email, otp)

        return Response({
            "message": "OTP sent to your email"
        })
    
class UserDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        history = LoginHistory.objects.filter(user=request.user).order_by("-login_time")

        serializer = LoginHistorySerializer(history, many=True)

        return Response({"message": "User dashboard data", "history": serializer.data})


class AdminDashboardView(APIView):

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):

        history = LoginHistory.objects.all().order_by("-login_time")

        serializer = LoginHistorySerializer(history, many=True)

        return Response({"message": "Admin dashboard data", "all_history": serializer.data})


class LoginHistoryView(APIView):

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):

        history = LoginHistory.objects.all().order_by("-login_time")

        serializer = LoginHistorySerializer(history, many=True)

        return Response(serializer.data)
    
class VerifyLoginOTPView(APIView):

    def post(self, request):

        email = request.data.get("email")
        otp = request.data.get("otp")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if user.otp_code == otp:

            user.otp_code = None
            user.otp_attempts = 0
            user.save()

            # Admin login → issue JWT directly
            if user.role == "admin":

                refresh = RefreshToken.for_user(user)

                return Response({
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "role": user.role,
                    "user_id": user.id
                })

            # User login → require biometric
            return Response({
                "message": "OTP verified",
                "next_step": "biometric_verification",
                "user_id": user.id,
                "role": user.role
            })

        else:

            user.otp_attempts += 1

            if user.otp_attempts >= 3:
                user.is_locked = True

            user.save()

            return Response({"error": "Invalid OTP"}, status=400)


class ForgotPasswordRequestView(APIView):

    def post(self, request):

        serializer = ForgotPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "No account found with this email."}, status=404)

        if user.is_locked:
            return Response({"error": "Account is locked"}, status=403)

        otp = generate_otp()

        user.otp_code = otp
        user.otp_attempts = 0
        user.save()

        send_otp_email(user.email, otp)

        return Response({"message": "OTP sent to your email for password reset."})


class ResetPasswordView(APIView):

    def post(self, request):

        serializer = ResetPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if user.is_locked:
            return Response({"error": "Account is locked"}, status=403)

        if user.otp_code != otp:
            user.otp_attempts += 1
            if user.otp_attempts >= 3:
                user.is_locked = True
            user.save()
            return Response({"error": "Invalid OTP"}, status=400)

        user.set_password(new_password)
        user.otp_code = None
        user.otp_attempts = 0
        user.save()

        return Response({"message": "Password reset successful."})
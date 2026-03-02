import random
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, LoginHistory
from .serializers import SignupSerializer, LoginHistorySerializer
from .permissions import IsAdminRole, IsUserRole

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # In a real app, generate a secure token for verification
            token = f"dummy-token-{user.id}"
            verify_url = f"http://localhost:5000/api/verify-email/{token}/"
            send_mail(
                'Verify your email',
                f'Click to verify: {verify_url}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return Response({'message': 'Signup successful. Please verify your email.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        # In a real app, decode token and get user
        try:
            user_id = token.split('-')[-1]
            user = User.objects.get(id=user_id)
            if not user.email_verified:
                user.email_verified = True
                user.is_active = True
                user.save()
                return Response({'message': 'Email verified successfully.'})
            return Response({'message': 'Email already verified.'})
        except Exception:
            return Response({'message': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)

class LoginStep1View(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        ip_address = get_client_ip(request)

        if user.is_locked:
            LoginHistory.objects.create(user=user, ip_address=ip_address, success=False)
            return Response({'message': 'Account is locked', 'is_locked': True}, status=status.HTTP_401_UNAUTHORIZED)

        # Authenticate checks password
        auth_user = authenticate(username=email, password=password)
        if not auth_user:
            user.failed_attempts += 1
            if user.failed_attempts >= 3:
                user.is_locked = True
            user.save()
            LoginHistory.objects.create(user=user, ip_address=ip_address, success=False)
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.email_verified:
            return Response({'message': 'Please verify your email first.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Correct password
        user.failed_attempts = 0
        
        # Generate OTP
        otp_code = str(random.randint(100000, 999999))
        user.otp_code = otp_code
        user.otp_expiry = timezone.now() + timedelta(minutes=5)
        user.save()

        # Send OTP
        send_mail(
            'Your OTP Code',
            f'Your OTP code is {otp_code}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        return Response({'message': 'OTP sent'})

class LoginStep2View(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'Invalid details'}, status=status.HTTP_401_UNAUTHORIZED)

        ip_address = get_client_ip(request)

        if not user.otp_code or not user.otp_expiry:
            LoginHistory.objects.create(user=user, ip_address=ip_address, success=False)
            return Response({'message': 'OTP not requested or expired'}, status=status.HTTP_401_UNAUTHORIZED)

        if timezone.now() > user.otp_expiry:
            LoginHistory.objects.create(user=user, ip_address=ip_address, success=False)
            return Response({'message': 'OTP expired'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.otp_code != otp:
            LoginHistory.objects.create(user=user, ip_address=ip_address, success=False)
            return Response({'message': 'Invalid OTP'}, status=status.HTTP_401_UNAUTHORIZED)

        # Valid OTP
        user.otp_code = None
        user.otp_expiry = None
        user.save()
        LoginHistory.objects.create(user=user, ip_address=ip_address, success=True)

        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': user.role
        })

class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsUserRole]

    def get(self, request):
        history = LoginHistory.objects.filter(user=request.user).order_by('-timestamp')[:10]
        serializer = LoginHistorySerializer(history, many=True)
        return Response({
            'message': f'Welcome User {request.user.email}',
            'history': serializer.data
        })

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        history = LoginHistory.objects.all().order_by('-timestamp')[:50]
        serializer = LoginHistorySerializer(history, many=True)
        return Response({
            'message': f'Welcome Admin {request.user.email}',
            'all_history': serializer.data
        })

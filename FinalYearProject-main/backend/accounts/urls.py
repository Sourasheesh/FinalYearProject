from django.urls import path
from .views import (
    AdminSignupView,
    SignupView,
    VerifyLoginOTPView,
    VerifyOTPView,
    LoginView,
    LoginHistoryView,
    UserDashboardView,
    AdminDashboardView,
    ForgotPasswordRequestView,
    ResetPasswordView,
)

urlpatterns = [

    path("admin/signup", AdminSignupView.as_view()),
    path("signup/", SignupView.as_view()),

    path("verify-otp/", VerifyOTPView.as_view()),

    path("login/", LoginView.as_view()),

    path("forgot-password/", ForgotPasswordRequestView.as_view()),

    path("reset-password/", ResetPasswordView.as_view()),

    path("verify-login-otp/", VerifyLoginOTPView.as_view()),

    path("login-history/", LoginHistoryView.as_view()),

    path("user/dashboard/", UserDashboardView.as_view()),

    path("admin/dashboard/", AdminDashboardView.as_view()),
]
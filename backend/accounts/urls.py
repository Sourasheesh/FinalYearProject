from django.urls import path
from .views import (
    AdminSignupView,
    VerifyLoginOTPView,
    VerifyOTPView,
    LoginView,
    LoginHistoryView
)

urlpatterns = [

    path("admin/signup", AdminSignupView.as_view()),

    path("verify-otp/", VerifyOTPView.as_view()),

    path("login/", LoginView.as_view()),

    path("verify-login-otp/", VerifyLoginOTPView.as_view()),

    path("login-history/", LoginHistoryView.as_view()),
]
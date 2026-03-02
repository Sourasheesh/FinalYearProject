from django.urls import path
from .views import (
    SignupView,
    VerifyEmailView,
    LoginStep1View,
    LoginStep2View,
    UserDashboardView,
    AdminDashboardView
)

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('login/', LoginStep1View.as_view(), name='login'),
    path('verify-otp/', LoginStep2View.as_view(), name='verify-otp'),
    path('user/dashboard/', UserDashboardView.as_view(), name='user-dashboard'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
]

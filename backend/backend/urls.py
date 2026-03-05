from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.shortcuts import redirect


# Simple API health check
def home(request):
    return JsonResponse({
        "status": "Backend running ✅",
        "message": "Django + DRF Auth System Active",
    })


urlpatterns = [
    path('', home),  # Root endpoint
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
]
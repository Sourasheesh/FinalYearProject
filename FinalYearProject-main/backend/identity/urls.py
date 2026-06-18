from django.urls import path
from .views import (
    CreateIdentity,
    GetUserIdentities,
    ResolveMismatch,
    UnifiedIdentityCard,
    UpdateIdentity,
    DeleteIdentity,
    VerifyIdentity,
    IdentityMismatchView,
    UploadBiometric,
    VerifyBiometric,
    ListAllIdentities
)

urlpatterns = [

    path("create/", CreateIdentity.as_view()),


    path("update/", UpdateIdentity.as_view()),

    path("delete/", DeleteIdentity.as_view()),

    path("list/", ListAllIdentities.as_view()),

    path("unified-card/", UnifiedIdentityCard.as_view()),

    path("verify/<str:uin>/", VerifyIdentity.as_view()),

    path("user/<str:uin>/", GetUserIdentities.as_view()),
    
    path("mismatch/<str:uin>/", IdentityMismatchView.as_view()),

    path("resolve-mismatch/", ResolveMismatch.as_view()),

    path("upload-biometric/", UploadBiometric.as_view()),

    path("verify-biometric/", VerifyBiometric.as_view()),
]
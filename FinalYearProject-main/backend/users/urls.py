from django.urls import path
from .views import (
    CreateUserView,
    UserListView,
    UpdateUserView,
    DeleteUserView
)

urlpatterns = [

    path("create-user/", CreateUserView.as_view()),

    path("list/", UserListView.as_view()),

    path("update/<int:user_id>/", UpdateUserView.as_view()),

    path("delete/<int:user_id>/", DeleteUserView.as_view()),

]
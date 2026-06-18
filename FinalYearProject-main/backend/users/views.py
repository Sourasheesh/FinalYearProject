from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.models import User
from .models import UserProfile
from .serializers import (
    CreateUserSerializer,
    UserListSerializer,
    UpdateUserSerializer
)

from .permissions import IsAdmin


class UpdateOwnProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        serializer = UpdateUserSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response({"message": "Profile updated"})

        return Response(serializer.errors, status=400)


class CreateUserView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):

        serializer = CreateUserSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():

            serializer.save()

            return Response({"message": "User created successfully"})

        return Response(serializer.errors, status=400)


class UserListView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        users = User.objects.all()

        serializer = UserListSerializer(users, many=True)

        return Response(serializer.data)


class UpdateUserView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, user_id):

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        serializer = UpdateUserSerializer(user, data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response({"message": "User updated"})

        return Response(serializer.errors)


class DeleteUserView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, user_id):

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        user.delete()

        return Response({"message": "User deleted"})
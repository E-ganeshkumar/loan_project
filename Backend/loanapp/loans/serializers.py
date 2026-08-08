from rest_framework import serializers
from django.contrib.auth.models import User
from .models import lead, BRERule


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )


class leadSerializer(serializers.ModelSerializer):
    class Meta:
        model = lead
        fields = "__all__"


class BRERuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BRERule
        fields = "__all__"
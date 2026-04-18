from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.get_or_create(user=user)
        return user


class UserProfileSerializer(serializers.Serializer):
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    about = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.CharField(required=False, allow_blank=True)

    def to_representation(self, instance):
        profile, _ = UserProfile.objects.get_or_create(user=instance)
        return {
            'username': instance.username,
            'email': instance.email,
            'first_name': instance.first_name,
            'last_name': instance.last_name,
            'phone': profile.phone,
            'about': profile.about,
            'avatar': profile.avatar,
        }

    def update(self, instance, validated_data):
        profile, _ = UserProfile.objects.get_or_create(user=instance)

        for field in ['email', 'first_name', 'last_name']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()

        for field in ['phone', 'about', 'avatar']:
            if field in validated_data:
                setattr(profile, field, validated_data[field])
        profile.save()

        return instance
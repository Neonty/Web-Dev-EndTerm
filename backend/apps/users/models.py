from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=30, blank=True, default='')
    about = models.TextField(blank=True, default='')
    avatar = models.TextField(blank=True, default='')

    def __str__(self):
        return f"Profile: {self.user.username}"

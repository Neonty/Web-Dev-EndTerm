from django.db import models
from django.contrib.auth.models import User

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey('doctors.Doctor', on_delete=models.CASCADE, related_name='appointments')
    date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.user.username} - {self.doctor.name}"
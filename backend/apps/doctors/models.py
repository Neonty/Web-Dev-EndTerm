from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Doctor(models.Model):
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    experience_years = models.IntegerField()
    symptoms = models.ManyToManyField('symptoms.Symptom', related_name='doctors')

    def __str__(self):
        return f"{self.name} - {self.specialization}"

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if not reviews:
            return 0
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    @property
    def review_count(self):
        return self.reviews.count()


class Review(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('doctor', 'user')  # бір пайдаланушы бір рет қана

    def __str__(self):
        return f"{self.user.username} → {self.doctor.name}: {self.rating}★"
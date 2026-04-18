from django.db import models

class Doctor(models.Model):
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    experience_years = models.IntegerField()
    symptoms = models.ManyToManyField('symptoms.Symptom', related_name='doctors')

    def __str__(self):
        return f"{self.name} - {self.specialization}"
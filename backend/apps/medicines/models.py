from django.db import models

class Medicine(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    symptoms = models.ManyToManyField('symptoms.Symptom', related_name='medicines')
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name
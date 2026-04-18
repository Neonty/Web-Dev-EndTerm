from rest_framework import viewsets
from .models import Medicine
from .serializers import MedicineSerializer

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
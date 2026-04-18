from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q
from .serializers import SymptomInputSerializer
from .models import Symptom
from apps.medicines.models import Medicine
from apps.doctors.models import Doctor
from apps.medicines.serializers import MedicineSerializer
from apps.doctors.serializers import DoctorSerializer

def _normalize_token(value: str) -> str:
    return (value or '').strip().lower()

def _expand_tokens(tokens):
    expanded = []
    for t in tokens:
        nt = _normalize_token(t)
        if not nt:
            continue
        expanded.append(nt)

        # lightweight synonym expansion for common allergy terms
        if 'аллерг' in nt or 'allerg' in nt:
            expanded.extend([
                'allergy', 'allergic', 'аллергия', 'аллергический', 'аллергиялық',
                'rash', 'сыпь', 'бөртпе', 'itch', 'зуд', 'қышу',
                'urticaria', 'hives', 'чихание', 'түшкіру', 'sneezing',
                'runny nose', 'насморк', 'ринит', 'rhinitis',
                'watery eyes', 'слезотечение',
                'swelling', 'отек', 'ісіну',
            ])
    # de-dup
    out = []
    seen = set()
    for t in expanded:
        if t in seen:
            continue
        seen.add(t)
        out.append(t)
    return out

@api_view(['POST'])
@permission_classes([AllowAny])
def analyze_symptoms(request):
    serializer = SymptomInputSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    symptom_keywords = serializer.validated_data.get('symptoms') or []
    codes = serializer.validated_data.get('codes') or []
    text = serializer.validated_data.get('text') or ''

    tokens = _expand_tokens([*symptom_keywords, *codes, text])

    q = Q()
    for t in tokens:
        # exact keyword match is fastest; icontains/name adds tolerance for RU/EN/KZ labels
        q |= Q(keyword__iexact=t) | Q(keyword__icontains=t) | Q(name__icontains=t)

    matched = Symptom.objects.filter(q).distinct() if q else Symptom.objects.none()
    medicines = Medicine.objects.filter(symptoms__in=matched).distinct()
    doctors = Doctor.objects.filter(symptoms__in=matched).distinct()

    return Response({
        'medicines': MedicineSerializer(medicines, many=True).data,
        'doctors': DoctorSerializer(doctors, many=True).data,
    })
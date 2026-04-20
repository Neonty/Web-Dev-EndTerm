from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.medicines.views import MedicineViewSet
from apps.appointments.views import AppointmentViewSet
from apps.doctors.views import DoctorViewSet
from apps.symptoms.views import analyze_symptoms
from apps.ai.views import ai_symptom_advice
from apps.users.views import logout_view, register_view, me_view

router = DefaultRouter()
router.register(r'medicines', MedicineViewSet, basename='medicine')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'doctors', DoctorViewSet, basename='doctor')

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/register/', register_view, name='register'),
    path('api/me/', me_view, name='me'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', logout_view, name='logout'),

    path('api/analyze/', analyze_symptoms, name='analyze_symptoms'),
    path('api/ai/symptoms/', ai_symptom_advice, name='ai_symptom_advice'),
    path('api/', include(router.urls)),
    path('api/', include('apps.orders.urls')),
]
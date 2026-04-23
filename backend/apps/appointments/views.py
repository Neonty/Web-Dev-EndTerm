from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, date
from .models import Appointment, DoctorSchedule
from .serializers import AppointmentSerializer, DoctorScheduleSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(
            user=self.request.user
        ).select_related('doctor', 'schedule').order_by('-date')

    def perform_create(self, serializer):
        schedule_id = self.request.data.get('schedule')
        appointment = serializer.save(user=self.request.user)

        # Слотты бос емес деп белгілеу
        if schedule_id:
            try:
                slot = DoctorSchedule.objects.get(id=schedule_id)
                slot.is_booked = True
                slot.save()
            except DoctorSchedule.DoesNotExist:
                pass

    def perform_destroy(self, instance):
        # Жазылуды жойғанда слотты қайта босату
        if instance.schedule:
            instance.schedule.is_booked = False
            instance.schedule.save()
        instance.delete()


# ─── SCHEDULE ENDPOINTS ───────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def doctor_schedule(request, doctor_id):
    """
    GET /api/doctors/{id}/schedule/?date=2026-04-21
    Белгілі бір күннің бос слоттарын қайтарады.
    """
    date_str = request.query_params.get('date')

    qs = DoctorSchedule.objects.filter(doctor_id=doctor_id, is_booked=False)

    if date_str:
        try:
            filter_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            qs = qs.filter(date=filter_date)
        except ValueError:
            return Response({'error': 'Күн форматы қате: YYYY-MM-DD'}, status=400)
    else:
        # Бүгіннен бастап 30 күн
        today = date.today()
        qs = qs.filter(date__gte=today, date__lte=today + timedelta(days=30))

    serializer = DoctorScheduleSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def doctor_available_dates(request, doctor_id):
    """
    GET /api/doctors/{id}/available-dates/
    Бос күндер тізімін қайтарады (calendar үшін).
    """
    today = date.today()
    slots = DoctorSchedule.objects.filter(
        doctor_id=doctor_id,
        is_booked=False,
        date__gte=today,
        date__lte=today + timedelta(days=60)
    ).values_list('date', flat=True).distinct()

    return Response({'available_dates': [str(d) for d in sorted(set(slots))]})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_schedule_slots(request, doctor_id):
    """
    POST /api/doctors/{id}/create-slots/
    Admin үшін: белгілі күнге слоттар жасайды.
    Body: { "date": "2026-04-25", "times": ["09:00", "10:00", "11:00"] }
    """
    date_str = request.data.get('date')
    times = request.data.get('times', [])

    try:
        slot_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return Response({'error': 'Күн форматы қате'}, status=400)

    created = []
    for t in times:
        try:
            start = datetime.strptime(t, '%H:%M').time()
            end_dt = datetime.combine(slot_date, start) + timedelta(minutes=30)
            end = end_dt.time()
            slot, _ = DoctorSchedule.objects.get_or_create(
                doctor_id=doctor_id,
                date=slot_date,
                start_time=start,
                defaults={'end_time': end}
            )
            created.append(str(slot))
        except ValueError:
            continue

    return Response({'created': len(created), 'slots': created})
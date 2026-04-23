from rest_framework import serializers
from .models import Appointment, DoctorSchedule


class DoctorScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorSchedule
        fields = ['id', 'doctor', 'date', 'start_time', 'end_time', 'is_booked']
        read_only_fields = ['is_booked']


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    doctor_spec = serializers.CharField(source='doctor.specialization', read_only=True)
    schedule_info = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor', 'doctor_name', 'doctor_spec',
            'schedule', 'schedule_info', 'date', 'status', 'notes'
        ]
        read_only_fields = ['user', 'status']

    def get_schedule_info(self, obj):
        if not obj.schedule:
            return None
        return {
            'date': str(obj.schedule.date),
            'start_time': str(obj.schedule.start_time),
            'end_time': str(obj.schedule.end_time),
        }
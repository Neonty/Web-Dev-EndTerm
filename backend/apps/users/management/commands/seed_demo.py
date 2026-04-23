from datetime import date, time, timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.appointments.models import DoctorAvailability
from apps.doctors.models import DoctorProfile, DoctorReview
from apps.medicines.models import Medicine, MedicineReview
from apps.users.models import PatientProfile, UserProfile


class Command(BaseCommand):
    help = 'Seed SmartMed demo users, doctors, medicines, reviews and availability slots.'

    def handle(self, *args, **options):
        patient = self.create_user(
            username='patient_demo',
            email='patient@smartmed.kz',
            password='patient123',
            role=UserProfile.ROLE_PATIENT,
            full_name='Aruzhan Patient',
            phone='+7 701 111 2233',
            address='Almaty, Satpayev 22',
        )
        PatientProfile.objects.get_or_create(
            user=patient,
            defaults={'age': 21, 'gender': 'female', 'blood_type': 'O+', 'chronic_diseases': 'Seasonal allergy'},
        )

        doctors = [
            ('doctor_amina', 'doctor123', 'Dr. Amina Sadykova', 'Therapist', 9, 'KBTU Medical Hub', 'Tole Bi 59', 'Evidence-based primary care and flu cases.'),
            ('doctor_daniyar', 'doctor123', 'Dr. Daniyar Omarov', 'Cardiologist', 12, 'SmartMed Cardio Center', 'Abay 109', 'Heart health, ECG interpretation, hypertension.'),
            ('doctor_madina', 'doctor123', 'Dr. Madina Kim', 'ENT Specialist', 7, 'ENT Care Almaty', 'Nazarbayev 120', 'Throat, sinus, allergy and ear infections.'),
        ]
        doctor_profiles = []
        for username, password, full_name, specialization, exp, clinic, address, bio in doctors:
            user = self.create_user(username, f'{username}@smartmed.kz', password, UserProfile.ROLE_DOCTOR, full_name, '+7 702 444 5566', address)
            profile, _ = DoctorProfile.objects.update_or_create(
                user=user,
                defaults={
                    'specialization': specialization,
                    'experience_years': exp,
                    'clinic_name': clinic,
                    'clinic_address': address,
                    'bio': bio,
                    'consultation_price': Decimal('9000') + Decimal(exp * 400),
                    'image': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80',
                },
            )
            doctor_profiles.append(profile)

        medicines = [
            ('Paracetamol', 'Pain and fever reducer for short-term symptom relief.', '900', 80, 'KazPharm', 'Pain & Fever', 'fever flu pain'),
            ('Cough Relief Syrup', 'Syrup for dry cough and throat irritation.', '1800', 45, 'MedLine', 'Respiratory', 'cough flu throat'),
            ('Allergy Guard', 'Antihistamine tablets for seasonal allergy symptoms.', '2400', 36, 'HealthPro', 'Allergy', 'allergy runny nose headache'),
            ('Vitamin C Complex', 'Daily immune support with vitamin C and zinc.', '3200', 65, 'NutriLab', 'Vitamins', 'weakness fatigue cold flu'),
            ('Saline Nasal Spray', 'Gentle nasal spray for congestion and runny nose.', '1500', 52, 'CleanAir', 'Cold Care', 'cold allergy runny nose'),
        ]
        medicine_objs = []
        for name, description, price, stock, manufacturer, category, suggested_for in medicines:
            medicine, _ = Medicine.objects.update_or_create(
                name=name,
                defaults={
                    'description': description,
                    'price': Decimal(price),
                    'stock_quantity': stock,
                    'manufacturer': manufacturer,
                    'category': category,
                    'suggested_for': suggested_for,
                    'image': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
                    'is_available': True,
                },
            )
            medicine_objs.append(medicine)

        for doctor in doctor_profiles:
            DoctorReview.objects.update_or_create(
                doctor=doctor,
                patient=patient,
                defaults={'rating': 5 if doctor.experience_years > 8 else 4, 'comment': 'Clear explanation and professional consultation.'},
            )
            for days in range(1, 8):
                slot_date = timezone.localdate() + timedelta(days=days)
                for slot_time in [time(10, 0), time(11, 30), time(15, 0)]:
                    DoctorAvailability.objects.get_or_create(
                        doctor=doctor,
                        date=slot_date,
                        start_time=slot_time,
                        defaults={'end_time': time(slot_time.hour + 1, slot_time.minute), 'is_available': True},
                    )

        for medicine in medicine_objs[:3]:
            MedicineReview.objects.update_or_create(
                medicine=medicine,
                patient=patient,
                defaults={'rating': 4, 'comment': 'Helpful for mild symptoms, used as directed.'},
            )

        self.stdout.write(self.style.SUCCESS('SmartMed demo data created.'))

    def create_user(self, username, email, password, role, full_name, phone, address):
        user, created = User.objects.get_or_create(username=username, defaults={'email': email})
        user.email = email
        first_name, _, last_name = full_name.partition(' ')
        user.first_name = first_name
        user.last_name = last_name
        user.set_password(password)
        user.save()
        UserProfile.objects.update_or_create(
            user=user,
            defaults={'role': role, 'full_name': full_name, 'phone': phone, 'address': address},
        )
        return user

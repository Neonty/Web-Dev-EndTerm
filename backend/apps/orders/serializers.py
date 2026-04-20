from rest_framework import serializers
from .models import Cart, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    medicine_name  = serializers.CharField(source='medicine.name', read_only=True)
    medicine_price = serializers.DecimalField(
        source='medicine.price', max_digits=10, decimal_places=2, read_only=True
    )
    total_price = serializers.FloatField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'medicine', 'medicine_name', 'medicine_price', 'quantity', 'total_price', 'added_at']


class OrderItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'medicine', 'medicine_name', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    appointment_info = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'total_amount', 'status', 'created_at', 'items', 'appointment_info']

    def get_appointment_info(self, obj):
        if not obj.appointment:
            return None
        appt = obj.appointment
        return {
            'id': appt.id,
            'doctor': appt.doctor.name if appt.doctor else None,
            'specialization': appt.doctor.specialization if appt.doctor else None,
            'date': str(appt.date),
            'status': appt.status,
        }
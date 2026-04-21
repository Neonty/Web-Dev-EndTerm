from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Cart, Order, OrderItem
from .serializers import CartItemSerializer, OrderSerializer
from apps.medicines.models import Medicine
from apps.appointments.models import Appointment

APPOINTMENT_PRICE = 5000  # теңге, fake баға


# ─── CART ────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_list(request):
    items = Cart.objects.filter(user=request.user).select_related('medicine')
    serializer = CartItemSerializer(items, many=True)
    total = sum(item.total_price for item in items)
    return Response({
        'items': serializer.data,
        'total': total,
        'count': items.count()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cart_add(request):
    medicine_id = request.data.get('medicine_id')
    quantity = int(request.data.get('quantity', 1))

    try:
        medicine = Medicine.objects.get(id=medicine_id)
    except Medicine.DoesNotExist:
        return Response({'error': 'Дәрі табылмады'}, status=status.HTTP_404_NOT_FOUND)

    if medicine.stock < quantity:
        return Response({'error': 'Қоймада мұнша дәрі жоқ'}, status=status.HTTP_400_BAD_REQUEST)

    cart_item, created = Cart.objects.get_or_create(
        user=request.user,
        medicine=medicine,
        defaults={'quantity': quantity}
    )
    if not created:
        if medicine.stock < (cart_item.quantity + quantity):
            return Response({'error': 'Қоймадағы шектен астыңыз'}, status=status.HTTP_400_BAD_REQUEST)
        cart_item.quantity += quantity
        cart_item.save()

    return Response(CartItemSerializer(cart_item).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cart_update(request, item_id):
    try:
        item = Cart.objects.get(id=item_id, user=request.user)
    except Cart.DoesNotExist:
        return Response({'error': 'Табылмады'}, status=status.HTTP_404_NOT_FOUND)

    quantity = int(request.data.get('quantity', 1))
    if quantity <= 0:
        item.delete()
        return Response({'message': 'Жойылды'})

    item.quantity = quantity
    item.save()
    return Response(CartItemSerializer(item).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cart_remove(request, item_id):
    try:
        item = Cart.objects.get(id=item_id, user=request.user)
        item.delete()
        return Response({'message': 'Жойылды'})
    except Cart.DoesNotExist:
        return Response({'error': 'Табылмады'}, status=status.HTTP_404_NOT_FOUND)


# ─── CHECKOUT ────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    """
    Fake төлем. Корзинадағы дәрілер + қосымша дәрігер жазылуы бір чекпен төленеді.

    Body:
        card_number   : str
        card_expiry   : str  (MM/YY)
        card_cvv      : str
        appointment_id: int | null  (міндетті емес)
    """
    # --- Карта валидациясы (fake) ---
    card_number = str(request.data.get('card_number', '')).replace(' ', '')
    card_expiry = str(request.data.get('card_expiry', ''))
    card_cvv = str(request.data.get('card_cvv', ''))

    if not card_number or not card_expiry or not card_cvv:
        return Response({'error': 'Карта деректерін толтырыңыз'}, status=status.HTTP_400_BAD_REQUEST)

    if len(card_number) < 16:
        return Response({'error': 'Карта нөмірі дұрыс емес'}, status=status.HTTP_400_BAD_REQUEST)

    # --- Корзина ---
    cart_items = Cart.objects.filter(user=request.user).select_related('medicine')
    appointment = None
    appointment_id = request.data.get('appointment_id')

    for item in cart_items:
        if item.medicine.stock < item.quantity:
            return Response({
                'error': f'Кешіріңіз, {item.medicine.name} таусылып қалды'
            }, status=status.HTTP_400_BAD_REQUEST)

    if not cart_items.exists() and not appointment_id:
        return Response({'error': 'Корзина бос және дәрігер жазылуы жоқ'}, status=status.HTTP_400_BAD_REQUEST)

    # --- Дәрігер жазылуы ---
    appointment_cost = 0
    if appointment_id:
        try:
            appointment = Appointment.objects.get(id=appointment_id, user=request.user)
            appointment_cost = APPOINTMENT_PRICE
        except Appointment.DoesNotExist:
            return Response({'error': 'Жазылу табылмады'}, status=status.HTTP_404_NOT_FOUND)

    # --- Жалпы сумма ---
    medicines_total = sum(item.total_price for item in cart_items)
    total = medicines_total + appointment_cost

    # --- Order жасау ---
    order = Order.objects.create(
        user=request.user,
        appointment=appointment,
        total_amount=total,
        status='paid'
    )

    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            medicine=item.medicine,
            quantity=item.quantity,
            price=item.medicine.price
        )
        item.medicine.stock -= item.quantity
        item.medicine.save()

    # Appointment статусын approved-ке ауыстыру
    if appointment:
        appointment.status = 'approved'
        appointment.save()

    # Корзинаны тазалау
    cart_items.delete()

    return Response({
        'message': 'Төлем сәтті өтті! 🎉',
        'order_id': order.id,
        'medicines_total': medicines_total,
        'appointment_cost': appointment_cost,
        'total': total,
        'status': 'paid'
    }, status=status.HTTP_201_CREATED)


# ─── ORDER HISTORY ────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_history(request):
    orders = (
        Order.objects
        .filter(user=request.user)
        .prefetch_related('items__medicine')
        .select_related('appointment__doctor')
        .order_by('-created_at')
    )
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)
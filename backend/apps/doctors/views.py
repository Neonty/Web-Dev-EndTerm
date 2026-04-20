from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from .models import Doctor, Review
from .serializers import DoctorSerializer, ReviewSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.prefetch_related('reviews').all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['get'], url_path='reviews')
    def get_reviews(self, request, pk=None):
        """GET /api/doctors/{id}/reviews/"""
        doctor = self.get_object()
        reviews = doctor.reviews.select_related('user').order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='reviews',
            permission_classes=[IsAuthenticated])
    def add_review(self, request, pk=None):
        """POST /api/doctors/{id}/reviews/"""
        doctor = self.get_object()

        # Бір пайдаланушы екі рет баға қоя алмайды
        if Review.objects.filter(doctor=doctor, user=request.user).exists():
            return Response(
                {'error': 'Сіз бұл дәрігерге бұрын баға қойдыңыз'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(doctor=doctor, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='reviews/my',
            permission_classes=[IsAuthenticated])
    def delete_review(self, request, pk=None):
        """DELETE /api/doctors/{id}/reviews/my/"""
        doctor = self.get_object()
        try:
            review = Review.objects.get(doctor=doctor, user=request.user)
            review.delete()
            return Response({'message': 'Пікір жойылды'})
        except Review.DoesNotExist:
            return Response(
                {'error': 'Пікір табылмады'},
                status=status.HTTP_404_NOT_FOUND
            )
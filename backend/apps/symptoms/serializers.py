from rest_framework import serializers

class SymptomInputSerializer(serializers.Serializer):
    symptoms = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )
    text = serializers.CharField(required=False, allow_blank=True, default='')
    severity = serializers.CharField(required=False, allow_blank=True, default='')
    startDate = serializers.CharField(required=False, allow_blank=True, default='')
    codes = serializers.ListField(child=serializers.CharField(), required=False, default=list)
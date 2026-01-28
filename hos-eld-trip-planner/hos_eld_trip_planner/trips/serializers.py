from rest_framework import serializers

class TripSerializer(serializers.Serializer):
    dist_btwn_current_and_pickup = serializers.IntegerField(required=True, min_value=0)
    dist_btwn_pickup_and_dropoff = serializers.IntegerField(required=True, min_value=0)
    cycles_used = serializers.IntegerField(required=True, min_value=0, max_value=70)
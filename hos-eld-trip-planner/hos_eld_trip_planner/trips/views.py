from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from trips.serializers import TripSerializer
from trips.utils import TripSimulator

import json

@api_view(["POST"])
def simluate_trip(request):
    data = json.loads(request.body)
    serializer = TripSerializer(data=data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    trip_simulator = TripSimulator(**data)
    
    res = {
        "days": trip_simulator.simulate()
    }
    return Response(res)
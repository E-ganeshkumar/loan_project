from django.shortcuts import render
from rest_framework import generics
from .models import lead,BRERule
from django.contrib.auth.models import User
from .serializers import leadSerializer,UserSerializer,BRERuleSerializer
from rest_framework.response import Response 
from .services import credit_score
import hashlib
from rest_framework.views import APIView

# Create your views here.

class userlist(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class leadview(generics.ListCreateAPIView):
    queryset = lead.objects.all()
    serializer_class = leadSerializer

class leaddetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = lead.objects.all()
    serializer_class = leadSerializer

class BRERuleView(generics.ListCreateAPIView):
    queryset = BRERule.objects.all()
    serializer_class = BRERuleSerializer


class BRERuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BRERule.objects.all()
    serializer_class = BRERuleSerializer
 
class CreditScoreAPIView(generics.GenericAPIView):
     def post(self, request, lead_id): 
        result = credit_score(lead_id) 
        return Response(result)

class MockCreditScoreAPIView(APIView):
    """
    Stand-in for the real bureau API. Returns a deterministic fake score
    (300-900) based on the mobile number, so the same lead always gets the
    same score. Point CREDIT_SCORE_API_URL at this in settings.py.
    Remove this once you have a real provider.
    """
    def post(self, request):
        mobile = request.data.get("mobile", "")
        digest = int(hashlib.sha256(mobile.encode()).hexdigest(), 16)
        score = 300 + (digest % 601)  # 300-900
        return Response({"credit_score": score})
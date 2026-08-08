from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView

urlpatterns = [

    path("users/", userlist.as_view()),

    path("leads/", leadview.as_view()),
    path("leads/<int:pk>/", leaddetails.as_view()),

    path("rules/", BRERuleView.as_view()),
    path("rules/<int:pk>/", BRERuleDetailView.as_view()),

    path('login/',TokenObtainPairView.as_view()),
    path('referesh/',TokenRefreshView.as_view()),

    path("credit-score/<int:lead_id>/", CreditScoreAPIView.as_view()),
    path("mock-credit-score/", MockCreditScoreAPIView.as_view()),
]
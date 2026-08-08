from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class lead(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15,unique=True)
    dob = models.DateField()
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)
    loan_type = models.CharField(max_length=50)
    employment_type = models.CharField(max_length=50)
    monthly_income = models.IntegerField()
    loan_amount = models.IntegerField()
    property_value = models.IntegerField()
    credit_score = models.IntegerField(null=True,blank=True)
    bre_status = models.CharField(max_length=20, default="Pending")
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lead'

class BRERule(models.Model):
    field_name = models.CharField(max_length=100) #credit_score,monthly_income,loan_amount,employment_type
    operator = models.CharField(max_length=10) #=
    value = models.CharField(max_length=100) #500000,Salaried
    active = models.BooleanField(default=True) # true or false

    class Meta:
        db_table = "BRERule"

 
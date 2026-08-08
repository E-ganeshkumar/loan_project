import requests
from django.conf import settings
from .models import lead


def credit_score(lead_id):

    try:
        # 1. Get lead
        lead_obj = lead.objects.get(id=lead_id)

        # 2. API URL
        api_url = settings.CREDIT_SCORE_API_URL

        # 3. Data to send
        payload = {
            "mobile": lead_obj.mobile,
            "full_name": lead_obj.full_name,
            "dob": str(lead_obj.dob)
        }

        # 4. Call external API
        response = requests.post(
            api_url,
            json=payload,
            timeout=10
        )

        # 5. Check API response
        response.raise_for_status()

        # 6. Convert response to JSON
        data = response.json()

        # 7. Get credit score
        credit_score = data.get("credit_score")

        if not credit_score:
            return {
                "success": False,
                "message": "Credit score not found"
            }

        # 8. Save credit score
        lead_obj.credit_score = credit_score
        lead_obj.save()

        # 9. Return result
        return {
            "success": True,
            "lead_id": lead_obj.id,
            "credit_score": credit_score
        }

    except lead.DoesNotExist:
        return {
            "success": False,
            "message": "Lead not found"
        }

    except requests.RequestException:
        return {
            "success": False,
            "message": "Credit score API failed"
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

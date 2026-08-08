from .models import BRERule

def check_rules(lead):

    rules = BRERule.objects.filter(active=True)

    for rule in rules:

        lead_value = getattr(lead, rule.field_name)

        if rule.operator == ">=":
            if int(lead_value) < int(rule.value):
                return False

        elif rule.operator == "<=":
            if int(lead_value) > int(rule.value):
                return False

        elif rule.operator == "==":
            if str(lead_value) != rule.value:
                return False

    return True
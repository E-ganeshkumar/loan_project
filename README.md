# Loans App (Django + DRF)

A Django REST Framework app for capturing loan leads, running them through a configurable
Business Rules Engine (BRE), and fetching a credit score from an external (or mock) bureau API.

## Features

- **User management** — create users via `UserSerializer` (hashed password via `create_user`).
- **Lead management** — CRUD for loan leads (`lead` model): personal details, loan details,
  employment, income, credit score, BRE status, rejection reason.
- **BRE (Business Rules Engine)** — `BRERule` records define conditions (`field_name`, `operator`,
  `value`) evaluated against a lead in `bre.py`. Supported operators: `>=`, `<=`, `==`.
- **Credit score lookup** — `services.credit_score()` calls an external bureau API
  (`CREDIT_SCORE_API_URL` in settings) and stores the result on the lead.
- **Mock credit score endpoint** — deterministic fake score (300–900) derived from the mobile
  number's SHA-256 hash, useful for local dev/testing without a real bureau integration.
- **JWT auth** — login/refresh via `rest_framework_simplejwt`.

## Project Structure

```
loans/
├── __init__.py
├── admin.py          # Django admin registration for lead & BRERule
├── apps.py            # AppConfig
├── bre.py             # Business rules engine logic (check_rules)
├── models.py           # lead, BRERule models
├── serializers.py       # DRF serializers
├── services.py         # credit_score() external API integration
├── tests.py
├── urls.py             # URL routing
└── views.py             # API views
```

## Models

### `lead`
| Field | Type | Notes |
|---|---|---|
| user | OneToOneField(User) | |
| full_name | CharField(100) | |
| mobile | CharField(15) | unique |
| dob | DateField | |
| city | CharField(100) | |
| pincode | CharField(6) | |
| loan_type | CharField(50) | |
| employment_type | CharField(50) | |
| monthly_income | IntegerField | |
| loan_amount | IntegerField | |
| property_value | IntegerField | |
| credit_score | IntegerField | nullable |
| bre_status | CharField(20) | default `"Pending"` |
| rejection_reason | TextField | nullable |
| created_at | DateTimeField | auto_now_add |

### `BRERule`
| Field | Type | Notes |
|---|---|---|
| field_name | CharField(100) | e.g. `credit_score`, `monthly_income` |
| operator | CharField(10) | `>=`, `<=`, `==` |
| value | CharField(100) | comparison value |
| active | BooleanField | default `True` |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET, POST | `/users/` | List / create users |
| GET, POST | `/leads/` | List / create leads |
| GET, PUT, PATCH, DELETE | `/leads/<id>/` | Retrieve / update / delete a lead |
| GET, POST | `/rules/` | List / create BRE rules |
| GET, PUT, PATCH, DELETE | `/rules/<id>/` | Retrieve / update / delete a BRE rule |
| POST | `/login/` | Obtain JWT token pair |
| POST | `/referesh/` | Refresh JWT token (note: route name has a typo — "referesh") |
| POST | `/credit-score/<lead_id>/` | Fetch & store credit score for a lead |
| POST | `/mock-credit-score/` | Mock bureau API — returns a deterministic score for a mobile number |

## Setup

1. Add `loans` to `INSTALLED_APPS` in your project's `settings.py`.
2. Configure the credit score bureau URL in `settings.py`:
   ```python
   CREDIT_SCORE_API_URL = "http://localhost:8000/api/mock-credit-score/"  # or your real provider
   ```
3. Run migrations:
   ```bash
   python manage.py makemigrations loans
   python manage.py migrate
   ```
4. Create a superuser to manage `BRERule` entries via Django admin:
   ```bash
   python manage.py createsuperuser
   ```
5. Run the dev server:
   ```bash
   python manage.py runserver
   ```

## Business Rules Engine (BRE)

`bre.check_rules(lead)` loops over all **active** `BRERule` rows and evaluates each one against
the corresponding lead field. If **any** active rule fails, the function returns `False`
(lead does not pass BRE); if all rules pass, it returns `True`.

Example rule: reject leads with `credit_score < 650`
```json
{ "field_name": "credit_score", "operator": ">=", "value": "650", "active": true }
```

## Known Issues / Notes

- `check_rules` uses `int(lead_value)` for `>=`/`<=` comparisons — rules on non-numeric fields
  (e.g. `employment_type`) will raise a `ValueError` unless the operator is `==`.
- The `bre_status` and `rejection_reason` fields on `lead` are not currently populated by
  `check_rules` — the function only returns a boolean; wiring it into a view/service to update
  the lead is a good next step.
- `/referesh/` is a typo for `/refresh/` — kept as-is here to match `urls.py`, but worth fixing.
- `MockCreditScoreAPIView` is for local development only; point `CREDIT_SCORE_API_URL` at a real
  bureau integration in production.

## Tech Stack

- Django
- Django REST Framework
- `djangorestframework-simplejwt` (JWT auth)
- `requests` (external API calls)

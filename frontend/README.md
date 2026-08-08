# Ledger — Loan Origination Frontend

Next.js 14 (App Router) frontend for the Django/DRF loan-lead backend
(`loans` app: `lead`, `BRERule`, JWT auth, credit-score lookup).

## Design

A "loan underwriting ledger" look: kraft-paper background, serif ledger
headings (Fraunces), monospace for IDs/amounts (IBM Plex Mono), and a
rotated ink-stamp badge (Pending / Approved / Rejected) as the signature
element for BRE status — used consistently in the leads table and lead file.

## Setup

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

`NEXT_PUBLIC_API_URL` should be the root your `urls.py` is mounted under
(e.g. `http://127.0.0.1:8000/api` if you `include()`d the loans urls at
`/api/`). Adjust to match your project's root `urls.py`.

## Pages

- `/login`, `/signup` — JWT auth via `TokenObtainPairView` (`/login/`) and
  the `UserSerializer` create endpoint (`/users/`).
- `/dashboard/leads` — ledger register of all leads, with BRE stamp.
- `/dashboard/leads/new`, `/dashboard/leads/[id]` — create/view/edit a lead,
  pull credit score, run BRE, delete.
- `/dashboard/rules` — CRUD for `BRERule` objects.

## Backend notes for the author

A few things the frontend had to work around — worth fixing on the backend:

1. **No BRE endpoint.** `bre.py`'s `check_rules()` is never called from any
   view. The "Run BRE check" button on a lead's page re-implements the same
   logic in `lib/bre.js` and evaluates it client-side against `/rules/`, then
   lets the user save `bre_status`/`rejection_reason` back via `PATCH
   /leads/<id>/`. This works, but it means the decision logic lives in two
   places. Recommend adding `POST /leads/<id>/run-bre/` that calls
   `check_rules()` server-side and saves the result — then the frontend
   button can call that directly and this workaround can be deleted.
2. **`lead.user` is a required `OneToOneField`** but isn't set anywhere in
   `views.py`/`serializers.py` on create — DRF will 400 without it. The
   frontend decodes the `user_id` claim out of the JWT access token
   (`getCurrentUserId()` in `lib/api.js`) and sends it as `user` when
   creating a lead. If a user already has a lead, creating a second one will
   fail on the OneToOne constraint — that's backend behavior, not a frontend
   bug.
3. **`referesh/` is spelled that way in `urls.py`** (not `refresh/`) — the
   frontend's silent-refresh call matches the existing route. Rename on
   both sides together if you fix the typo.
4. **No pagination assumed.** `LeadsAPI.list()`/`RulesAPI.list()` handle
   both a bare array and a paginated `{results: [...]}` response, so
   turning on DRF pagination later won't break the list pages.

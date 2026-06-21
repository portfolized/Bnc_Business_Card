# Payments (Khalti)

## What happens right now

Payments use **Khalti ePayment (KPG-2)**. The flow:

1. User fills the order form (landing page or dashboard) and submits.
2. `POST /api/orders/checkout` creates a **DRAFT** order, then calls Khalti `initiate`.
3. The user is redirected to Khalti's `payment_url` to pay.
4. Khalti redirects back to `/dashboard/orders/verify?pidx=...`.
5. `POST /api/orders/verify` looks up the `pidx`. If **Completed**, the order becomes
   **PENDING / PAID** (it's now "placed").

**Current mode: MOCK.** Because `KHALTI_SECRET_KEY` is **not set**, checkout skips the real
Khalti call and routes to a built-in test screen (`/dashboard/orders/mock-pay`) so the whole
flow works locally without charging anything. No real money moves yet.

Relevant files:
- `lib/khalti.ts` — initiate + lookup + sandbox/live host selection
- `app/api/orders/checkout/route.ts` — creates the draft + starts payment
- `app/api/orders/verify/route.ts` — verifies and places the order

## How to enable real Khalti payments

1. **Get a secret key** from the Khalti merchant dashboard (test key for sandbox,
   live key for production).

2. **Add it to `.env`:**

   ```env
   # Required — turning this on switches OFF mock mode.
   KHALTI_SECRET_KEY=your_secret_key_here

   # Optional — host selection (defaults to sandbox = safe):
   #   omit / unset      -> sandbox  (https://dev.khalti.com/api/v2)
   #   KHALTI_ENV=live   -> production (https://khalti.com/api/v2)
   # KHALTI_ENV=live
   ```

   > The key and host must match: a **test** key only works on **sandbox**, a **live** key
   > only on **production**.

3. **Restart the app** so the env var is picked up.

4. **Test on sandbox** before going live:
   - Khalti test IDs `9800000000`–`9800000005`, MPIN `1111`, OTP `987654`.
   - These work **only** on the sandbox host.

5. **Go live:** set the **live** secret key and `KHALTI_ENV=live`, and make sure the app
   is served over HTTPS at a public URL (Khalti uses `return_url` / `website_url` from the
   request origin).

## Notes

- Amounts are sent to Khalti in **paisa** (1 NPR = 100 paisa); minimum charge is **Rs 10**.
- An unpaid order stays a **DRAFT** and can be paid later from the dashboard "Pending payment" list.
- Verification is the source of truth — an order is only placed after Khalti reports `Completed`.

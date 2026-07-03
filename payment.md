# Payments (Manual QR + admin approval)

Payments are handled **manually** — there is no payment gateway. The admin publishes one or
more payment methods (each a QR image + written details); the customer pays out-of-band and
uploads a screenshot, which the admin approves or rejects.

## The flow

1. **Admin sets up payment methods** at `/admin/settings` → *Payment Methods*. Each method has a
   **name**, an uploaded **QR image**, and a **description** (account/wallet details, notes). A
   method can be toggled *active* / *inactive*.
2. **User orders a card** (landing page or dashboard). After filling the card details they click
   **Continue to payment**.
3. The **payment step** shows a dropdown of active method names. Picking one reveals its **QR**
   and **description**. The user pays externally, then **uploads a screenshot** of the payment.
4. Submitting creates the order with `status = PENDING` and `paymentStatus = PENDING`
   (awaiting approval), storing the chosen `paymentMethod` and the `paymentProofUrl`.
5. **Admin reviews** at `/admin/payments`: each pending order shows the method + proof image.
   - **Approve** → `paymentStatus = PAID`.
   - **Reject** → `paymentStatus = REJECTED`; the user sees a "Payment rejected — resubmit"
     entry in their dashboard and can upload a new screenshot for the same order.

## `paymentStatus` values

- `PENDING` — proof submitted, awaiting admin review.
- `PAID` — approved by the admin.
- `REJECTED` — rejected; the user may resubmit a new screenshot.

(The order `status` — DRAFT/PENDING/PROCESSING/SHIPPED/… — tracks fulfilment separately.)

## Relevant files

- `prisma/schema.prisma` — `PaymentMethod` model; `Order.paymentMethod` / `Order.paymentProofUrl`.
- `app/api/admin/payment-methods/*` — admin CRUD for payment methods.
- `app/api/payment-methods/route.ts` — active methods, read by the checkout step.
- `app/api/orders/checkout/route.ts` — creates the order (or resubmits proof) with the chosen
  method + screenshot.
- `app/api/admin/payments/[id]/route.ts` — approve / reject a submitted payment.
- `components/customize/PaymentPanel.tsx` — the user-facing method picker + QR + proof upload.
- `app/(admin)/admin/settings/page.tsx` — admin management of payment methods.
- `app/(admin)/admin/payments/page.tsx` — admin payment history + approve/reject.

## Notes

- Image uploads (QR and payment screenshots) go through `components/ui/ImageUpload.tsx`, which
  uploads to **Cloudinary** (`lib/cloudinary.ts`) and stores the returned hosted URL.
- There is no automated verification — approval is a manual admin decision.

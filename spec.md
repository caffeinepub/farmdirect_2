# FarmDirect

## Current State
Version 8 is live. The app supports farmer product listings, consumer browsing, UPI-based payment flow, 2% platform fee, founder dashboard, live GPS tracking, and Tamil/English language toggle. Farmers can set a UPI ID during onboarding. The payment screen shows the seller's UPI ID. However:
- The Farmer Dashboard listing cards and order cards do NOT show the farmer's payment method (UPI ID / Cash on Delivery).
- There is no "Cash on Delivery" toggle/option on the farmer's profile — only UPI ID.
- The payment page does not offer Cash on Delivery as an alternative to UPI when the seller has enabled it.
- The ProfileEditor does not show UPI ID or Cash on Delivery fields for farmers.

## Requested Changes (Diff)

### Add
- `acceptsCashOnDelivery` boolean field to `UserProfile` in the backend (Motoko) — farmers can opt in to accepting Cash on Delivery.
- Cash on Delivery row in the farmer's profile editor (ProfileEditor.tsx) — a toggle/checkbox for farmers only.
- UPI ID row in the farmer's profile editor (it is currently missing from ProfileEditor).
- Display of UPI ID and Cash on Delivery accepted badge in FarmerDashboard listing cards (so the farmer sees their own payment method).
- Cash on Delivery option on the PaymentPage — if the seller's profile has `acceptsCashOnDelivery: true`, show a "Pay on Delivery (Cash)" button alongside the UPI options. Clicking it confirms the order with a COD reference.

### Modify
- `UserProfile` Motoko type: add `acceptsCashOnDelivery : Bool` optional field.
- `PublicUserProfile` type: expose `acceptsCashOnDelivery` so the payment page can read it.
- OnboardingPage: add Cash on Delivery toggle for farmer role (alongside existing UPI ID field).
- ProfileEditor: add UPI ID input and Cash on Delivery toggle for farmers.
- PaymentPage: if `sellerProfile.acceptsCashOnDelivery` is true, show a "Cash on Delivery" payment button. Clicking it sets upiRef to a COD reference and calls `confirmPayment`.
- FarmerDashboard listing cards: show a small row with "UPI: {upiId}" if set, and "Cash on Delivery ✓" badge if accepted.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `main.mo`: add `acceptsCashOnDelivery : Bool` (default false) to `UserProfile` and `PublicUserProfile`. Update `getUserPublicProfile` to expose it.
2. Regenerate `backend.d.ts` to reflect new field.
3. Update `OnboardingPage.tsx`: add Cash on Delivery checkbox/toggle for farmer role, pass `acceptsCashOnDelivery` to `saveProfile.mutateAsync`.
4. Update `ProfileEditor.tsx`: add UPI ID input and Cash on Delivery toggle for farmers.
5. Update `FarmerDashboard.tsx` `FarmerListingCard`: add a row showing UPI ID (if set) and "Cash on Delivery" badge (if accepted) using farmer's own profile data — fetch caller profile and pass it in.
6. Update `PaymentPage.tsx`: fetch seller public profile (already done), check `acceptsCashOnDelivery`, and render a COD button when true. Handle COD confirm path.

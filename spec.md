# FarmDirect

## Current State
Full-stack farm-to-consumer marketplace with:
- Farmer product listings with image capture, price, pincode/city
- Consumer browsing, ordering, and UPI payment flow (2% platform fee)
- Order status tracking (pending, payment confirmed, in delivery, ready for pickup, completed)
- OrderTrackingPage: text-based status timeline only — no map or GPS
- Founder dashboard with fee collection and withdrawal
- Tamil/English language toggle
- PWA support

## Requested Changes (Diff)

### Add
- **Location sharing on orders**: When an order is active (payment_confirmed, in_delivery, ready_for_pickup), both buyer and seller can share their live GPS coordinates to the backend
- **Backend: `updateOrderLocation` function**: Stores lat/lng for a given order and role (seller/buyer). Anyone involved in the order (buyer or seller) can update their own location. Stores `sellerLat`, `sellerLng`, `buyerLat`, `buyerLng`, `sellerLocationUpdatedAt`, `buyerLocationUpdatedAt` on the order
- **Backend: `getOrderLocations` function**: Returns the latest locations for both parties in an order (only accessible by buyer or seller of that order)
- **Live tracking map on OrderTrackingPage**: Interactive map using Leaflet.js (open-source, no API key needed) showing:
  - Seller pin (farm icon) with seller's live location
  - Buyer pin with consumer's live location
  - Distance between them
  - "Share My Location" button that sends the user's current GPS to the backend every 10 seconds while on screen
  - For delivery mode: consumer sees farmer moving toward them; for pickup: farmer sees consumer approaching
- **Map shown for active orders only**: payment_confirmed, in_delivery, ready_for_pickup statuses

### Modify
- **Order type in backend**: Add optional location fields: `sellerLat`, `sellerLng`, `buyerLat`, `buyerLng`, `sellerLocationUpdatedAt`, `buyerLocationUpdatedAt`
- **OrderTrackingPage**: Add live map below existing status timeline
- **App.tsx and AppView**: No changes needed; OrderTrackingPage already exists

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo` to add location fields to Order type and add `updateOrderLocation` / `getOrderLocations` functions
2. Update `backend.d.ts` to reflect new types and functions
3. Install `leaflet` and `@types/leaflet` in frontend
4. Create `LiveTrackingMap.tsx` component using Leaflet with seller/buyer pins, distance display, share-my-location button with 10-second polling
5. Update `OrderTrackingPage.tsx` to import and render `LiveTrackingMap` for active orders

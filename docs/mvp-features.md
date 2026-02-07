# MVP Feature Design

Core features must address the primary workflows for screen owners and advertisers, while keeping the product lean.

## 1. User Accounts & Roles
- **Secure registration and login.**
- **Role-based access control** (owner vs. advertiser).
- **Profile pages** for contact details and payment methods.

## 2. Screen Management (for Owners)
- **Register each digital display (“screen”) with attributes:**
  - Name, location, type (e.g. outdoor LED billboard, cinema foyer screen, mall display).
  - Dimensions/resolution.
  - Supported formats (image/video/text).
  - Availability schedule.
- **Pricing:** Owners set base pricing or select pricing models (e.g. per slot, hourly rate).
- **Availability:** Edit availability (blocked dates, max bookings).
- **Dashboard:** Shows upcoming bookings and income reports.

## 3. Inventory Marketplace (for Advertisers)
- **Centralized catalog** where advertisers can browse available screens.
- **Filters:** Location (e.g. area of Bengaluru), screen type, audience (footfall estimate), price range, and format.
- **View:** Map view or list view of available inventory.

## 4. Campaign Booking (for Advertisers)
- **Create ad campaigns** by selecting screen(s) and scheduling slots.
- **Booking flow:** Choose a time window (date/time range), ad duration (e.g. 10s, 30s), and number of repeats.
- **Availability check:** System prevents double-booking.
- **Content:** Upload creative content (video/image/text) and preview how it looks on the chosen screen format.

## 5. Scheduling & Delivery
- **Scheduling engine:** Sends approved ads to screens at the booked times.
- **Smart screens:** Lightweight client app polls the platform or receives push notifications.
- **Basic hardware:** Owners manually update media players via USB/network (platform provides files/schedules).
- **Logging:** All playback is logged (proof-of-play).

## 6. Payments & Billing
- **Integration:** Payment gateway (e.g. Stripe, PayPal).
- **Flow:** Advertisers pay online (credit card, net banking). Funds held in escrow.
- **Payout:** Released to owner (minus commission) after delivery or on terms.
- **Features:** Automated invoicing, taxation rules, partial refunds.

## 7. Dashboard & Analytics
- **Owners:** Revenue earned, upcoming bookings, screen utilization rates.
- **Advertisers:** Booking status, history of ads run, basic metrics (plays/impressions).
- **Admin:** Key platform metrics (DAU, booking conversion).

## 8. Admin Panel
- **User management.**
- **Screen verification.**
- **Dispute resolution.**
- **Content moderation.**
- **Platform-wide settings** (commission rates).

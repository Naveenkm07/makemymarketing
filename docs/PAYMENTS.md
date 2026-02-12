# Payment System Documentation

## Overview

The payment system tracks financial transactions for ad bookings in the MakeMyMarketing platform. Each booking can have associated payment records that track the payment lifecycle from creation to completion.

## Database Schema

### Payments Table

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Payment Status Enum

- **pending**: Payment has been created but not yet processed
- **processing**: Payment is currently being processed by payment gateway
- **completed**: Payment has been successfully completed
- **failed**: Payment attempt failed
- **refunded**: Payment has been refunded to the customer

## Payment Workflow

### 1. Create Booking
Advertiser creates a booking for a screen slot.

### 2. Create Payment
When booking is confirmed, a payment record is created:

```typescript
POST /api/payments
{
  "booking_id": "uuid",
  "amount": 1500.00,
  "payment_method": "stripe"
}
```

### 3. Process Payment
Integration with payment gateway (e.g., Stripe):
- Update status to `processing`
- Send payment to gateway
- Receive transaction_id

### 4. Complete Payment
On successful payment:

```typescript
PATCH /api/payments
{
  "payment_id": "uuid",
  "status": "completed",
  "transaction_id": "stripe_txn_123"
}
```

This automatically sets `paid_at` timestamp.

## API Endpoints

### GET /api/payments

Fetch payments for the authenticated user's bookings.

**Query Parameters:**
- `booking_id` (optional): Filter by specific booking

**Response:**
```json
{
  "ok": true,
  "payments": [
    {
      "id": "uuid",
      "booking_id": "uuid",
      "amount": 1500.00,
      "status": "completed",
      "payment_method": "stripe",
      "transaction_id": "stripe_txn_123",
      "paid_at": "2026-02-12T10:00:00Z",
      "created_at": "2026-02-12T09:00:00Z",
      "bookings": {
        "id": "uuid",
        "campaign_id": "uuid",
        "screen_id": "uuid",
        "start_time": "2026-02-15T00:00:00Z",
        "end_time": "2026-02-22T00:00:00Z",
        "total_price": 1500.00,
        "status": "booked"
      }
    }
  ]
}
```

### POST /api/payments

Create a new payment record.

**Request Body:**
```json
{
  "booking_id": "uuid",
  "amount": 1500.00,
  "payment_method": "stripe",
  "transaction_id": "stripe_txn_123" // optional
}
```

**Authorization:**
- User must own the campaign associated with the booking

**Response:**
```json
{
  "ok": true,
  "payment": { /* payment object */ },
  "message": "Payment created successfully"
}
```

### PATCH /api/payments

Update payment status.

**Request Body:**
```json
{
  "payment_id": "uuid",
  "status": "completed",
  "transaction_id": "stripe_txn_123" // optional
}
```

**Response:**
```json
{
  "ok": true,
  "payment": { /* updated payment object */ },
  "message": "Payment updated successfully"
}
```

## Row Level Security (RLS)

### View Payments
Users can view payments for:
- Bookings from their own campaigns (advertisers)
- Bookings for their own screens (owners)

### Create Payments
Only advertisers can create payments for their own campaign bookings.

## Integration with Payment Gateways

### Stripe Integration (Example)

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function processPayment(paymentId: string, amount: number) {
  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    metadata: { payment_id: paymentId }
  });
  
  // Update payment status
  await fetch('/api/payments', {
    method: 'PATCH',
    body: JSON.stringify({
      payment_id: paymentId,
      status: 'processing',
      transaction_id: paymentIntent.id
    })
  });
  
  return paymentIntent.client_secret;
}
```

## Best Practices

1. **Always validate booking ownership** before creating payments
2. **Use transactions** when updating booking and payment status together
3. **Store transaction IDs** from payment gateways for reconciliation
4. **Set paid_at timestamp** only when status is 'completed'
5. **Handle refunds** by creating new payment records with negative amounts or updating status to 'refunded'
6. **Log all payment events** for audit trail

## Future Enhancements

- [ ] Add support for partial payments
- [ ] Implement automatic refund workflow
- [ ] Add payment webhooks for gateway callbacks
- [ ] Create payment analytics dashboard
- [ ] Support multiple currencies
- [ ] Add payment installment plans

import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/app/paypalClient';

export async function POST(req: NextRequest) {
  const { email, amount, note, milestoneId } = await req.json();

  const accessToken = await getAccessToken(); // helper defined below
  const endpoint =
    process.env.PAYPAL_ENV === 'live'
      ? 'https://api-m.paypal.com/v1/payments/payouts'
      : 'https://api-m.sandbox.paypal.com/v1/payments/payouts';

  const batchId = `batch-${milestoneId}-${Date.now()}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: batchId,
        email_subject: 'You have a payment from TaskNet',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount,
            currency: "USD",
          },
          note,
          receiver: email,
          sender_item_id: `ms-${milestoneId}`,
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('PayPal payout error', data);
    return NextResponse.json({ error: data }, { status: 500 });
  }

  // ✅ Store payout_batch_id, item_id, milestoneId in your DB here

  return NextResponse.json({ success: true, batch: data });
}

import { NextRequest, NextResponse } from 'next/server';
import { paypalClient } from '@/app/paypalClient';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export async function POST(req: NextRequest) {
  const { amount, milestoneId } = await req.json();
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: { currency_code: "USD", value: amount },
      custom_id: milestoneId,
    }],
  });

  const order = await paypalClient().execute(request);
  return NextResponse.json({ orderID: order.result.id });
}

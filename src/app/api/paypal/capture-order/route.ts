import { NextRequest, NextResponse } from 'next/server';
import { paypalClient } from '@/app/paypalClient';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export async function POST(req: NextRequest) {
  const { orderID } = await req.json();
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
  request.prefer('return=representation');
  // Cast through any to skip the TypeScript body requirement:
  // @ts-expect-error request body should be allowed to be empty
  request.requestBody({});
  const capture = await paypalClient().execute(request);
  return NextResponse.json({ capture: capture.result });
}

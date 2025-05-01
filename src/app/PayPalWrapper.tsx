// components/PayPalWrapper.tsx
'use client';   // ← this makes the whole file a Client Component

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import PayPalCheckout from './components/PayPalCheckout/PayPalCheckout';

interface PayPalWrapperProps {
  amount: string;
  milestoneId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (details: any) => void;
}

export default function PayPalWrapper({
  amount,
  milestoneId,
  onSuccess,
}: PayPalWrapperProps) {
  return (
    <PayPalScriptProvider
      options={{
        'clientId': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: "USD",
      }}
    >
      <PayPalCheckout
        amount={amount}
        milestoneId={milestoneId}
        onSuccess={onSuccess}
      />
    </PayPalScriptProvider>
  );
}

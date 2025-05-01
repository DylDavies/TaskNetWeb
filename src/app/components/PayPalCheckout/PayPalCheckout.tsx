import React, { useState } from 'react';
import {
  PayPalButtons,
  PayPalButtonsComponentProps,
  usePayPalScriptReducer
} from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';

type Props = {
  amount: string;        // e.g. "250.00"
  milestoneId: string;
  onSuccess: (details: any) => void;
};

export default function PayPalCheckout({
  amount, milestoneId, onSuccess
}: Props) {
  const [{ isPending }] = usePayPalScriptReducer();

  const buttonProps: PayPalButtonsComponentProps = {
    style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
    createOrder: async (_data, actions) => {
      // 1) call our API to create PayPal order
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, milestoneId }),
      });

      if (!res.ok) {
        const text = await res.text();  // will be HTML if mis-routed
        console.error('create-order failed, got:', text);
        toast("Creat order failed");
        throw new Error(`create-order HTTP ${res.status}`);
      }

      const { orderID } = await res.json();

      return orderID;
    },
    onApprove: async (_data, actions) => {
      // 2) capture the order
      const details = await actions.order!.capture();
      // 3) notify our server to reconcile (optional if you trust front-end)
      await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: details.id }),
      });

      toast("Captured order");

      // 4) let the parent know
      onSuccess(details);
    },
    onError: (err) => {
      console.error('PayPal Checkout onError', err);
      toast("Checkout failed");
    }
  };

  if (isPending) return <div>Loading PayPal…</div>;
  return <PayPalButtons {...buttonProps} />;
}

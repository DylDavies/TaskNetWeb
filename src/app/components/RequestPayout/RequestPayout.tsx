'use client';

import { useState } from 'react';
import InputBar from '../inputbar/InputBar';
import Button from '../button/Button';
import { updateMilestonePaymentStatus } from '@/app/server/services/MilestoneService';
import PaymentStatus from '@/app/enums/PaymentStatus.enum';
import toast from 'react-hot-toast';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

interface Props {
  amount: string;
  note: string;
  milestoneId: string;
  jobId: string;
  onSuccess: () => void
}

export default function RequestPayout({ milestoneId, note, amount, jobId, onSuccess }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [email, setEmail] = useState<string>("");
  const [modalOpen, setModalOpen ] = useState(false);

  async function onApprove() {
    const res = await fetch('/api/paypal/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId, email, amount, note }),
    });

    setModalOpen(false);
    
    if (res.ok) {
      await updateMilestonePaymentStatus(jobId, milestoneId, PaymentStatus.Paid);
      setStatus('success');
      toast("Payout paid!");
      onSuccess();
    } else {
      console.error(await res.text());
      setStatus('error');
    }
  }

  function onClose() {
    setStatus("idle");
    setModalOpen(false);
  }

  const handleClick = async () => {
    if (email == "") {
      toast("Please enter an email");
      return;
    }
    setStatus('loading');
    setModalOpen(true);

  };

  function getCaption(status: 'idle' | 'loading' | 'success' | 'error') {
    switch (status) {
      case "idle": return "Withdraw Funds";
      case "loading": return "Processing...";
      case "success": return "✅ Paid";
      case "error": return "❌ Failed";
    }
  }

  return (
    <>
    {modalOpen &&
    <ConfirmationModal onClose={onClose} onDeny={onClose} onConfirm={onApprove} message={`Are you sure you'd like to receive your payout to ${email}?`} modalIsOpen={modalOpen}></ConfirmationModal>
    }
    <InputBar
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Payout Email"
      type="text"
      className="!w-full">
    </InputBar>
    <Button
    onClick={handleClick}
    disabled={status === 'loading'}
    caption={getCaption(status)}>
    </Button>
    </>
  );
}

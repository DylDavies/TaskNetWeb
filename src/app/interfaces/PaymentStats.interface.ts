interface PaymentStats {
  tabelInfo: string[][]; // [jobId, title, client, freelancer, clientUid, total, paid, unpaid, escrow]
  totalPayed: number;
  totalESCROW: number;
  totalUnpaid: number;
}

export default PaymentStats;
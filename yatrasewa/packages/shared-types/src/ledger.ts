import { z } from "zod";

export const LedgerAccountTypeEnum = z.enum([
  "Platform_Gateway_Escrow",
  "Bookie_Prepaid_Float_Wallet",
  "Operator_Payable_Account",
  "Platform_Commission_Rev",
  "Tax_TDS_Payable",
  "Passenger_Receivable",
  "Conductor_Cash_Undeposited",
  "Customer_Wallet",
]);
export type LedgerAccountType = z.infer<typeof LedgerAccountTypeEnum>;

export const JournalEntryTypeEnum = z.enum([
  "booking_payment",
  "cancellation_refund",
  "settlement_payout",
  "bookie_float_topup",
  "conductor_remittance",
  "tds_remittance",
  "commission_recognition",
]);
export type JournalEntryType = z.infer<typeof JournalEntryTypeEnum>;

export const LedgerAccountSchema = z.object({
  id: z.string().uuid(),
  accountType: LedgerAccountTypeEnum,
  accountOwnerType: z.enum(["platform", "operator", "bookie", "customer", "conductor"]),
  accountOwnerId: z.string().nullable(),
  currentBalance: z.number(),
  currency: z.literal("NPR").default("NPR"),
});
export type LedgerAccount = z.infer<typeof LedgerAccountSchema>;

export const LedgerPostingSchema = z.object({
  id: z.string().uuid(),
  journalEntryId: z.string().uuid(),
  accountId: z.string().uuid(),
  debitAmount: z.number().nonnegative().default(0),
  creditAmount: z.number().nonnegative().default(0),
  createdAt: z.coerce.date(),
});
export type LedgerPosting = z.infer<typeof LedgerPostingSchema>;

export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  entryType: JournalEntryTypeEnum,
  referenceType: z.string(),
  referenceId: z.string(),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
  postings: z.array(LedgerPostingSchema),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const SettlementStatusEnum = z.enum(["pending", "approved", "processing", "paid", "failed"]);
export type SettlementStatus = z.infer<typeof SettlementStatusEnum>;

export const SettlementPayoutSchema = z.object({
  id: z.string().uuid(),
  operatorId: z.string(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  grossCollected: z.number(),
  commissionDeducted: z.number(),
  tdsDeducted: z.number(),
  netPayable: z.number(),
  status: SettlementStatusEnum,
  nchlBatchId: z.string().nullable(),
  paidAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});
export type SettlementPayout = z.infer<typeof SettlementPayoutSchema>;

/** Nepal TDS on service commissions = 1.5% (per Income Tax Act) */
export const TDS_RATE = 0.015;

/**
 * Compute ledger postings for a confirmed booking payment.
 * Σ debits MUST equal Σ credits; this is enforced by a PG trigger.
 */
export function buildBookingPaymentPostings(input: {
  grossFare: number;
  commissionRate: number; // platform commission % (e.g., 0.10 = 10%)
  passengerAccountId: string;
  escrowAccountId: string;
  operatorPayableId: string;
  commissionRevId: string;
  tdsPayableId: string;
}): Array<{ accountId: string; debit: number; credit: number }> {
  const { grossFare, commissionRate, passengerAccountId, escrowAccountId, operatorPayableId, commissionRevId, tdsPayableId } = input;
  const commission = +(grossFare * commissionRate).toFixed(2);
  const tds = +(commission * TDS_RATE).toFixed(2);
  const netToOperator = +(grossFare - commission).toFixed(2);
  const netAfterTds = +(netToOperator - tds).toFixed(2);
  return [
    { accountId: passengerAccountId, debit: grossFare, credit: 0 },
    { accountId: escrowAccountId, debit: 0, credit: grossFare },
    // Recognize commission & TDS liability
    { accountId: escrowAccountId, debit: commission, credit: 0 },
    { accountId: commissionRevId, debit: 0, credit: +(commission - tds).toFixed(2) },
    { accountId: tdsPayableId, debit: 0, credit: tds },
    // Operator payable
    { accountId: escrowAccountId, debit: netAfterTds, credit: 0 },
    { accountId: operatorPayableId, debit: 0, credit: netAfterTds },
  ];
}

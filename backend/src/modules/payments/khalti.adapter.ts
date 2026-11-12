/**
 * Khalti KPG-2 adapter — paisa conversion, pidx initiation, server lookup.
 */
import axios from "axios";
import { randomUUID } from "crypto";
const uuid = randomUUID;
import { env } from "../../config/env.js";
import { httpError } from "../../middlewares/error-handler.js";

export interface KhaltiInitResult {
  pidx: string;
  paymentUrl: string;
  purchaseOrderId: string;
}

export async function initiateKhalti(params: {
  bookingId: string;
  amount: number;
  customerName?: string;
  customerPhone?: string;
}): Promise<KhaltiInitResult> {
  // Khalti uses PAISA, multiply NPR by 100
  const amountPaisa = Math.round(params.amount * 100);
  const purchaseOrderId = `YS-${uuid().slice(0, 8)}`;

  try {
    const res = await axios.post(
      `${env.khalti.baseUrl}/epayment/initiate/`,
      {
        return_url: env.khalti.returnUrl,
        website_url: env.khalti.websiteUrl,
        amount: amountPaisa,
        purchase_order_id: purchaseOrderId,
        purchase_order_name: `Bus Ticket ${purchaseOrderId}`,
        customer_info: { name: params.customerName, phone: params.customerPhone },
      },
      { headers: { Authorization: `Key ${env.khalti.secretKey}`, "Content-Type": "application/json" } },
    );
    return { pidx: res.data.pidx, paymentUrl: res.data.payment_url, purchaseOrderId };
  } catch {
    throw httpError(502, "Khalti initiation failed");
  }
}

export async function verifyKhalti(pidx: string): Promise<{ status: string; transactionId?: string; totalAmount: number }> {
  try {
    const res = await axios.post(`${env.khalti.baseUrl}/epayment/lookup/`, { pidx }, {
      headers: { Authorization: `Key ${env.khalti.secretKey}`, "Content-Type": "application/json" },
    });
    if (res.data.status !== "Completed") throw httpError(402, `Khalti payment ${res.data.status}`);
    return { status: res.data.status, transactionId: res.data.transaction_id, totalAmount: res.data.total_amount / 100 };
  } catch (e: any) {
    if (e.status === 402) throw e;
    throw httpError(502, "Khalti verification failed");
  }
}

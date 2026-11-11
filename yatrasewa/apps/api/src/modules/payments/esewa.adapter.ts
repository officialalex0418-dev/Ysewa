/**
 * eSewa ePay v2 adapter — HMAC-SHA256 signature generation and server-side status lookup.
 * Reference: https://developer.esewa.com.np/
 */
import crypto from "crypto";
import axios from "axios";
import { env } from "../../config/env.js";
import { httpError } from "../../middlewares/error-handler.js";

export interface EsewaInitResult {
  formUrl: string;
  fields: Record<string, string>;
  transactionUuid: string;
}

export async function initiateEsewa(params: {
  bookingId: string;
  amount: number;
  productCode?: string;
}): Promise<EsewaInitResult> {
  const totalAmount = params.amount.toFixed(2);
  const transactionUuid = `YS-${Date.now()}-${params.bookingId.slice(0, 8)}`;
  const productCode = params.productCode ?? env.esewa.productCode;

  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature = crypto.createHmac("sha256", env.esewa.secretKey).update(message).digest("base64");

  return {
    formUrl: `${env.esewa.baseUrl}/api/epay/main/v2/form`,
    transactionUuid,
    fields: {
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: env.esewa.successUrl,
      failure_url: env.esewa.failureUrl,
      signed_field_names: signedFieldNames,
      signature,
    },
  };
}

export async function verifyEsewa(params: {
  transactionUuid: string;
  totalAmount: string;
  productCode?: string;
}): Promise<{ status: string; transactionCode?: string }> {
  const productCode = params.productCode ?? env.esewa.productCode;
  const url = `${env.esewa.statusUrl}?product_code=${productCode}&total_amount=${params.totalAmount}&transaction_uuid=${params.transactionUuid}`;
  try {
    const res = await axios.get(url);
    const data = res.data;
    if (data.status !== "COMPLETE") throw httpError(402, `eSewa payment not completed: ${data.status}`);
    return { status: data.status, transactionCode: data.transaction_code };
  } catch (e: any) {
    if (e.status === 402) throw e;
    throw httpError(502, "eSewa verification failed");
  }
}

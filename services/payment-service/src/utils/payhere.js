import crypto from "crypto";

export function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

export function generateOrderId(appointmentId) {
  return `APT-${appointmentId}-${Date.now()}`;
}

export function generatePayHereHash({
  merchantId,
  orderId,
  amount,
  currency,
  merchantSecret
}) {
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  return crypto
    .createHash("md5")
    .update(`${merchantId}${orderId}${formatAmount(amount)}${currency}${hashedSecret}`)
    .digest("hex")
    .toUpperCase();
}

export function verifyPayHereNotification({
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  md5sig,
  merchantSecret
}) {
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  const localSig = crypto
    .createHash("md5")
    .update(`${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedSecret}`)
    .digest("hex")
    .toUpperCase();

  return localSig === String(md5sig).toUpperCase();
}
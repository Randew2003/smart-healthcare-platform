import crypto from "crypto";

export function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

function normalizeMerchantId(merchantId) {
  return String(merchantId ?? "").trim();
}

function normalizeMerchantSecret(merchantSecret) {
  const raw = String(merchantSecret ?? "").trim();
  if (!raw) return raw;

  // Control how we interpret the merchant secret.
  // - raw: use as-is
  // - base64: base64-decode
  // - auto (default): decode only when it clearly looks base64-encoded
  const mode = String(process.env.PAYHERE_MERCHANT_SECRET_ENCODING || "auto")
    .trim()
    .toLowerCase();

  if (mode === "raw") return raw;

  const looksBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(raw) && raw.length % 4 === 0;

  if (mode === "base64" || (mode === "auto" && looksBase64)) {
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf8").trim();
      // Only accept decoded values that look like plain numeric/alphanumeric secrets.
      if (decoded && /^[0-9A-Za-z]+$/.test(decoded) && decoded.length >= 16) {
        return decoded;
      }
    } catch {
      // ignore
    }
  }

  return raw;
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
  const mid = normalizeMerchantId(merchantId);
  const oid = String(orderId ?? "").trim();
  const cur = String(currency ?? "").trim();
  const secret = normalizeMerchantSecret(merchantSecret);

  const hashedSecret = crypto
    .createHash("md5")
    .update(secret)
    .digest("hex")
    .toUpperCase();

  return crypto
    .createHash("md5")
    .update(`${mid}${oid}${formatAmount(amount)}${cur}${hashedSecret}`)
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
    .update(normalizeMerchantSecret(merchantSecret))
    .digest("hex")
    .toUpperCase();

  const localSig = crypto
    .createHash("md5")
    .update(
      `${normalizeMerchantId(merchantId)}${String(orderId ?? "").trim()}${String(payhereAmount ?? "").trim()}${String(payhereCurrency ?? "").trim()}${String(statusCode ?? "").trim()}${hashedSecret}`
    )
    .digest("hex")
    .toUpperCase();

  return localSig === String(md5sig).toUpperCase();
}
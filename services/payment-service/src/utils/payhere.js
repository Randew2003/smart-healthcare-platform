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
  // - raw: use the secret as-is
  // - base64: base64-decode before hashing
  // - auto: decode only when explicitly prefixed as base64:...
  const mode = String(process.env.PAYHERE_MERCHANT_SECRET_ENCODING || "raw")
    .trim()
    .toLowerCase();

  if (mode === "raw") return raw;

  const decodeBase64 = (value) => {
    try {
      return Buffer.from(value, "base64").toString("utf8").trim();
    } catch {
      return "";
    }
  };

  if (mode === "base64") {
    const decoded = decodeBase64(raw);
    return decoded || raw;
  }

  if (mode === "auto") {
    if (raw.toLowerCase().startsWith("base64:")) {
      const decoded = decodeBase64(raw.slice("base64:".length));
      return decoded || raw;
    }
    return raw;
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

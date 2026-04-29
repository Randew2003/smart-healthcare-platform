import Payment from "../models/Payment.js";
import {
  generateOrderId,
  generatePayHereHash,
  verifyPayHereNotification,
  formatAmount
} from "../utils/payhere.js";

export async function createPayment(req, res) {
  try {
    const userId = req.user.id;

    const appointmentId = String(req.body?.appointmentId || "").trim();
    const amountNumber = Number(req.body?.amount);
    const currency = String(req.body?.currency || "LKR").trim() || "LKR";

    const fullName = String(req.body?.fullName || req.user?.fullName || "").trim();
    const email = String(req.body?.email || req.user?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || req.user?.phone || "").trim();

    if (!appointmentId || !fullName || !email || !Number.isFinite(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({
        message: "appointmentId, fullName, email, and a valid amount are required."
      });
    }

    const orderId = generateOrderId(appointmentId);

    const merchantId = String(process.env.PAYHERE_MERCHANT_ID || "").trim();
    const merchantSecret = String(process.env.PAYHERE_MERCHANT_SECRET || "").trim();

    const sandboxFlag = String(process.env.PAYHERE_SANDBOX || "true").trim().toLowerCase();
    const defaultCheckoutUrl = sandboxFlag === "false"
      ? "https://www.payhere.lk/pay/checkout"
      : "https://sandbox.payhere.lk/pay/checkout";

    const checkoutUrl = String(process.env.PAYHERE_CHECKOUT_URL || defaultCheckoutUrl).trim();

    const forwardedProto = String(req.get("x-forwarded-proto") || "").split(",")[0].trim();
    const forwardedHost = String(req.get("x-forwarded-host") || "").split(",")[0].trim();
    const host = forwardedHost || String(req.get("host") || "").split(",")[0].trim();
    const proto = forwardedProto || req.protocol;
    const origin = host ? `${proto}://${host}` : "";

    const returnUrl = String(process.env.PAYMENT_RETURN_URL || (origin ? `${origin}/payment-success` : "")).trim();
    const returnUrlWithAppointment = appointmentId ? `${returnUrl}?appointmentId=${encodeURIComponent(appointmentId)}` : returnUrl;
    const cancelUrl = String(process.env.PAYMENT_CANCEL_URL || (origin ? `${origin}/payment-cancel` : "")).trim();

    // Prefer building notify_url from the return_url origin so localhost keeps its port (e.g., http://localhost:3000).
    const originFromReturnUrl = (() => {
      try {
        return new URL(returnUrl).origin;
      } catch {
        return "";
      }
    })();

    let notifyUrl = String(
      process.env.PAYMENT_NOTIFY_URL ||
        (originFromReturnUrl ? `${originFromReturnUrl}/api/payments/notify` : origin ? `${origin}/api/payments/notify` : "")
    ).trim();

    // Replace the template placeholder with a usable origin.
    if (notifyUrl.includes("YOUR_PUBLIC_URL")) {
      const replacementOrigin = originFromReturnUrl || origin;
      if (replacementOrigin) notifyUrl = `${replacementOrigin}/api/payments/notify`;
    }

    if (!merchantId || !merchantSecret || !checkoutUrl || !returnUrl || !cancelUrl || !notifyUrl) {
      return res.status(500).json({ message: "Missing PayHere configuration." });
    }

    const payment = await Payment.create({
      userId,
      appointmentId,
      orderId,
      fullName,
      email,
      phone,
      amount: amountNumber,
      currency,
      status: "PENDING",
      paymentMethod: "PayHere"
    });

    const hash = generatePayHereHash({
      merchantId,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      merchantSecret
    });

    return res.status(201).json({
      message: "Payment created successfully.",
      payment,
      payhere: {
        checkoutUrl,
        merchant_id: merchantId,
        return_url: returnUrlWithAppointment,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        order_id: payment.orderId,
        items: `Doctor Appointment Payment - ${appointmentId}`,
        currency: payment.currency,
        amount: formatAmount(payment.amount),
        first_name: fullName,
        last_name: "",
        email,
        phone,
        address: "N/A",
        city: "Colombo",
        country: "Sri Lanka",
        hash
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getMyPayments(req, res) {
  try {
    const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(payments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getPaymentByOrderId(req, res) {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    if (payment.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden." });
    }

    return res.json(payment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function markCancelled(req, res) {
  try {
    const payment = await Payment.findOne({
      orderId: req.params.orderId,
      userId: req.user.id
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    payment.status = "CANCELLED";
    await payment.save();

    return res.json({
      message: "Payment cancelled successfully.",
      payment
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function payhereNotify(req, res) {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      method,
      card_holder_name,
      card_no,
      captured_amount
    } = req.body;

    const merchantSecret = String(process.env.PAYHERE_MERCHANT_SECRET || "").trim();

    if (!merchantSecret) {
      return res.status(500).send("Missing PayHere merchant secret");
    }

    const merchantId = String(merchant_id || "").trim();
    const orderId = String(order_id || "").trim();
    const payhereAmount = String(payhere_amount || "").trim();
    const payhereCurrency = String(payhere_currency || "").trim();
    const statusCode = String(status_code || "").trim();
    const sig = String(md5sig || "").trim();

    if (!merchantId || !orderId || !payhereAmount || !payhereCurrency || !statusCode || !sig) {
      return res.status(400).send("Invalid notification payload");
    }

    const isValid = verifyPayHereNotification({
      merchantId,
      orderId,
      payhereAmount,
      payhereCurrency,
      statusCode,
      md5sig: sig,
      merchantSecret
    });

    if (!isValid) {
      console.error("Invalid PayHere md5 signature");
      return res.status(400).send("Invalid signature");
    }

    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    payment.payhere.paymentId = String(payment_id || "");
    payment.payhere.statusCode = statusCode;
    payment.payhere.md5sig = sig;
    payment.payhere.method = String(method || "");
    payment.payhere.cardHolderName = String(card_holder_name || "");
    payment.payhere.cardNo = String(card_no || "");
    payment.payhere.capturedAmount = String(captured_amount || "");
    payment.payhere.currency = payhereCurrency;

    if (statusCode === "2") {
      payment.status = "SUCCESS";
    } else if (statusCode === "-1") {
      payment.status = "FAILED";
    } else if (statusCode === "0") {
      payment.status = "PENDING";
    }

    await payment.save();

    return res.status(200).send("OK");
  } catch (error) {
    console.error("PayHere notify error:", error.message);
    return res.status(500).send("Server error");
  }
}
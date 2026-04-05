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
    const {
      appointmentId,
      fullName,
      email,
      phone,
      amount,
      currency = "LKR"
    } = req.body;

    if (!appointmentId || !fullName || !email || !amount) {
      return res.status(400).json({
        message: "appointmentId, fullName, email, and amount are required."
      });
    }

    const orderId = generateOrderId(appointmentId);

    const payment = await Payment.create({
      userId,
      appointmentId,
      orderId,
      fullName,
      email,
      phone: phone || "",
      amount,
      currency,
      status: "PENDING",
      paymentMethod: "PayHere"
    });

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

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
        checkoutUrl: process.env.PAYHERE_CHECKOUT_URL,
        merchant_id: merchantId,
        return_url: process.env.PAYMENT_RETURN_URL,
        cancel_url: process.env.PAYMENT_CANCEL_URL,
        notify_url: process.env.PAYMENT_NOTIFY_URL,
        order_id: payment.orderId,
        items: `Doctor Appointment Payment - ${appointmentId}`,
        currency: payment.currency,
        amount: formatAmount(payment.amount),
        first_name: fullName,
        last_name: "",
        email,
        phone: phone || "",
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
    console.log("PAYHERE CALLBACK:", req.body);

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

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    const isValid = verifyPayHereNotification({
      merchantId: merchant_id,
      orderId: order_id,
      payhereAmount: payhere_amount,
      payhereCurrency: payhere_currency,
      statusCode: status_code,
      md5sig,
      merchantSecret
    });

    if (!isValid) {
      console.error("Invalid PayHere md5 signature");
      return res.status(400).send("Invalid signature");
    }

    const payment = await Payment.findOne({ orderId: order_id });

    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    payment.payhere.paymentId = payment_id || "";
    payment.payhere.statusCode = status_code || "";
    payment.payhere.md5sig = md5sig || "";
    payment.payhere.method = method || "";
    payment.payhere.cardHolderName = card_holder_name || "";
    payment.payhere.cardNo = card_no || "";
    payment.payhere.capturedAmount = captured_amount || "";
    payment.payhere.currency = payhere_currency || "";

    if (status_code === "2") {
      payment.status = "SUCCESS";
    } else if (status_code === "-1") {
      payment.status = "FAILED";
    } else if (status_code === "0") {
      payment.status = "PENDING";
    }

    await payment.save();

    return res.status(200).send("OK");
  } catch (error) {
    console.error("PayHere notify error:", error.message);
    return res.status(500).send("Server error");
  }
}
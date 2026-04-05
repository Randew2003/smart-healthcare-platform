import { Router } from "express";
import {
  createPayment,
  getMyPayments,
  getPaymentByOrderId,
  markCancelled,
  payhereNotify
} from "../controllers/paymentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/notify", payhereNotify);

router.post("/", protect, authorize("patient"), createPayment);
router.get("/my", protect, authorize("patient"), getMyPayments);
router.get("/:orderId", protect, getPaymentByOrderId);
router.patch("/:orderId/cancel", protect, authorize("patient"), markCancelled);

export default router;
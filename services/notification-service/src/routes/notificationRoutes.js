import express from "express";
import { handleNotificationEvent } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/event", handleNotificationEvent);

export default router;
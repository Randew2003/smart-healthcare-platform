const express = require("express");
const {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
  startSession,
  completeSession,
  cancelSession
} = require("../controllers/sessionController");

const router = express.Router();

// Define routes for telemedicine sessions
router.post("/", createSession);// Route to create a new telemedicine session(POST /api/sessions)
router.get("/", getAllSessions);// Route to get all telemedicine sessions(GET /api/sessions)
router.get("/:id", getSessionById);// Route to get one session by ID(GET /api/sessions/:id)
router.put("/:id", updateSession);// Route to update a session(PUT /api/sessions/:id)
router.delete("/:id", deleteSession);// Route to delete a session(DELETE /api/sessions/:id)

// Additional routes for session status updates
router.put("/:id/start", startSession);// START session
router.put("/:id/complete", completeSession);// COMPLETE session
router.put("/:id/cancel", cancelSession);// CANCEL session

module.exports = router;
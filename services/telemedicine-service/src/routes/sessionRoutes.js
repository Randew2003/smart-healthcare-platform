const express = require("express");
const {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
  startSession,
  completeSession,
  cancelSession,
  updateMeetingDetails,
  getMeetingDetails,
  updateSessionNotes,
  getSessionNotes,
  getSessionsByDoctor,
  getSessionsByPatient,
  getCompletedSessions,
  updateFollowUpDetails,
  getFollowUpDetails
} = require("../controllers/sessionController");

const router = express.Router();

// Define routes for telemedicine sessions
router.post("/", createSession);// Route to create a new telemedicine session(POST /api/sessions)
router.get("/", getAllSessions);// Route to get all telemedicine sessions(GET /api/sessions)

// History routes
router.get("/doctor/:doctorId", getSessionsByDoctor);
router.get("/patient/:patientId", getSessionsByPatient);
router.get("/history/completed", getCompletedSessions);

//Single session routes
router.get("/:id", getSessionById);// Route to get one session by ID(GET /api/sessions/:id)
router.put("/:id", updateSession);// Route to update a session(PUT /api/sessions/:id)
router.delete("/:id", deleteSession);// Route to delete a session(DELETE /api/sessions/:id)

// Additional routes for session status updates
router.put("/:id/start", startSession);// START session
router.put("/:id/complete", completeSession);// COMPLETE session
router.put("/:id/cancel", cancelSession);// CANCEL session

// Meeting routes
router.put("/:id/meeting", updateMeetingDetails);
router.get("/:id/meeting", getMeetingDetails);

// Notes routes
router.put("/:id/notes", updateSessionNotes);
router.get("/:id/notes", getSessionNotes);


// Follow-up routes
router.put("/:id/follow-up", updateFollowUpDetails);
router.get("/:id/follow-up", getFollowUpDetails);

module.exports = router;
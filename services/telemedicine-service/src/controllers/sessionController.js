const Session = require("../models/Session");

// CREATE session
// POST /api/sessions
exports.createSession = async (req, res) => {
  try {
    const session = await Session.create(req.body);

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: session,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET all sessions
// GET /api/sessions
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET single session by ID
// GET /api/sessions/:id
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE session
// PUT /api/sessions/:id
exports.updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Session updated successfully",
      data: session,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE session
// DELETE /api/sessions/:id
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// START session (mark as ongoing)
// PUT /api/sessions/:id/start
exports.startSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // update status and start time
    session.status = "ongoing";
    session.startTime = new Date();

    await session.save();

    res.status(200).json({
      success: true,
      message: "Session started",
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// COMPLETE session
// PUT /api/sessions/:id/complete
exports.completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.status = "completed";
    session.endTime = new Date();

    await session.save();

    res.status(200).json({
      success: true,
      message: "Session completed",
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CANCEL session
// PUT /api/sessions/:id/cancel
exports.cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.status = "cancelled";

    await session.save();

    res.status(200).json({
      success: true,
      message: "Session cancelled",
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE meeting details
// PUT /api/sessions/:id/meeting
exports.updateMeetingDetails = async (req, res) => {
  try {
    const { roomId, meetingLink } = req.body;

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (roomId !== undefined) session.roomId = roomId;
    if (meetingLink !== undefined) session.meetingLink = meetingLink;

    await session.save();

    res.status(200).json({
      success: true,
      message: "Meeting details updated successfully",
      data: session,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET meeting details
// GET /api/sessions/:id/meeting
exports.getMeetingDetails = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).select(
      "doctorId patientId appointmentId roomId meetingLink scheduledTime status"
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ADD or UPDATE consultation notes
// PUT /api/sessions/:id/notes
exports.updateSessionNotes = async (req, res) => {
  try {
    const { notes } = req.body;

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    session.notes = notes || "";

    await session.save();

    res.status(200).json({
      success: true,
      message: "Session notes updated successfully",
      data: session,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET consultation notes
// GET /api/sessions/:id/notes
exports.getSessionNotes = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).select(
      "doctorId patientId appointmentId status notes"
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET sessions by doctor ID
// GET /api/sessions/doctor/:doctorId
exports.getSessionsByDoctor = async (req, res) => {
  try {
    const sessions = await Session.find({ doctorId: req.params.doctorId }).sort({ scheduledTime: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET sessions by patient ID
// GET /api/sessions/patient/:patientId
exports.getSessionsByPatient = async (req, res) => {
  try {
    const sessions = await Session.find({ patientId: req.params.patientId }).sort({ scheduledTime: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET completed session history
// GET /api/sessions/history/completed
exports.getCompletedSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ status: "completed" }).sort({ endTime: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
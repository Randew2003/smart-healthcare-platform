import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { isLoggedIn } from "../../utils/auth";
import banner from "../../assets/banner3.png";
import {
  formatDateTime,
  normalizeApiPayload,
  statusBadgeClasses,
  useDoctorServiceId
} from "./doctorUtils";

function toDatetimeLocalValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function DoctorTelemedicine() {
  const { doctorId, setDoctorId, resolving, resolvedFrom } = useDoctorServiceId();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const selected = useMemo(
    () => sessions.find((s) => String(s?._id) === String(selectedId)) || null,
    [selectedId, sessions]
  );

  const [editRoomId, setEditRoomId] = useState("");
  const [editMeetingLink, setEditMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [prescriptionId, setPrescriptionId] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");

  const load = useCallback(async () => {
    if (!isLoggedIn()) return;
    if (!doctorId) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.get(`/api/sessions/doctor/${encodeURIComponent(doctorId)}`);
      const payload = normalizeApiPayload(data);
      const list = payload?.data || payload;
      setSessions(Array.isArray(list) ? list : []);
    } catch (err) {
      setSessions([]);
      setError(err?.response?.data?.message || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selected) return;

    setEditRoomId(selected?.roomId || "");
    setEditMeetingLink(selected?.meetingLink || "");
    setNotes(selected?.notes || "");
    setPrescriptionId(selected?.prescriptionId || "");
    setFollowUpRequired(!!selected?.followUpRequired);
    setFollowUpDate(toDatetimeLocalValue(selected?.followUpDate));
  }, [selected]);

  const createSession = async (e) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      setError("Please login first.");
      return;
    }

    if (!doctorId) {
      setError("Set your doctor service id first.");
      return;
    }

    if (!patientId || !appointmentId || !roomId || !scheduledTime) {
      setError("patientId, appointmentId, roomId, and scheduledTime are required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post("/api/sessions", {
        doctorId,
        patientId,
        appointmentId,
        roomId,
        meetingLink,
        scheduledTime: new Date(scheduledTime).toISOString()
      });

      setMessage(data?.message || "Session created.");
      setPatientId("");
      setAppointmentId("");
      setRoomId("");
      setScheduledTime("");
      setMeetingLink("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create session.");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (sessionId, action) => {
    if (!sessionId || !action) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.put(`/api/sessions/${encodeURIComponent(sessionId)}/${action}`);
      setMessage(data?.message || `Session ${action}d.`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update session status.");
    } finally {
      setSaving(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!sessionId) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.delete(`/api/sessions/${encodeURIComponent(sessionId)}`);
      setMessage(data?.message || "Session deleted.");
      if (selectedId === sessionId) setSelectedId("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete session.");
    } finally {
      setSaving(false);
    }
  };

  const saveMeeting = async () => {
    if (!selectedId) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.put(`/api/sessions/${encodeURIComponent(selectedId)}/meeting`, {
        roomId: editRoomId,
        meetingLink: editMeetingLink
      });

      setMessage(data?.message || "Meeting details updated.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update meeting details.");
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedId) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.put(`/api/sessions/${encodeURIComponent(selectedId)}/notes`, { notes });
      setMessage(data?.message || "Notes updated.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update notes.");
    } finally {
      setSaving(false);
    }
  };

  const saveFollowUp = async () => {
    if (!selectedId) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.put(`/api/sessions/${encodeURIComponent(selectedId)}/follow-up`, {
        prescriptionId,
        followUpRequired,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null
      });

      setMessage(data?.message || "Follow-up details updated.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update follow-up details.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20";

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="relative h-[200px] sm:h-[240px] lg:h-[280px]">
            <img
              src={banner}
              alt="Telemedicine"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/10" />
            <div className="relative flex h-full items-center p-5 sm:p-8">
              <div className="max-w-2xl">
                <div className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#00bbb3]">
                  Telemedicine Service
                </div>
                <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Telemedicine (Doctor)
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-700 sm:text-base">
                  Create and manage secure online consultation sessions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Telemedicine sessions</h2>
              <p className="mt-1 text-sm text-slate-600">Create, update, and manage session details.</p>
            </div>

            <button
              onClick={load}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-extrabold text-[#2f6b14]"
            >
              Refresh
            </button>
          </div>

          {!isLoggedIn() ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Login as a verified doctor to manage sessions.
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <label className="text-xs font-extrabold text-slate-700">Doctor Service ID</label>
              <input
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="Paste doctor-service doctor _id"
                className={inputClass}
              />
              <div className="mt-2 text-xs text-slate-500">
                {resolvedFrom ? `Resolved from: ${resolvedFrom}` : null}
                {resolving ? " (resolving...)" : null}
              </div>

              <h2 className="mt-6 text-base font-black text-slate-900">Create session</h2>
              <form onSubmit={createSession} className="mt-4 grid gap-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Patient ID</label>
                  <input value={patientId} onChange={(e) => setPatientId(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Appointment ID</label>
                  <input value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} className={inputClass} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Room ID</label>
                    <input value={roomId} onChange={(e) => setRoomId(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Scheduled time</label>
                    <input
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      type="datetime-local"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700">Meeting link (optional)</label>
                  <input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className={inputClass} />
                </div>

                <button
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                  type="submit"
                >
                  {saving ? "Saving..." : "Create session"}
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-black text-slate-900">My sessions</h2>

              {loading ? <div className="mt-3 text-sm text-slate-600">Loading sessions...</div> : null}

              {!loading && sessions.length === 0 ? (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                  No sessions yet.
                </div>
              ) : null}

              <div className="mt-4 grid gap-3">
                {sessions.map((s) => (
                  <button
                    key={s?._id}
                    type="button"
                    onClick={() => setSelectedId(s?._id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedId === s?._id
                        ? "border-[#80c342]/35 bg-[#80c342]/10"
                        : "border-black/5 bg-[#fbfdf9]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="text-sm font-black text-slate-900">Session: {s?._id}</div>
                      <div
                        className={`rounded-full border px-3 py-1 text-xs font-extrabold ${statusBadgeClasses(
                          s?.status
                        )}`}
                      >
                        {s?.status || "scheduled"}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-600">
                      Patient: {s?.patientId || "-"} • Appointment: {s?.appointmentId || "-"}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">Scheduled: {formatDateTime(s?.scheduledTime)}</div>
                    {s?.meetingLink ? (
                      <div className="mt-2 text-xs font-extrabold text-[#2f6b14]">Has meeting link</div>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {message}
            </div>
          ) : null}

          {selected ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-base font-black text-slate-900">Manage session</div>
                  <div className="mt-1 text-xs text-slate-600">{selected?._id}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatus(selected?._id, "start")}
                    disabled={saving}
                    className="rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                    type="button"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => setStatus(selected?._id, "complete")}
                    disabled={saving}
                    className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-black text-[#2f6b14] disabled:opacity-60"
                    type="button"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => setStatus(selected?._id, "cancel")}
                    disabled={saving}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 disabled:opacity-60"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteSession(selected?._id)}
                    disabled={saving}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 disabled:opacity-60"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {selected?.meetingLink ? (
                <a
                  href={selected.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-extrabold text-[#2f6b14]"
                >
                  Open meeting link
                </a>
              ) : null}

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-black text-slate-900">Meeting</div>

                  <div className="mt-3">
                    <label className="text-xs font-extrabold text-slate-700">Room ID</label>
                    <input value={editRoomId} onChange={(e) => setEditRoomId(e.target.value)} className={inputClass} />
                  </div>
                  <div className="mt-3">
                    <label className="text-xs font-extrabold text-slate-700">Meeting link</label>
                    <input
                      value={editMeetingLink}
                      onChange={(e) => setEditMeetingLink(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <button
                    onClick={saveMeeting}
                    disabled={saving}
                    className="mt-4 w-full rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                    type="button"
                  >
                    Save meeting
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-black text-slate-900">Notes</div>

                  <div className="mt-3">
                    <label className="text-xs font-extrabold text-slate-700">Consultation notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={8}
                      className={inputClass}
                    />
                  </div>

                  <button
                    onClick={saveNotes}
                    disabled={saving}
                    className="mt-4 w-full rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                    type="button"
                  >
                    Save notes
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-black text-slate-900">Follow-up</div>

                  <div className="mt-3">
                    <label className="text-xs font-extrabold text-slate-700">Prescription ID</label>
                    <input
                      value={prescriptionId}
                      onChange={(e) => setPrescriptionId(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <label className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={followUpRequired}
                      onChange={(e) => setFollowUpRequired(e.target.checked)}
                    />
                    Follow-up required
                  </label>

                  <div className="mt-3">
                    <label className="text-xs font-extrabold text-slate-700">Follow-up date</label>
                    <input
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      type="datetime-local"
                      className={inputClass}
                    />
                  </div>

                  <button
                    onClick={saveFollowUp}
                    disabled={saving}
                    className="mt-4 w-full rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                    type="button"
                  >
                    Save follow-up
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </MainLayout>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../utils/api";
import { isLoggedIn } from "../../utils/auth";
import { normalizeApiPayload, useDoctorServiceId } from "./doctorUtils";
import banner from "../../assets/banner2.png";

const dayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export default function DoctorAvailability() {
  const { doctorId, setDoctorId, resolving, resolvedFrom } = useDoctorServiceId();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [doctorName, setDoctorName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [availability, setAvailability] = useState([]);

  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [editingId, setEditingId] = useState("");
  const [editDay, setEditDay] = useState("Monday");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editBooked, setEditBooked] = useState(false);

  const load = useCallback(async () => {
    if (!isLoggedIn()) return;
    if (!doctorId) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.get(`/api/doctors/${encodeURIComponent(doctorId)}/availability`);
      const payload = normalizeApiPayload(data);
      const d = payload?.data || payload;

      setDoctorName(d?.name || "");
      setSpecialization(d?.specialization || "");
      setAvailability(Array.isArray(d?.availability) ? d.availability : []);
    } catch (err) {
      setDoctorName("");
      setSpecialization("");
      setAvailability([]);
      setError(err?.response?.data?.message || "Failed to load availability.");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    load();
  }, [load]);

  const addSlot = async (e) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      setError("Please login first.");
      return;
    }

    if (!doctorId) {
      setError("Set your doctor service id first.");
      return;
    }

    if (!day || !startTime || !endTime) {
      setError("Day, start time, and end time are required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post(`/api/doctors/${encodeURIComponent(doctorId)}/availability`, {
        day,
        startTime,
        endTime
      });

      setMessage(data?.message || "Availability slot added.");
      setStartTime("");
      setEndTime("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add availability slot.");
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (slot) => {
    setEditingId(slot?._id || "");
    setEditDay(slot?.day || "Monday");
    setEditStartTime(slot?.startTime || "");
    setEditEndTime(slot?.endTime || "");
    setEditBooked(!!slot?.isBooked);
  };

  const cancelEdit = () => {
    setEditingId("");
  };

  const saveEdit = async () => {
    if (!editingId) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.put(
        `/api/doctors/${encodeURIComponent(doctorId)}/availability/${encodeURIComponent(editingId)}`,
        {
          day: editDay,
          startTime: editStartTime,
          endTime: editEndTime,
          isBooked: editBooked
        }
      );

      setMessage(data?.message || "Availability slot updated.");
      setEditingId("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update availability slot.");
    } finally {
      setSaving(false);
    }
  };

  const removeSlot = async (slotId) => {
    if (!slotId) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.delete(
        `/api/doctors/${encodeURIComponent(doctorId)}/availability/${encodeURIComponent(slotId)}`
      );
      setMessage(data?.message || "Availability slot removed.");
      if (editingId === slotId) setEditingId("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete availability slot.");
    } finally {
      setSaving(false);
    }
  };

  const bookedCount = useMemo(
    () => availability.filter((s) => s?.isBooked).length,
    [availability]
  );

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#80c342] focus:ring-2 focus:ring-[#80c342]/20";

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="relative h-[200px] sm:h-[240px] lg:h-[280px]">
            <img
              src={banner}
              alt="Doctor availability"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/10" />
            <div className="relative flex h-full items-center p-5 sm:p-8">
              <div className="max-w-2xl">
                <div className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#00bbb3]">
                  Doctor Service
                </div>
                <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Availability
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-700 sm:text-base">
                  Manage your available consultation slots.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Availability slots</h2>
              <p className="mt-1 text-sm text-slate-600">Add, edit, or remove your consultation times.</p>
            </div>

            <button
              onClick={load}
              className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-extrabold text-[#2f6b14]"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs font-extrabold text-slate-700">Doctor</div>
              <div className="mt-2 text-base font-black text-slate-900">{doctorName || "-"}</div>
              <div className="mt-1 text-sm font-semibold text-slate-600">{specialization || "-"}</div>

              <div className="mt-4">
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
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-black/5 bg-[#fbfdf9] p-3">
                  <div className="text-xs font-extrabold text-slate-600">Total slots</div>
                  <div className="mt-1 text-xl font-black text-slate-900">{availability.length}</div>
                </div>
                <div className="rounded-xl border border-black/5 bg-[#fbfdf9] p-3">
                  <div className="text-xs font-extrabold text-slate-600">Booked</div>
                  <div className="mt-1 text-xl font-black text-slate-900">{bookedCount}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-black text-slate-900">Add slot</h2>
              <form onSubmit={addSlot} className="mt-4 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Day</label>
                    <select value={day} onChange={(e) => setDay(e.target.value)} className={inputClass}>
                      {dayOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">Start</label>
                    <input value={startTime} onChange={(e) => setStartTime(e.target.value)} type="time" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">End</label>
                    <input value={endTime} onChange={(e) => setEndTime(e.target.value)} type="time" className={inputClass} />
                  </div>
                </div>

                <button
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                  type="submit"
                >
                  {saving ? "Saving..." : "Add slot"}
                </button>
              </form>
            </div>
          </div>

          {loading ? <div className="mt-4 text-sm text-slate-600">Loading...</div> : null}

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

          <div className="mt-6">
            <h2 className="text-base font-black text-slate-900">My slots</h2>

            {!loading && availability.length === 0 ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                No availability slots yet.
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              {availability.map((slot) => {
                const isEditing = editingId === slot?._id;

                return (
                  <div key={slot?._id} className="rounded-2xl border border-black/5 bg-[#fbfdf9] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-black text-slate-900">
                          {slot?.day || "-"} • {slot?.startTime || "-"} - {slot?.endTime || "-"}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          Status: {slot?.isBooked ? "Booked" : "Available"}
                        </div>
                      </div>

                      {!isEditing ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => beginEdit(slot)}
                            className="rounded-xl border border-[#80c342]/30 bg-[#80c342]/10 px-4 py-2 text-sm font-black text-[#2f6b14]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeSlot(slot?._id)}
                            disabled={saving}
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {isEditing ? (
                      <div className="mt-4 grid gap-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <label className="text-xs font-extrabold text-slate-700">Day</label>
                            <select value={editDay} onChange={(e) => setEditDay(e.target.value)} className={inputClass}>
                              {dayOptions.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-extrabold text-slate-700">Start</label>
                            <input value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} type="time" className={inputClass} />
                          </div>
                          <div>
                            <label className="text-xs font-extrabold text-slate-700">End</label>
                            <input value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} type="time" className={inputClass} />
                          </div>
                        </div>

                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={editBooked}
                            onChange={(e) => setEditBooked(e.target.checked)}
                          />
                          Mark as booked
                        </label>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="rounded-xl bg-[#80c342] px-4 py-2 text-sm font-black text-white hover:bg-[#60a421] disabled:opacity-60"
                            type="button"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700"
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

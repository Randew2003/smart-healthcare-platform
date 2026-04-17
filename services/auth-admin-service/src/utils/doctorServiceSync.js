function toNumberOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function buildDoctorServicePayloadFromUser(user) {
  const verificationStatus = user?.doctorVerificationStatus;
  const specialization = user?.doctorApplication?.specialization || "";

  return {
    name: user?.fullName,
    email: user?.email,
    specialization,
    experience: toNumberOrZero(user?.doctorApplication?.yearsExperience),
    phone: user?.phone || "",
    hospital: user?.doctorApplication?.clinicName || "",
    licenseNumber: user?.doctorApplication?.licenseNumber || "",
    isVerified: verificationStatus === "verified",
    verificationStatus: verificationStatus === "verified" ? "verified" : "pending",
    verificationNotes: "Synced from auth-admin-service"
  };
}

export async function syncDoctorToDoctorService(user, { baseUrl } = {}) {
  const doctorServiceBaseUrl = baseUrl || process.env.DOCTOR_SERVICE_URL || "http://doctor-service:4005";

  const payload = buildDoctorServicePayloadFromUser(user);
  if (!payload?.email || !payload?.name || !payload?.specialization) {
    return { ok: false, skipped: true, reason: "missing_required_fields" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${doctorServiceBaseUrl}/api/doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (res.ok) return { ok: true };

    const text = await res.text().catch(() => "");
    if (res.status === 400 && /(duplicate key|E11000)/i.test(text)) {
      return { ok: true, alreadyExists: true };
    }

    return { ok: false, status: res.status, message: text || res.statusText };
  } catch (error) {
    return { ok: false, message: error?.message || String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

export async function syncAllDoctorsToDoctorService({ baseUrl } = {}) {
  const { default: User } = await import("../models/User.js");

  const candidates = await User.find({
    role: "doctor",
    doctorVerificationStatus: { $in: ["pending", "verified"] },
    isActive: true
  }).select("fullName email phone doctorVerificationStatus doctorApplication");

  let synced = 0;
  let skipped = 0;

  for (const user of candidates) {
    const result = await syncDoctorToDoctorService(user, { baseUrl });
    if (result?.skipped) skipped += 1;
    else if (result?.ok) synced += 1;
  }

  return { total: candidates.length, synced, skipped };
}

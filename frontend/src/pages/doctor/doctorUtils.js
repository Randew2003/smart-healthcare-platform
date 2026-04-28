import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";

const STORAGE_KEY_PREFIX = "doctorServiceDoctorId";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function getStorageKey(userEmail) {
  const normalizedEmail = normalizeEmail(userEmail);
  return normalizedEmail ? `${STORAGE_KEY_PREFIX}:${normalizedEmail}` : STORAGE_KEY_PREFIX;
}

export function useDoctorServiceId() {
  const user = getUser();
  const userEmail = normalizeEmail(user?.email);
  const scopedStorageKey = getStorageKey(userEmail);

  const [doctorId, setDoctorIdState] = useState("");
  const [resolving, setResolving] = useState(Boolean(userEmail && isLoggedIn()));
  const [resolvedFrom, setResolvedFrom] = useState("");

  const setDoctorId = useCallback((nextId) => {
    const normalized = String(nextId || "").trim();
    setDoctorIdState(normalized);

    if (normalized) {
      localStorage.setItem(scopedStorageKey, normalized);
    } else {
      localStorage.removeItem(scopedStorageKey);
    }
  }, [scopedStorageKey]);

  const resolve = useCallback(async () => {
    if (!isLoggedIn() || !userEmail) {
      setDoctorIdState("");
      setResolvedFrom("");
      setResolving(false);
      return;
    }

    setResolving(true);
    try {
      const cachedDoctorId = String(localStorage.getItem(scopedStorageKey) || "").trim();

      if (cachedDoctorId) {
        try {
          const { data } = await api.get(`/api/doctors/${encodeURIComponent(cachedDoctorId)}`);
          const doctor = data?.data || data;

          if (doctor?._id && normalizeEmail(doctor?.email) === userEmail) {
            setDoctorIdState(doctor._id);
            setResolvedFrom("validated cached doctor-service ID");
            return;
          }
        } catch {
          // Ignore and continue with a fresh lookup by email.
        }

        localStorage.removeItem(scopedStorageKey);
        setDoctorIdState("");
      }

      const { data } = await api.get("/api/doctors");
      const list = Array.isArray(data) ? data : data?.data;
      const doctors = Array.isArray(list) ? list : [];

      const match = doctors.find((doctor) => normalizeEmail(doctor?.email) === userEmail);

      if (match?._id) {
        setDoctorId(match._id);
        setResolvedFrom("email match (doctor-service)");
      } else {
        setDoctorIdState("");
        setResolvedFrom("no doctor-service profile matched login email");
      }
    } catch {
      setDoctorIdState("");
      setResolvedFrom("");
    } finally {
      setResolving(false);
    }
  }, [scopedStorageKey, setDoctorId, userEmail]);

  useEffect(() => {
    resolve();
  }, [resolve]);

  const doctorDisplay = useMemo(() => {
    return {
      userId: user?.id || "",
      userEmail: user?.email || "",
      doctorId
    };
  }, [doctorId, user?.email, user?.id]);

  return {
    doctorId,
    setDoctorId,
    resolving,
    resolvedFrom,
    doctorDisplay
  };
}

export function normalizeApiPayload(responseData) {
  if (Array.isArray(responseData)) return responseData;
  if (responseData?.data !== undefined) return responseData.data;
  return responseData;
}

export function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export function statusBadgeClasses(status) {
  const s = String(status || "").toLowerCase();

  if (s.includes("cancel") || s.includes("reject")) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (s.includes("complete") || s.includes("done") || s.includes("success")) {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (s.includes("confirm") || s.includes("approved") || s.includes("ongoing") || s.includes("accept")) {
    return "border-[#fbb033]/35 bg-[#fbb033]/10 text-[#7a4d00]";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

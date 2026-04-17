import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import { getUser, isLoggedIn } from "../../utils/auth";

const STORAGE_KEY = "doctorServiceDoctorId";

function isMongoObjectId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || ""));
}

export function useDoctorServiceId() {
  const user = getUser();

  const [doctorId, setDoctorIdState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "";
  });
  const [resolving, setResolving] = useState(false);
  const [resolvedFrom, setResolvedFrom] = useState("");

  const setDoctorId = useCallback((nextId) => {
    const normalized = String(nextId || "").trim();
    setDoctorIdState(normalized);

    if (normalized) {
      localStorage.setItem(STORAGE_KEY, normalized);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const resolve = useCallback(async () => {
    if (!isLoggedIn()) return;
    if (doctorId) return;

    if (user?.id && isMongoObjectId(user.id)) {
      setDoctorId(user.id);
      setResolvedFrom("auth user id");
      return;
    }

    if (!user?.email) return;

    setResolving(true);
    try {
      const { data } = await api.get("/api/doctors");
      const list = Array.isArray(data) ? data : data?.data;
      const doctors = Array.isArray(list) ? list : [];

      const match = doctors.find(
        (d) => String(d?.email || "").toLowerCase() === String(user.email).toLowerCase()
      );

      if (match?._id) {
        setDoctorId(match._id);
        setResolvedFrom("email match");
      }
    } catch {
      // ignore
    } finally {
      setResolving(false);
    }
  }, [doctorId, setDoctorId, user?.email, user?.id]);

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

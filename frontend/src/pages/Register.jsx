import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { api } from "../utils/api";
import { setAuth } from "../utils/auth";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const showDoctorFields = role === "doctor";

  const [doctorApplication, setDoctorApplication] = useState({
    dob: "",
    licenseNumber: "",
    specialization: "",
    clinicName: "",
    yearsExperience: ""
  });

  const canSubmit = useMemo(() => {
    if (!fullName || !email || !password || !role) return false;
    if (showDoctorFields) {
      return (
        !!doctorApplication.licenseNumber &&
        !!doctorApplication.specialization &&
        !!doctorApplication.yearsExperience
      );
    }
    return true;
  }, [doctorApplication, email, fullName, password, role, showDoctorFields]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        fullName,
        email,
        phone,
        password,
        role
      };

      if (showDoctorFields) {
        payload.doctorApplication = {
          ...doctorApplication,
          dob: doctorApplication.dob || null
        };
      }

      const { data } = await api.post("/api/auth/register", payload);

      if (data?.token && data?.user) {
        setAuth({ token: data.token, user: data.user });
        navigate("/appointments");
        return;
      }

      const msg = data?.message || "Registration submitted.";

      // Doctor registrations do not return a token (requires admin verification).
      if (role === "doctor") {
        navigate("/login", { state: { info: msg } });
        return;
      }

      setMessage(msg);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.head}>
            <h2 style={styles.title}>Create Your Account</h2>
            <p style={styles.sub}>
              Register as a patient (instant access) or as a doctor (requires admin verification).
            </p>
          </div>

          {error ? <div style={styles.error}>{error}</div> : null}
          {message ? <div style={styles.success}>{message}</div> : null}

          <form onSubmit={onSubmit} style={styles.form}>
            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  required
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Phone (optional)</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94..."
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  required
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </div>

            <label style={styles.label}>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Minimum 6 characters"
              required
              style={styles.input}
            />

            {showDoctorFields ? (
              <div style={styles.doctorBox}>
                <div style={styles.doctorTitle}>Doctor verification details</div>

                <div style={styles.grid2}>
                  <div>
                    <label style={styles.label}>Specialization</label>
                    <input
                      value={doctorApplication.specialization}
                      onChange={(e) =>
                        setDoctorApplication((s) => ({ ...s, specialization: e.target.value }))
                      }
                      placeholder="Cardiology, Dermatology..."
                      style={styles.input}
                      required
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Years experience</label>
                    <input
                      value={doctorApplication.yearsExperience}
                      onChange={(e) =>
                        setDoctorApplication((s) => ({ ...s, yearsExperience: e.target.value }))
                      }
                      placeholder="5"
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.grid2}>
                  <div>
                    <label style={styles.label}>License number</label>
                    <input
                      value={doctorApplication.licenseNumber}
                      onChange={(e) =>
                        setDoctorApplication((s) => ({ ...s, licenseNumber: e.target.value }))
                      }
                      placeholder="SLMC..."
                      style={styles.input}
                      required
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Clinic (optional)</label>
                    <input
                      value={doctorApplication.clinicName}
                      onChange={(e) =>
                        setDoctorApplication((s) => ({ ...s, clinicName: e.target.value }))
                      }
                      placeholder="Clinic / Hospital"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.grid2}>
                  <div>
                    <label style={styles.label}>Date of birth (optional)</label>
                    <input
                      value={doctorApplication.dob}
                      onChange={(e) => setDoctorApplication((s) => ({ ...s, dob: e.target.value }))}
                      type="date"
                      style={styles.input}
                    />
                  </div>
                </div>

                <p style={styles.note}>
                  After registration, doctors must be verified by admin before they can log in.
                </p>
              </div>
            ) : null}

            <button disabled={loading || !canSubmit} style={styles.button} type="submit">
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <p style={styles.footerText}>
            Already have an account? <Link to="/login" style={styles.link}>Login</Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 160px)",
    padding: "40px 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  card: {
    width: "100%",
    maxWidth: 780,
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 18px 60px rgba(0,0,0,0.08)",
    border: "1px solid rgba(128,195,66,0.15)",
    overflow: "hidden"
  },
  head: {
    padding: "26px 26px 18px 26px",
    background: "linear-gradient(135deg, rgba(128,195,66,0.16), rgba(251,176,51,0.14))"
  },
  title: {
    margin: 0,
    fontSize: 26,
    color: "#1f2937"
  },
  sub: {
    margin: "10px 0 0 0",
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 1.7
  },
  error: {
    margin: "18px 26px 0 26px",
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(239,68,68,0.08)",
    color: "#b91c1c",
    border: "1px solid rgba(239,68,68,0.18)",
    fontSize: 13
  },
  success: {
    margin: "18px 26px 0 26px",
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(34,197,94,0.10)",
    color: "#166534",
    border: "1px solid rgba(34,197,94,0.20)",
    fontSize: 13
  },
  form: {
    padding: 26,
    display: "grid",
    gap: 12
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },
  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "#374151"
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
    background: "#fff"
  },
  doctorBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    border: "1px dashed rgba(128,195,66,0.45)",
    background: "rgba(128,195,66,0.06)"
  },
  doctorTitle: {
    fontWeight: 800,
    fontSize: 13,
    color: "#1f2937",
    marginBottom: 10
  },
  note: {
    margin: "10px 0 0 0",
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 1.6
  },
  button: {
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #80c342, #fbb033)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14
  },
  footerText: {
    padding: "0 26px 26px 26px",
    margin: 0,
    color: "#4b5563",
    fontSize: 13
  },
  link: {
    color: "#60a421",
    fontWeight: 700,
    textDecoration: "none"
  }
};

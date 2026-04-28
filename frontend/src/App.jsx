import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/patient/Home";
import Doctors from "./pages/patient/Doctors";
import Services from "./pages/patient/Services";
import Contact from "./pages/patient/Contact";
import Telemedicine from "./pages/patient/Telemedicine";
import Payments from "./pages/patient/Payments";
import Profile from "./pages/patient/Profile";
import Prescriptions from "./pages/patient/Prescriptions";
import PaymentSuccess from "./pages/patient/PaymentSuccess";
import PaymentCancel from "./pages/patient/PaymentCancel";
import NotFound from "./pages/patient/NotFound";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import PatientRegister from "./pages/auth/PatientRegister";
import DoctorRegister from "./pages/auth/DoctorRegister";

import AdminRegister from "./pages/admin/AdminRegister";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminUsers from "./pages/admin/AdminUsers";
import PendingDoctors from "./pages/admin/PendingDoctors";
import BookAppointment from "./pages/appointments/BookAppointment";
import MyAppointments from "./pages/appointments/MyAppointments";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorPrescriptionHistory from "./pages/doctor/DoctorPrescriptionHistory";
import DoctorTelemedicine from "./pages/doctor/DoctorTelemedicine";
import DoctorAvailability from "./pages/doctor/DoctorAvailability";
import DoctorProfile from "./pages/doctor/DoctorProfile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public patient pages */}
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/telemedicine" element={<Telemedicine />} />

          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<PatientRegister />} />
          <Route path="/register/doctor" element={<DoctorRegister />} />

          {/* Admin pages */}
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            element={
              <ProtectedRoute
                roles={["admin"]}
                redirectTo="/admin/login"
                unauthorizedTo="/admin/login"
              />
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/doctors" element={<PendingDoctors />} />
          </Route>

          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />

          {/* Protected patient pages */}
          <Route element={<ProtectedRoute roles={["patient"]} />}>
            <Route path="/payments" element={<Payments />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
          </Route>

          {/* Protected doctor pages */}
          <Route element={<ProtectedRoute roles={["doctor"]} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptionHistory />} />
            <Route path="/doctor/telemedicine" element={<DoctorTelemedicine />} />
            <Route path="/doctor/availability" element={<DoctorAvailability />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>

          {/* Shared */}
          <Route element={<ProtectedRoute roles={["patient", "doctor"]} />}>
            <Route path="/appointments" element={<MyAppointments />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

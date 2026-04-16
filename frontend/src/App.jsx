import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/patient/Home";
import Doctors from "./pages/patient/Doctors";
import Services from "./pages/patient/Services";
import Contact from "./pages/patient/Contact";
import Telemedicine from "./pages/patient/Telemedicine";
import Payments from "./pages/patient/Payments";
import Profile from "./pages/patient/Profile";
import Login from "./pages/Login";
import PaymentSuccess from "./pages/patient/PaymentSuccess";
import PaymentCancel from "./pages/patient/PaymentCancel";
import NotFound from "./pages/patient/NotFound";

import Appointments from "./pages/Appointments";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public patient pages */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/telemedicine" element={<Telemedicine />} />

        <Route path="/login" element={<Login />} />

        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />

        {/* Protected patient pages */}
        <Route element={<ProtectedRoute roles={["patient"]} />}>
          <Route path="/payments" element={<Payments />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Shared */}
        <Route element={<ProtectedRoute roles={["patient", "doctor"]} />}>
          <Route path="/appointments" element={<Appointments />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

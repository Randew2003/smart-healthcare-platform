import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Appointments from "./pages/Appointments";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
       
    
        <Route element={<ProtectedRoute roles={["patient", "doctor"]} />}>
          <Route path="/appointments" element={<Appointments />} />
          
        </Route>

        
      </Routes>
    </BrowserRouter>
  );
}
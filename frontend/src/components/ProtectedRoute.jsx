import { Navigate, Outlet } from "react-router-dom";
import { getUser, isLoggedIn } from "../utils/auth";

export default function ProtectedRoute({ roles }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const user = getUser();
    if (!user || !roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}

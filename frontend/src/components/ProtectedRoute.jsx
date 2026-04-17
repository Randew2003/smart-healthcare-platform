import { Navigate, Outlet } from "react-router-dom";
import { getUser, isLoggedIn } from "../utils/auth";

export default function ProtectedRoute({ roles, redirectTo = "/login", unauthorizedTo = "/" }) {
  if (!isLoggedIn()) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && roles.length > 0) {
    const user = getUser();
    if (!user || !roles.includes(user.role)) {
      return <Navigate to={unauthorizedTo} replace />;
    }
  }

  return <Outlet />;
}

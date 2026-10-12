import { Navigate, useLocation } from "react-router";
import { useAuth } from "../Frontend/context/auth/useAuth";
import { AdminLoader } from "./admin-ui";

const RequireAuth = ({ children }) => {
  const { isAuthenticated, isAdmin, status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <AdminLoader label="Checking your session..." />;

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAuth;
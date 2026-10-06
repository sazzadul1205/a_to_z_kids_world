import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/auth/useAuth";
import { AdminLoader } from "./admin-ui";

// Guards every /admin route. Nothing links here: the storefront is a showcase
// and this is the only sign-in surface on the site.
const RequireAdmin = ({ children }) => {
  const { isAuthenticated, isAdmin, status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <AdminLoader label="Checking your session..." />;

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default RequireAdmin;
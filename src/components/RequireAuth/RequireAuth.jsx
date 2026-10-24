import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "../../store/store";

// The token is a JWT; treat it as logged out once its `exp` has passed.
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};

/** Renders children for a logged-in user, otherwise redirects to /login. */
const RequireAuth = ({ children }) => {
  const location = useLocation();
  const auth = useStore((s) => s.auth);
  const logout = useStore((s) => s.logout);
  const expired = !!auth && isTokenExpired(auth.token);

  useEffect(() => {
    if (expired) logout();
  }, [expired, logout]);

  if (!auth || expired) {
    const from = location.pathname + location.search + location.hash;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
};

export default RequireAuth;

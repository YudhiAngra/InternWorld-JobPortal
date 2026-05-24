import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_URL } from "../config";

function ProtectedRoute({ children, role }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}

export default ProtectedRoute;
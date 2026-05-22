import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    fetch("http://localhost:4000/api/auth/me", {
      credentials: "include",
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  //Loading
  if (user === undefined) return <p>Loading...</p>;

  //Not logged in
  if (!user) return <Navigate to="/login" />;

  //Wrong role
  if (role && user.role !== role) return <Navigate to="/" />;

  //Allowed
  return children;
}

export default ProtectedRoute;
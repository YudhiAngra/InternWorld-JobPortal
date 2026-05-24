import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("All fields are required ❌");
      return;
    }

    try {
      const res = await API.post("/auth/login", form);

      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("authChange"));

      toast.success("Login successful 🚀");
      navigate("/jobs");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed ❌");
    }
  };

  const isValid = form.email !== "" && form.password !== "";

  return (
    <div className="auth-container">
      <div className="auth-left">
        <form className="auth-card" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>

          <label className="auth-label">Email</label>
          <input
            type="email"
            className="auth-input"
            placeholder="Enter email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <label className="auth-label">Password</label>
          <input
            type="password"
            className="auth-input"
            placeholder="Enter password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            type="submit"
            className="auth-btn"
            style={{
              opacity: isValid ? 1 : 0.5,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
            disabled={!isValid}
          >
            Login
          </button>

          <p className="auth-link-text">
            Don't have an account?{" "}
            <span className="auth-link" onClick={() => navigate("/register")}>
              Sign up
            </span>
          </p>
        </form>
      </div>

      <div className="auth-right">
        <div className="bg-animation"></div>
        <h1 className="brand-title">InternWorld</h1>
        <p className="brand-text">
          Find your dream internship and kickstart your career 🚀
        </p>
      </div>
    </div>
  );
}

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../../config";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    phone: "",
    dob: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const key in form) {
      if (!form[key]) {
        toast.error("All fields are required ❌");
        return;
      }
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      if (res.ok) {
        toast.success("Registered successfully 🎉");
        navigate("/login");
      } else {
        toast.error("Registration failed ❌");
      }
    } catch {
      toast.error("Server error ❌");
    }
  };

  const isValid =
    Object.values(form).every((v) => v !== "") &&
    form.password === form.confirmPassword;

  const inputField = (labelText, field, type = "text") => (
    <>
      <label className="auth-label">{labelText}</label>
      <input
        type={type}
        className="auth-input"
        placeholder={`Enter ${labelText.toLowerCase()}`}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
      />
    </>
  );

  return (
    <div className="auth-container">
      <div className="auth-left" style={{ alignItems: "flex-start", padding: "40px 0" }}>
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Create Account</h2>

          {inputField("Username", "username")}
          {inputField("Phone Number", "phone")}

          <label className="auth-label">Date of Birth</label>
          <input
            type="date"
            className="auth-input"
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
          />

          <label className="auth-label">Gender</label>
          <select
            className="auth-input"
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          {inputField("Email", "email", "email")}
          {inputField("Password", "password", "password")}
          {inputField("Confirm Password", "confirmPassword", "password")}

          <label className="auth-label">Role</label>
          <select
            className="auth-input"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="">Select role</option>
            <option value="user">Job Seeker</option>
            <option value="employer">Employer</option>
          </select>

          <button
            type="submit"
            className="auth-btn"
            style={{
              marginTop: "10px",
              opacity: isValid ? 1 : 0.5,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
            disabled={!isValid}
          >
            Sign Up
          </button>

          <p className="auth-link-text" style={{ marginTop: "10px" }}>
            Already have an account?{" "}
            <span className="auth-link" onClick={() => navigate("/login")}>
              Sign in
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

export default Register;
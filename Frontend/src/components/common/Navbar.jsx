import React, { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(undefined);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const syncUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    window.addEventListener("authChange", syncUser);
    return () => window.removeEventListener("authChange", syncUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-menu-open", menuOpen);
    return () => document.body.classList.remove("nav-menu-open");
  }, [menuOpen]);

  if (user === undefined) return null;

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        credentials: "include",
      });

      localStorage.removeItem("user");
      setUser(null);
      window.dispatchEvent(new Event("authChange"));
      toast.success("Logged out successfully 👋");
      closeMenu();
      navigate("/");
    } catch {
      toast.error("Logout failed ❌");
    }
  };

  const navLinks = () => {
    if (user === null) {
      return (
        <>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/jobs" className="nav-link" onClick={closeMenu}>Opportunities</Link>
          <Link to="/login" className="nav-link nav-btn" onClick={closeMenu}>Login</Link>
          <Link to="/register" className="nav-link nav-btn nav-btn-primary" onClick={closeMenu}>Sign Up</Link>
        </>
      );
    }
    if (user?.role === "user") {
      return (
        <>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/jobs" className="nav-link" onClick={closeMenu}>Opportunities</Link>
          <Link to="/applied" className="nav-link" onClick={closeMenu}>Applied Jobs</Link>
          <Link to="/profile" className="nav-link" onClick={closeMenu}>Profile</Link>
          <Link to="/resume-builder" className="nav-link" onClick={closeMenu}>Resume Builder</Link>
          <button className="nav-link nav-btn nav-btn-logout" onClick={handleLogout}>Logout</button>
        </>
      );
    }
    if (user?.role === "employer") {
      return (
        <>
          <Link to="/employer" className="nav-link" onClick={closeMenu}>Dashboard</Link>
          <Link to="/post-job" className="nav-link" onClick={closeMenu}>Post Job</Link>
          <Link to="/applications" className="nav-link" onClick={closeMenu}>Applications</Link>
          <button className="nav-link nav-btn nav-btn-logout" onClick={handleLogout}>Logout</button>
        </>
      );
    }
    return null;
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <span className="brand-icon">🌐</span>
        InternWorld
      </Link>

      <div className="navbar-end">
        <div className="nav-links-desktop">{navLinks()}</div>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div className="hamburger-wrapper" ref={menuRef}>
          <button
            className={`hamburger-btn ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>

          <div className={`mobile-dropdown ${menuOpen ? "open" : ""}`}>
            {navLinks()}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="nav-backdrop" onClick={closeMenu} aria-hidden="true" />
      )}
    </nav>
  );
}

export default Navbar;
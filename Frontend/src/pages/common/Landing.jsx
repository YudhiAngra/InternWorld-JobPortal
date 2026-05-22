import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Landing.css";

const ROLE_CARDS = [
  {
    title: "Job Seeker",
    icon: "🧭",
    desc: "Browse and apply to the latest job openings from our live listings.",
    btnText: "Start Searching",
    role: "user",
    variant: "",
  },
  {
    title: "Employer",
    icon: "⚙️",
    desc: "Post jobs and hire top talent easily.",
    btnText: "Post a Job",
    role: "employer",
    variant: "",
  },
  {
    title: "Resume Builder",
    icon: "📄",
    desc: "Design a professional resume in minutes with our built-in editor and download as PDF.",
    btnText: "Build Resume",
    role: "user",
    action: "resume",
    variant: "landing-role-card--ai",
  },
];

const AI_STEPS = [
  {
    num: "1",
    title: "Upload your resume",
    desc: "Go to Profile and upload your latest PDF or DOC resume (up to 5MB).",
    link: "Go to Profile",
    path: "/profile",
  },
  {
    num: "2",
    title: "AI analyzes your profile",
    desc: "Our AI extracts your skills, experience, and qualifications in seconds.",
    link: null,
  },
  {
    num: "3",
    title: "Smart recommendations",
    desc: "Browse curated job listings matched to your profile and experience level.",
    link: null,
  },
  {
    num: "4",
    title: "Apply with confidence",
    desc: "Click ✨ AI Match to see roles ranked just for you — then apply instantly.",
    link: "View Opportunities",
    path: "/jobs",
  },
];

function Landing() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const revealRef = useRef(null);

  useEffect(() => {
    const fetchJobs = () => {
      fetch("http://localhost:4000/api/jobs")
        .then((res) => res.json())
        .then((data) => {
          const sorted = [...(Array.isArray(data) ? data : [])]
            .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
            .slice(0, 10);
          setJobs(sorted);
        })
        .catch(() => toast.error("Failed to load jobs"));
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = revealRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll(
      ".landing-reveal, .landing-ai-step, .landing-ai-visual"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [jobs.length]);

  const handleRoleNavigation = (card) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      toast.error("Please login first ❌");
      navigate("/login");
      return;
    }

    if (card.role === "user" && user.role !== "user") {
      toast.error("Only job seekers allowed ❌");
      return;
    }

    if (card.role === "employer" && user.role !== "employer") {
      toast.error("Only employers allowed ❌");
      return;
    }

    if (card.action === "resume") {
      navigate("/resume-builder");
      return;
    }

    if (card.role === "user") navigate("/jobs");
    if (card.role === "employer") navigate("/post-job");
  };

  const handleSeekerPath = (path) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      toast.error("Please login as a job seeker first ❌");
      navigate("/login");
      return;
    }
    if (user.role !== "user") {
      toast.error("Only job seekers can use this feature ❌");
      return;
    }
    navigate(path);
  };

  const baseJobs = jobs.length < 6 ? [...jobs, ...jobs, ...jobs] : jobs;
  const repeatedJobs = [...baseJobs, ...baseJobs];
  const tickerJobs =
    jobs.length > 0
      ? [...jobs, ...jobs]
      : [
          { _id: "d1", title: "Frontend Intern", company: "Tech Co" },
          { _id: "d2", title: "Backend Dev", company: "Startup" },
          { _id: "d3", title: "Full Stack", company: "Agency" },
          { _id: "d4", title: "Data Analyst", company: "Corp" },
        ];

  return (
    <div className="landing-page" ref={revealRef}>
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <h1 className="landing-hero-title">Welcome to InternWorld</h1>
          <p className="landing-hero-text">
            Your gateway to a better career. Search, apply, build your resume, or
            let AI match you to the right role.
          </p>
          <button
            type="button"
            className="landing-hero-btn"
            onClick={() => navigate("/jobs")}
          >
            Explore Careers
          </button>
        </div>
      </section>

      <section className="landing-roles landing-reveal">
        {ROLE_CARDS.map((card) => (
          <div
            key={card.title}
            className={`landing-role-card ${card.variant}`}
          >
            <span className="landing-role-icon" aria-hidden="true">
              {card.icon}
            </span>
            <h3 className="landing-role-title">{card.title}</h3>
            <p className="landing-role-desc">{card.desc}</p>
            <button
              type="button"
              className="landing-role-btn"
              onClick={() => handleRoleNavigation(card)}
            >
              {card.btnText}
            </button>
          </div>
        ))}
      </section>

      <section className="landing-ai-section landing-reveal">
        <div className="landing-ai-panel">
          <span className="landing-ai-badge">
            <span className="landing-ai-badge-icon" aria-hidden="true">
              ✨
            </span>
            AI-Powered Job Matching
          </span>
          <h2 className="landing-ai-heading">
            Smart Jobs Matched to Your Profile
          </h2>
          <p className="landing-ai-subtext">
            Upload your resume once, let AI understand your unique skills, and discover opportunities that perfectly align with your career goals — all in one seamless experience.
          </p>

          <div className="landing-ai-flow">
            <div className="landing-ai-steps">
              {AI_STEPS.map((step) => (
                <div key={step.num} className="landing-ai-step">
                  <span className="landing-ai-step-num">{step.num}</span>
                  <div className="landing-ai-step-body">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                    {step.link && step.path && (
                      <button
                        type="button"
                        className="landing-ai-step-link"
                        onClick={() => handleSeekerPath(step.path)}
                      >
                        {step.link} →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="landing-ai-visual landing-reveal" aria-hidden="true">
              <div className="landing-ai-mock-profile">
                <h5>📎 Profile → Resume</h5>
                <div className="landing-ai-upload-bar">
                  <div className="landing-ai-upload-fill" />
                </div>
                <span className="landing-ai-mock-label">Uploading resume…</span>
              </div>

              <div className="landing-ai-connector" />
              <div className="landing-ai-brain">🤖</div>
              <span className="landing-ai-match-btn">✨ AI Match</span>

              <div className="landing-ai-jobs-ticker">
                <div className="landing-ai-ticker-track">
                  {tickerJobs.map((job, i) => (
                    <div key={`${job._id}-${i}`} className="landing-ai-mini-card">
                      <strong>{job.title}</strong>
                      <span>{job.company || "Company"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-jobs-section landing-reveal">
        <h2 className="landing-section-title">Fresh Opportunities Daily</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
          Discover new roles from top companies — use AI Match for personalized recommendations
        </p>

        {jobs.length === 0 ? (
          <p style={{ marginTop: "20px", color: "var(--text-muted)" }}>
            Loading jobs...
          </p>
        ) : (
          <div
            className="landing-jobs-scroll"
            onMouseEnter={(e) => {
              const track = e.currentTarget.querySelector(".landing-jobs-track");
              if (track) track.style.animationPlayState = "paused";
            }}
            onMouseLeave={(e) => {
              const track = e.currentTarget.querySelector(".landing-jobs-track");
              if (track) track.style.animationPlayState = "running";
            }}
          >
            <div className="landing-jobs-track">
              {repeatedJobs.map((job, i) => (
                <div
                  key={`${job._id}-${i}`}
                  className="landing-job-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate("/login")}
                  onKeyDown={(e) =>
                    e.key === "Enter" && navigate("/login")
                  }
                >
                  <h3>{job.title}</h3>
                  <p>{job.company}</p>
                  <p>{job.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="landing-how-section landing-reveal">
        <h2 className="landing-section-title">How It Works</h2>
        <div className="landing-how-grid">
          {[
            { step: "1. Create Account", desc: "Sign up as seeker or employer" },
            { step: "2. Resume + Profile", desc: "Build or upload your resume" },
            { step: "3. AI Match & Apply", desc: "Find fits and apply fast" },
          ].map((item) => (
            <div key={item.step} className="landing-how-card">
              <h3>{item.step}</h3>
              <p style={{ color: "var(--text-muted)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <h2>Start Your Journey Today</h2>
        <p>Join InternWorld and unlock opportunities</p>
        <button
          type="button"
          className="landing-cta-btn"
          onClick={() => navigate("/register")}
        >
          Get Started
        </button>
      </section>

      <footer className="landing-footer">
        © 2026 InternWorld. All rights reserved.
      </footer>
    </div>
  );
}

export default Landing;

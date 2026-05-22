import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/common/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Jobs from "./pages/user/Jobs";
import JobDetails from "./pages/user/JobDetails";
import AppliedJobs from "./pages/user/AppliedJobs";
import Profile from "./pages/user/Profile";
import ResumeBuilder from "./pages/user/ResumeBuilder";


import Dashboard from "./pages/employer/Dashboard";
import PostJob from "./pages/employer/PostJob";
import Applications from "./pages/employer/Applications";

function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--toast-bg)",
          color: "var(--toast-text)",
          borderRadius: "10px",
          fontSize: "14px",
          border: "1px solid var(--border)",
        },
      }}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppToaster />

      <Navbar />

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER ROUTES */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute role="user">
              <Jobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute role="user">
              <JobDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applied"
          element={
            <ProtectedRoute role="user">
              <AppliedJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute role="user">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume-builder"
          element={
            <ProtectedRoute role="user">
              <ResumeBuilder />
            </ProtectedRoute>
          }
        />


        {/* EMPLOYER ROUTES */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute role="employer">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute role="employer">
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute role="employer">
              <Applications />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
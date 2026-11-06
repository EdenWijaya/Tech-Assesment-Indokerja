import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages (akan kita buat nanti satu per satu)
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import JobListPage from "./pages/seeker/JobListPage";
import JobDetailPage from "./pages/seeker/JobDetailPage";
import MyApplicationsPage from "./pages/seeker/MyApplicationsPage";
import CreateJobPage from "./pages/company/CreateJobPage";
import CompanyJobsPage from "./pages/company/CompanyJobsPage";
import ApplicantsPage from "./pages/company/ApplicantsPage";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }: { children: ReactElement; allowedRole?: string }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === "COMPANY" ? "/company/jobs" : "/"} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />

      {/* Job Seeker */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRole="JOB_SEEKER">
            <JobListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute allowedRole="JOB_SEEKER">
            <JobDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-applications"
        element={
          <ProtectedRoute allowedRole="JOB_SEEKER">
            <MyApplicationsPage />
          </ProtectedRoute>
        }
      />

      {/* Company */}
      <Route
        path="/company/jobs"
        element={
          <ProtectedRoute allowedRole="COMPANY">
            <CompanyJobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/jobs/create"
        element={
          <ProtectedRoute allowedRole="COMPANY">
            <CreateJobPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/jobs/:jobId/applicants"
        element={
          <ProtectedRoute allowedRole="COMPANY">
            <ApplicantsPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated && user?.role === "COMPANY" ? "/company/jobs" : "/"} replace />}
      />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

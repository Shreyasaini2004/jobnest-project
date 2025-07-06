import { Toaster } from "@/components/ui/sonner"; // ✅ Use only one toaster
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ApplyPage from "@/pages/ApplyPage";
import Index from "./pages/Index";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { UserProvider } from "./contexts/UserContext";
import { EventProvider } from "./contexts/EventContext";
import { SavedJobsProvider } from "./contexts/SavedJobsContext";
import { ATSAnalysisProvider } from "./contexts/ATSAnalysisContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import JobApplicationPage from "./components/JobApplicationPage";

const App = () => (
  <ErrorBoundary>
    <UserProvider>
      <EventProvider>
        <SavedJobsProvider>
          <ATSAnalysisProvider>
            <TooltipProvider>
              <Toaster position="top-right" richColors /> {/* ✅ Corrected */}
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<JobSeekerDashboard />} />
                  <Route path="/employer-dashboard" element={<EmployerDashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/apply/:jobId" element={<ApplyPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/job-seeker-dashboard" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ATSAnalysisProvider>
        </SavedJobsProvider>
      </EventProvider>
    </UserProvider>
  </ErrorBoundary>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Index from "./pages/Index";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import SearchResults from "./pages/SearchResults";
import JobDetails from "./pages/JobDetails";
import EmployerProfile from "./pages/EmployerProfile";
import EmployerSettings from "./pages/EmployerSettings";
import ChatWrapper from "./components/ChatWrapper";
import ChatApplication from "./components/ChatApplication";

import { UserProvider } from "./contexts/UserContext";
import { EventProvider } from "./contexts/EventContext";
import { SavedJobsProvider } from "./contexts/SavedJobsContext";
import { ATSAnalysisProvider } from "./contexts/ATSAnalysisContext";

import ErrorBoundary from "./components/ErrorBoundary";

const App = () => (
  <ErrorBoundary>
    <UserProvider>
      <EventProvider>
        <SavedJobsProvider>
          <ATSAnalysisProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<JobSeekerDashboard />} />
                  <Route path="/employer-dashboard" element={<EmployerDashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/employer-profile" element={<EmployerProfile />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/employer-settings" element={<EmployerSettings />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/jobs/:jobId" element={<JobDetails />} />
                  <Route path="/chat" element={<ChatWrapper />} />
                  <Route path="/chatapp" element={<ChatApplication />} />
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

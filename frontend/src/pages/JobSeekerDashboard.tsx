import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import JobSeekerSidebar from "@/components/JobSeekerSidebar";
import JobSeekerContent from "@/components/JobSeekerContents";
import JobSeekerHeader from "@/components/JobSeekerHeader";
import { useLocation } from "react-router-dom";

const JobSeekerDashboard = () => {
  const [activeSection, setActiveSection] = useState<'dashboard-home' | 'view-openings' | 'update-details' | 'manage-applications' | 'saved-jobs' | 'ats-score' | 'saved-analyses'>('dashboard-home');
  const location = useLocation();
  
  useEffect(() => {
    // Get section from URL query parameter
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    
    // Only update if section is valid and different from current
    if (section && [
      'dashboard-home',
      'view-openings',
      'update-details',
      'manage-applications',
      'saved-jobs',
      'ats-score',
      'saved-analyses'
    ].includes(section as any)) {
      setActiveSection(section as any);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <JobSeekerSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          <div className="flex-1 flex flex-col">
            <JobSeekerHeader />
            <JobSeekerContent activeSection={activeSection} />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default JobSeekerDashboard;

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import JobSeekerSidebar from "@/components/JobSeekerSidebar";
import JobSeekerContent from "@/components/JobSeekerContents";
import JobSeekerHeader from "@/components/JobSeekerHeader";

const JobSeekerDashboard = () => {
  const [activeSection, setActiveSection] = useState<'view-openings' | 'update-details' | 'manage-applications' | 'saved-jobs' | 'ats-score' | 'saved-analyses'>('view-openings');

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

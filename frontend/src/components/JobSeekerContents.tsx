import UpdateDetailsForm from "@/components/UpdateDetailsForm";
import ViewOpenings from "@/components/ViewOpenings";
import ManageApplications from "@/components/ManageApplications";
import SavedJobs from "@/components/SavedJobs";
import ATSScoreAnalysis from "./ATSScoreAnalysis";
import SavedATSAnalyses from "./SavedATSAnalyses";
import DashboardHome from "./DashboardHome";
import JobSeekerCalendar from "./JobSeekerCalendar";
import JobSeekerNotifications from "./JobSeekerNotifications";
import JobSeekerSupport from "./JobSeekerSupport";

interface JobSeekerContentProps {
  activeSection:
    | 'dashboard-home'
    | 'update-details'
    | 'view-openings'
    | 'manage-applications'
    | 'saved-jobs'
    | 'ats-score'
    | 'saved-analyses'
    | 'calendar'
    | 'notifications'
    | 'support';
}

const JobSeekerContent = ({ activeSection }: JobSeekerContentProps) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard-home':
        return <DashboardHome />;
      case 'update-details':
        return <UpdateDetailsForm />;
      case 'view-openings':
        return <ViewOpenings />;
      case 'saved-jobs':
        return <SavedJobs />;
      case 'manage-applications':
        return <ManageApplications />;
      case 'ats-score':
        return <ATSScoreAnalysis />;
      case 'saved-analyses':
        return <SavedATSAnalyses />;
      case 'calendar':
        return <JobSeekerCalendar />;
      case 'notifications':
        return <JobSeekerNotifications />;
      case 'support':
        return <JobSeekerSupport />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <main className="flex-1 p-6 bg-background">
      {renderContent()}
    </main>
  );
};

export default JobSeekerContent;

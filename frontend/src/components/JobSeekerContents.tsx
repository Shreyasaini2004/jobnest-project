import UpdateDetailsForm from "@/components/UpdateDetailsForm";
import ViewOpenings from "@/components/ViewOpenings";
import ManageApplications from "@/components/ManageApplications";
import SavedJobs from "@/components/SavedJobs";
import ATSScoreAnalysis from "./ATSScoreAnalysis";
import SavedATSAnalyses from "./SavedATSAnalyses";

interface JobSeekerContentProps {
  activeSection: 'update-details' | 'view-openings' | 'manage-applications' | 'saved-jobs' | 'ats-score' | 'saved-analyses';
}

const JobSeekerContent = ({ activeSection }: JobSeekerContentProps) => {
  const renderContent = () => {
    switch (activeSection) {
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
      default:
        return <UpdateDetailsForm />;
    }
  };

  return (
    <main className="flex-1 p-6 bg-background">
      {renderContent()}
    </main>
  );
};

export default JobSeekerContent;

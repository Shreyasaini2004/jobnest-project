import { Button } from "@/components/ui/button";

interface SavedJobsEmptyStateProps {
  showRemindersOnly: boolean;
}

const SavedJobsEmptyState = ({ showRemindersOnly }: SavedJobsEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No saved jobs found</h3>
      <p className="text-muted-foreground mb-6">
        {showRemindersOnly 
          ? "You don't have any jobs with reminders set. Try turning off the reminder filter."
          : "Start bookmarking jobs you're interested in to see them here."}
      </p>
      <Button className="bg-job-primary hover:bg-job-primary/90">
        Browse Jobs
      </Button>
    </div>
  );
};

export default SavedJobsEmptyState;
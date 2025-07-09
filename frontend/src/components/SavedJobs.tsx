import { useState, useMemo } from "react";
import { Filter, Loader2, AlertCircle } from "lucide-react";
import { useSavedJobs } from "@/contexts/SavedJobsContext";
import SavedJobFilters from "./SavedJobFilters";
import UpcomingDeadlines from "./UpcomingDeadlines";
import SavedJobCard from "./SavedJobCard";
import SavedJobsEmptyState from "./SavedJobsEmptyState";
import ErrorBoundary from "./ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { applicationApi } from "@/lib/applicationApi";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const SavedJobs = () => {
  const { savedJobs, removeJob, toggleReminder } = useSavedJobs();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showRemindersOnly, setShowRemindersOnly] = useState(false);

  // Filter jobs based on search term, job type, and reminders filter
  const filteredJobs = useMemo(() => {
    return savedJobs.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || job.type.toLowerCase() === filterType.toLowerCase();
      const matchesReminder = !showRemindersOnly || job.reminderSet;
      
      return matchesSearch && matchesType && matchesReminder;
    });
  }, [savedJobs, searchTerm, filterType, showRemindersOnly]);

  // Get upcoming deadlines (jobs with reminders set and deadlines in the future)
  const upcomingDeadlines = useMemo(() => {
    return savedJobs
      .filter(job => job.reminderSet && job.deadline && job.deadline > new Date())
      .sort((a, b) => {
        if (a.deadline && b.deadline) {
          return a.deadline.getTime() - b.deadline.getTime();
        }
        return 0;
      })
      .slice(0, 3); // Show only the 3 most imminent deadlines
  }, [savedJobs]);

  const handleApply = async (jobId) => {
    if (!user || !user._id) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply for jobs",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Check if already applied
      const hasApplied = await applicationApi.checkJobApplication(jobId, user._id);
      
      if (hasApplied) {
        toast({
          title: "Already applied",
          description: "You have already applied for this job",
          variant: "default"
        });
        return;
      }
      
      // Navigate to job application page
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      console.error('Error checking application status:', error);
      // Navigate anyway if check fails
      navigate(`/jobs/${jobId}`);
    }
  };

  const handleToggleReminder = (jobId: string, deadline?: Date) => {
    toggleReminder(jobId, deadline);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-job-primary/10 to-job-accent/10 rounded-xl p-8 border border-job-primary/20">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            🔖 Your Saved Jobs
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Keep track of interesting opportunities and never miss application deadlines with reminders.
          </p>
        </div>

        {/* Upcoming Deadlines Section */}
        <UpcomingDeadlines upcomingDeadlines={upcomingDeadlines} />

        {/* Search and Filter Section */}
        <SavedJobFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          showRemindersOnly={showRemindersOnly}
          setShowRemindersOnly={setShowRemindersOnly}
        />

      {/* Results Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          {filteredJobs.length} Saved Job{filteredJobs.length !== 1 ? 's' : ''}
        </h2>
        <div className="flex items-center text-muted-foreground">
          <Filter className="h-4 w-4 mr-2" />
          <span className="text-sm">Showing bookmarked opportunities</span>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <SavedJobCard 
            key={job.id} 
            job={job} 
            removeJob={removeJob} 
            toggleReminder={handleToggleReminder}
            onApply={handleApply}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <SavedJobsEmptyState showRemindersOnly={showRemindersOnly} />
      )}
      </div>
    </ErrorBoundary>
  );
};

export default SavedJobs;
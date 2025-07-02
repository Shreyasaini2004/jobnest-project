import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedJobs } from "@/contexts/SavedJobsContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Job } from "@/contexts/SavedJobsContext";

interface BookmarkButtonProps {
  job: Job;
}

const BookmarkButton = ({ job }: BookmarkButtonProps) => {
  const { saveJob, removeJob, isJobSaved } = useSavedJobs();
  const saved = isJobSaved(job.id);

  const handleBookmark = () => {
    if (saved) {
      removeJob(job.id);
    } else {
      saveJob({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salary: job.salary,
        posted: job.posted || '',
        description: job.description,
        skills: job.skills || [],
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full hover:bg-job-primary/10 hover:text-job-primary"
            onClick={handleBookmark}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4 text-job-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{saved ? "Remove from saved jobs" : "Save this job"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BookmarkButton;
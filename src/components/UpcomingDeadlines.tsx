import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { Job } from "@/contexts/SavedJobsContext";

interface UpcomingDeadlinesProps {
  upcomingDeadlines: Job[];
}

const UpcomingDeadlines = ({ upcomingDeadlines }: UpcomingDeadlinesProps) => {
  if (upcomingDeadlines.length === 0) return null;
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-amber-800">Upcoming Deadlines</h2>
      </div>
      <div className="space-y-3">
        {upcomingDeadlines.map((job) => (
          <div key={job.id} className="flex justify-between items-center p-3 bg-white rounded-md border border-amber-100">
            <div>
              <p className="font-medium text-foreground">{job.title}</p>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-amber-700">
                  Deadline: {job.deadline ? format(job.deadline, 'MMM dd, yyyy') : 'Not set'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.deadline && new Date() < job.deadline ? 
                    `${Math.ceil((job.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left` : 
                    'Expired'}
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-job-primary/20 hover:bg-job-primary/5">
                Apply Now
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;
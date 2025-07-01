import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { MapPin, DollarSign, Clock, Bell, Calendar as CalendarIcon, ExternalLink, Trash2 } from "lucide-react";
import { Job } from "@/contexts/SavedJobsContext";

interface SavedJobCardProps {
  job: Job;
  removeJob: (id: string) => void;
  toggleReminder: (jobId: string, deadline?: Date) => void;
}

const SavedJobCard = ({ job, removeJob, toggleReminder }: SavedJobCardProps) => {
  const [selectedDeadline, setSelectedDeadline] = useState<Date | undefined>(undefined);
  const [isReminderPopoverOpen, setIsReminderPopoverOpen] = useState(false);

  const handleSetReminder = () => {
    if (selectedDeadline) {
      toggleReminder(job.id, selectedDeadline);
    }
    setIsReminderPopoverOpen(false);
    setSelectedDeadline(undefined);
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">{job.title}</h3>
            <p className="text-lg font-medium text-job-primary">{job.company}</p>
          </div>
          <div className="flex items-center gap-2">
            {job.reminderSet ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                <Bell className="h-3 w-3" />
                Reminder Set
              </Badge>
            ) : (
              <Popover 
                open={isReminderPopoverOpen} 
                onOpenChange={setIsReminderPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-amber-200 hover:bg-amber-50 text-amber-700">
                    <Bell className="h-3 w-3 mr-1" />
                    Set Reminder
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Set Application Deadline</h4>
                    <Calendar
                      mode="single"
                      selected={selectedDeadline}
                      onSelect={setSelectedDeadline}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsReminderPopoverOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleSetReminder}
                        disabled={!selectedDeadline}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => removeJob(job.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-job-primary" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-job-success" />
              <span className="font-medium">{job.salary}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Posted: {job.posted}</span>
            </div>
            {job.deadline && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-amber-500" />
                <span className={`font-medium ${new Date() > job.deadline ? 'text-red-500' : ''}`}>
                  Deadline: {format(job.deadline, 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {job.description}
          </p>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {job.skills && job.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <Badge variant="outline">
              {job.type}
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" className="border-job-primary/20 hover:bg-job-primary/5">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Details
              </Button>
              <Button className="bg-job-primary hover:bg-job-primary/90 text-white">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedJobCard;
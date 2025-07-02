import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Clock } from "lucide-react";
import BookmarkButton from "./BookmarkButton";
import { Job } from "@/contexts/SavedJobsContext";

interface JobListingCardProps {
  job: Job;
}

const JobListingCard = ({ job }: JobListingCardProps) => {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-3">
          <Badge 
            variant="outline" 
            className="bg-job-primary/10 text-job-primary border-job-primary/20"
          >
            {job.type}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {job.posted}
            </span>
            <BookmarkButton job={job} />
          </div>
        </div>
        <CardTitle className="text-xl mb-2 text-foreground hover:text-job-primary transition-colors">
          {job.title}
        </CardTitle>
        <p className="text-lg font-semibold text-job-primary">{job.company}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-job-primary" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-job-success" />
            <span className="font-medium">{job.salary}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {job.description}
        </p>
        
        <div className="flex gap-2 pt-2">
          <Button className="flex-1 bg-job-primary hover:bg-job-primary/90 text-white">
            Apply Now
          </Button>
          <Button variant="outline" className="border-job-primary/20 hover:bg-job-primary/5">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobListingCard;
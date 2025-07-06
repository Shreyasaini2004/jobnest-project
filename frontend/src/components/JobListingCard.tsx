import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Clock } from "lucide-react";
import BookmarkButton from "./BookmarkButton";
import { Job } from "@/contexts/SavedJobsContext";
import { useNavigate } from "react-router-dom";

interface JobListingCardProps {
  job: Job;
  isExpanded: boolean;
  onToggleDetails: () => void;
  onApply: () => void;
}

const JobListingCard = ({
  job,
  isExpanded,
  onToggleDetails,
  onApply,
}: JobListingCardProps) => {
  const navigate = useNavigate();

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

        <p
          className={`text-sm text-muted-foreground leading-relaxed ${
            isExpanded ? "" : "line-clamp-3"
          }`}
        >
          {job.description}
        </p>

        {isExpanded && (
          <div className="pt-2">
            <h4 className="text-sm font-semibold mb-1 text-foreground">Required Skills:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {job.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 bg-job-primary hover:bg-job-primary/90 text-white"
            onClick={onApply}
          >
            Apply Now
          </Button>
          <Button
            variant="outline"
            className="border-job-primary/20 hover:bg-job-primary/5"
            onClick={onToggleDetails}
          >
            {isExpanded ? "Hide Details" : "Details"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobListingCard;

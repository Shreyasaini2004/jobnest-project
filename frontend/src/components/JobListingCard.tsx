import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Clock, ArrowRight, Briefcase } from "lucide-react";
import BookmarkButton from "./BookmarkButton";
import { Job } from "@/contexts/SavedJobsContext";
import { useNavigate } from "react-router-dom";

interface JobListingCardProps {
  job: Job & { postedById?: string }; // Include postedById for job application
  isExpanded?: boolean;
  onToggleDetails?: () => void;
  onApply?: () => void;
}

const JobListingCard = ({ 
  job, 
  isExpanded = false,
  onToggleDetails = () => {},
  onApply
}: JobListingCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleApply = () => {
    if (!job.postedById) {
      console.error("⚠️ Missing postedById in job:", job);
      return;
    }

    navigate(`/apply/${job.id}`, {
      state: {
        jobTitle: job.title,
        companyName: job.company,
        postedBy: job.postedById, // ✅ crucial fix
      },
    });
  };

  return (
    <Card 
      className={`group overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-border/50 ${isHovered ? 'shadow-job-primary/10 border-job-primary/30' : 'shadow-lg'} flex flex-col h-full min-h-[370px]`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative top gradient bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r from-job-primary to-job-accent transform transition-all duration-500 ${isHovered ? 'scale-100' : 'scale-0'}`} />
      <CardHeader className="pb-3 relative overflow-hidden">
        {/* Background decoration */}
        <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full bg-job-primary/5 transition-all duration-500 ${isHovered ? 'opacity-100 scale-125' : 'opacity-0 scale-100'}`} />
        <div className={`absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-job-accent/5 transition-all duration-500 ${isHovered ? 'opacity-100 scale-125' : 'opacity-0 scale-100'}`} />
        <div className="flex justify-between items-start mb-3">
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 transition-all duration-300 ${isHovered ? 'bg-job-primary text-white' : 'bg-job-primary/10 text-job-primary border-job-primary/20'}`}
          >
            <Briefcase className="h-3 w-3" />
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
        <CardTitle className={`text-xl mb-2 transition-all duration-300 ${isHovered ? 'text-job-primary' : 'text-foreground'}`}>
          {job.title}
        </CardTitle>
        <p className="text-lg font-semibold text-job-primary relative z-10 transition-all duration-300 group-hover:translate-x-1">{job.company}</p>
      </CardHeader>

      <CardContent className="space-y-4 flex flex-col flex-1">
        <div className="space-y-2 text-sm text-muted-foreground transition-all duration-300 group-hover:translate-y-0.5">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-job-primary" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-job-success" />
            <span className="font-medium">{job.salary}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed transition-all duration-300 group-hover:text-foreground/80 flex-1">
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

        <div className="flex gap-2 pt-2 mt-auto transition-all duration-500 transform group-hover:translate-y-0.5">
          <Button 
            className="flex-1 bg-job-primary hover:bg-job-primary/90 text-white transition-all duration-300 hover:shadow-lg hover:shadow-job-primary/20 hover:-translate-y-0.5 group-hover:scale-[1.02]"
            onClick={onApply || handleApply}
          >
            Apply Now
          </Button>
          <Button 
            variant="outline" 
            className="border-job-primary/20 hover:bg-job-primary/5 transition-all duration-300 hover:border-job-primary/50 group-hover:scale-[1.02] flex items-center gap-1"
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            Details
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobListingCard;

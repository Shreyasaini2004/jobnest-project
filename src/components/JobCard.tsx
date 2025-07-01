import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedJobs } from "@/contexts/SavedJobsContext";
import { useState } from "react";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  description: string;
  skills: string[];
  featured?: boolean;
}

const JobCard = ({ 
  id,
  title, 
  company, 
  location, 
  salary, 
  type, 
  posted, 
  description, 
  skills, 
  featured = false 
}: JobCardProps) => {
  const { saveJob, removeJob, isJobSaved } = useSavedJobs();
  const [saved, setSaved] = useState(isJobSaved(id));

  const handleBookmark = () => {
    if (saved) {
      removeJob(id);
      setSaved(false);
    } else {
      saveJob({
        id,
        title,
        company,
        location,
        salary,
        type,
        posted,
        description,
        skills,
        featured
      });
      setSaved(true);
    }
  };
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${featured ? 'border-job-primary bg-gradient-to-r from-job-secondary/30 to-background' : ''}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-job-primary transition-colors">
                {title}
              </h3>
              {featured && (
                <Badge className="bg-job-accent text-white text-xs">Featured</Badge>
              )}
            </div>
            <p className="text-muted-foreground font-medium">{company}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`shrink-0 ${saved ? 'text-job-primary' : ''}`}
            onClick={handleBookmark}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>{salary}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{posted}</span>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{skills.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
          <Button className="bg-job-primary hover:bg-job-primary/90 text-white">
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
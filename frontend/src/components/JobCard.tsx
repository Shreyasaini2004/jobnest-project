import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Clock, Bookmark, BookmarkCheck, Briefcase, ArrowRight, Star, Loader2, CheckCircle } from "lucide-react";
import { useSavedJobs } from "@/contexts/SavedJobsContext";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { jobApi } from "@/lib/realApi";
import BookmarkButton from './BookmarkButton';

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
  postedById: string; // Required for job application
}

const JobCard = ({
  id,
  title, 
  company, 
  location: jobLocation,
  salary, 
  type, 
  posted, 
  description, 
  skills, 
  featured = false,
  postedById
}: JobCardProps) => {
  const { saveJob, removeJob, isJobSaved } = useSavedJobs();
  const [saved, setSaved] = useState(isJobSaved(id));
  const [isHovered, setIsHovered] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const location = useLocation();

  // Check if user has already applied to this job
  useEffect(() => {
    const checkApplication = async () => {
      if (user && user.userType === "job-seeker") {
        try {
          const { hasApplied: applied } = await jobApi.checkJobApplication(id, user._id);
          setHasApplied(applied);
        } catch (error) {
          console.error("Error checking application status:", error);
          // Fallback to localStorage if API call fails
          const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
          setHasApplied(appliedJobs.includes(id));
        }
      } else {
        // Fallback to localStorage for non-authenticated users or non-job-seekers
        const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        setHasApplied(appliedJobs.includes(id));
      }
    };
    
    checkApplication();
  }, [id, user]);

  const handleBookmark = () => {
    if (saved) {
      removeJob(id);
      setSaved(false);
      toast({
        title: "Job Removed",
        description: "Job has been removed from your saved jobs.",
        variant: "default",
      });
    } else {
      saveJob({
        id,
        title,
        company,
        location: jobLocation,
        salary,
        type,
        posted,
        description,
        skills,
        featured,
        postedById
      });
      setSaved(true);
      toast({
        title: "Job Saved",
        description: "Job has been added to your saved jobs.",
        variant: "default",
      });
    }
  };

  const handleApply = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to apply for jobs.",
        variant: "destructive",
      });
      // Save form state if present (example: localStorage.setItem(`pending-apply-${id}`, JSON.stringify(formState));)
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    
    if (user.userType !== "job-seeker") {
      toast({
        title: "Job Seeker Account Required",
        description: "You need a job seeker account to apply for jobs.",
        variant: "destructive",
      });
      return;
    }
    
    if (hasApplied) {
      navigate(`/jobs/${id}`);
      return;
    }

    // Navigate to the application form with job details
    navigate(`/apply/${id}`, {
      state: {
        jobTitle: title,
        companyName: company,
        postedBy: postedById,
      },
    });
  };

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden ${featured ? 'border-job-primary' : ''}`}
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        // Only navigate if the click is not on a button or link
        if ((e.target as HTMLElement).closest('button, a')) return;
        navigate(`/jobs/${id}`);
      }}
    >
      {/* Decorative top bar */}
      <div className={`absolute top-0 left-0 w-full h-1 ${featured ? 'bg-gradient-to-r from-job-primary via-job-accent to-job-primary' : 'bg-gradient-to-r from-job-secondary/50 via-job-accent/30 to-job-secondary/50'} transition-all duration-500 ${isHovered ? 'h-2' : 'h-1'}`}></div>
      
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${featured ? 'from-job-secondary/20 to-background/80' : 'from-background/50 to-background'} transition-opacity duration-300 z-0 ${isHovered ? 'opacity-100' : 'opacity-80'}`}></div>
      
      <CardContent className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <motion.h3 
                className="text-lg font-semibold text-foreground group-hover:text-job-primary transition-colors"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {title}
              </motion.h3>
              {featured && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ 
                    scale: isHovered ? 1.05 : 1, 
                    opacity: 1 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge className="bg-gradient-to-r from-job-primary to-job-accent text-white text-xs px-2 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </motion.div>
              )}
              {hasApplied && (
                <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                  Applied
                </Badge>
              )}
            </div>
            <motion.p 
              className="text-muted-foreground font-medium"
              animate={{ x: isHovered ? 2 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {company}
            </motion.p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookmarkButton job={{
              id,
              title,
              company,
              location: jobLocation,
              salary,
              type,
              posted,
              description,
              skills,
              featured,
              postedById
            }} />
          </motion.div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <motion.div 
            className="flex items-center gap-1 transition-colors duration-300 group-hover:text-job-primary/70"
            whileHover={{ scale: 1.05, x: 2 }}
          >
            <MapPin className="h-4 w-4 transition-transform duration-300 group-hover:text-job-primary" />
            <span>{jobLocation}</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-1 transition-colors duration-300 group-hover:text-job-primary/70"
            whileHover={{ scale: 1.05, x: 2 }}
          >
            <DollarSign className="h-4 w-4 transition-transform duration-300 group-hover:text-job-primary" />
            <span>{salary}</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-1 transition-colors duration-300 group-hover:text-job-primary/70"
            whileHover={{ scale: 1.05, x: 2 }}
          >
            <Clock className="h-4 w-4 transition-transform duration-300 group-hover:text-job-primary" />
            <span>{posted}</span>
          </motion.div>
        </div>

        <motion.p 
          className="text-muted-foreground text-sm mb-4 line-clamp-2 transition-all duration-300 group-hover:text-foreground/90"
          animate={{ opacity: isHovered ? 1 : 0.9 }}
          transition={{ duration: 0.3 }}
        >
          {description}
        </motion.p>

        <div className="flex flex-wrap gap-2 mb-4">
          {skills.slice(0, 3).map((skill, index) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0.8, y: 5 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: isHovered ? 1.05 : 1
              }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                scale: { duration: 0.2 }
              }}
            >
              <Badge 
                variant="secondary" 
                className="text-xs bg-job-secondary/30 hover:bg-job-secondary/50 transition-all duration-300 border border-transparent hover:border-job-primary/20"
              >
                {skill}
              </Badge>
            </motion.div>
          ))}
          {skills.length > 3 && (
            <motion.div
              initial={{ opacity: 0.8, y: 5 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: isHovered ? 1.05 : 1
              }}
              transition={{ 
                duration: 0.3, 
                delay: 0.3,
                scale: { duration: 0.2 }
              }}
            >
              <Badge 
                variant="outline" 
                className="text-xs hover:bg-job-primary/5 transition-all duration-300"
              >
                +{skills.length - 3} more
              </Badge>
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Badge 
              variant="outline" 
              className="text-xs border-job-primary/20 text-job-primary flex items-center gap-1 transition-all duration-300 hover:border-job-primary/40 hover:bg-job-primary/5"
            >
              <Briefcase className="h-3 w-3" />
              {type}
            </Badge>
          </motion.div>
          
          <div className="flex gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                variant="outline"
                className="text-job-primary border-job-primary/20 hover:bg-job-primary/10 hover:text-job-primary hover:border-job-primary/30 transition-all duration-300 group"
                onClick={() => navigate(`/jobs/${id}`)}
              >
                Details
                <ArrowRight className="h-3 w-3 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </motion.div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  className={`transition-all duration-300 relative overflow-hidden group ${
                    hasApplied 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-job-primary hover:bg-job-primary/90 text-white'
                  }`}
                  onClick={handleApply}
                  disabled={isApplying}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-job-primary via-white/20 to-job-primary bg-[length:200%] animate-shimmer opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    {isApplying ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Applying...
                      </>
                    ) : hasApplied ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        View Application
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Apply Now
                      </>
                    )}
                  </span>
                </Button>
              </TooltipTrigger>
              {!user && <TooltipContent>Please sign in to apply</TooltipContent>}
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;

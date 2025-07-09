import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { jobApi } from "@/lib/api";
import { Job } from "@/contexts/SavedJobsContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobApplicationForm from "@/components/JobApplicationForm";
import { useSavedJobs } from "@/contexts/SavedJobsContext";
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  Building, 
  Bookmark, 
  BookmarkCheck,
  Share2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Users,
  Star
} from "lucide-react";

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { saveJob, removeJob, isJobSaved } = useSavedJobs();
  const [saved, setSaved] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: { opacity: 0 }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      
      setIsLoading(true);
      setError(null);
      setIsVisible(false);
      
      try {
        const jobData = await jobApi.getJobById(jobId);
        if (jobData) {
          setJob(jobData);
          setSaved(isJobSaved(jobData.id));
          // Add a small delay to make the animation visible
          setTimeout(() => setIsVisible(true), 100);
        } else {
          setError("Job not found");
        }
      } catch (err) {
        setError("Failed to load job details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId, isJobSaved]);

  const handleBookmark = () => {
    if (!job) return;
    
    if (saved) {
      removeJob(job.id);
      setSaved(false);
    } else {
      saveJob(job);
      setSaved(true);
    }
  };

  const handleApply = () => {
    setShowApplicationForm(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div>
        <Header />
        <div className="container max-w-6xl mx-auto py-12 min-h-[70vh] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-4 border-job-primary border-t-transparent animate-spin mb-4"></div>
            <p className="text-muted-foreground animate-pulse">Loading job details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div>
        <Header />
        <div className="container max-w-6xl mx-auto py-12 min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground mb-6">{error || "Job not found"}</p>
            <Button onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div 
            className="container max-w-6xl mx-auto py-8 px-4 md:px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Back button and bookmark */}
            <motion.div 
              className="flex justify-between items-center mb-6"
              variants={itemVariants}
            >
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 hover:bg-job-primary/10 hover:text-job-primary transition-all duration-300"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full hover:bg-job-primary/10 hover:text-job-primary transition-all duration-300"
                  onClick={() => {
                    navigator.share({
                      title: job.title,
                      text: `Check out this job: ${job.title} at ${job.company}`,
                      url: window.location.href
                    }).catch(err => console.error('Error sharing', err));
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`rounded-full hover:bg-job-primary/10 ${saved ? 'text-job-primary border-job-primary/30' : ''} transition-all duration-300`}
                  onClick={handleBookmark}
                >
                  {saved ? 
                    <BookmarkCheck className="h-4 w-4" /> : 
                    <Bookmark className="h-4 w-4" />
                  }
                </Button>
              </div>
            </motion.div>
            
            {/* Job header */}
            <motion.div 
              className="bg-gradient-to-br from-job-primary/10 to-job-secondary/5 rounded-xl p-6 mb-8 relative overflow-hidden"
              variants={itemVariants}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-job-primary/20 to-transparent rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-job-secondary/20 to-transparent rounded-full -ml-32 -mb-32 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    {job.featured && (
                      <Badge className="bg-gradient-to-r from-job-primary to-job-accent text-white mb-3 px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
                    <div className="flex items-center text-lg font-medium text-job-primary">
                      <Building className="h-5 w-5 mr-2" />
                      {job.company}
                    </div>
                  </div>
                  
                  <div className="hidden md:block">
                    <Button 
                      className="bg-job-primary hover:bg-job-primary/90 text-white transition-all duration-300 relative overflow-hidden group"
                      onClick={handleApply}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-job-primary via-job-accent to-job-primary bg-[length:200%] animate-shimmer opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                      <span className="relative">Apply Now</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 text-job-primary" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2 text-job-success" />
                    <span className="font-medium">{job.salary}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 text-job-primary" />
                    <span>Posted {job.posted}</span>
                  </div>
                </div>
                
                <div className="mt-4 md:hidden">
                  <Button 
                    className="w-full bg-job-primary hover:bg-job-primary/90 text-white transition-all duration-300 relative overflow-hidden group"
                    onClick={handleApply}
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-job-primary via-job-accent to-job-primary bg-[length:200%] animate-shimmer opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                    <span className="relative">Apply Now</span>
                  </Button>
                </div>
              </div>
            </motion.div>
            
            {/* Job details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Tabs defaultValue="description" className="w-full">
                  <motion.div variants={itemVariants}>
                    <TabsList className="w-full mb-6 bg-muted/50">
                      <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                      <TabsTrigger value="requirements" className="flex-1">Requirements</TabsTrigger>
                      <TabsTrigger value="company" className="flex-1">Company</TabsTrigger>
                    </TabsList>
                  </motion.div>
                  
                  <TabsContent value="description">
                    <motion.div 
                      variants={itemVariants}
                      className="space-y-6"
                    >
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-4">Job Description</h3>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {job.description}
                          </p>
                          
                          <Separator className="my-6" />
                          
                          <h3 className="text-xl font-semibold mb-4">Required Skills</h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.map((skill) => (
                              <Badge 
                                key={skill} 
                                variant="secondary" 
                                className="text-sm bg-job-secondary/30 hover:bg-job-secondary/50 transition-all duration-300 border border-transparent hover:border-job-primary/20 px-3 py-1"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                  
                  <TabsContent value="requirements">
                    <motion.div 
                      variants={itemVariants}
                      className="space-y-6"
                    >
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-4">Job Requirements</h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 text-job-primary">
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium">Experience</h4>
                                <p className="text-muted-foreground">Minimum 3+ years of experience in similar role</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="mt-1 text-job-primary">
                                <GraduationCap className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium">Education</h4>
                                <p className="text-muted-foreground">Bachelor's degree in relevant field</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="mt-1 text-job-primary">
                                <Briefcase className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium">Job Type</h4>
                                <p className="text-muted-foreground">{job.type}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="mt-1 text-job-primary">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-medium">Start Date</h4>
                                <p className="text-muted-foreground">Immediate</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                  
                  <TabsContent value="company">
                    <motion.div 
                      variants={itemVariants}
                      className="space-y-6"
                    >
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-4">About {job.company}</h3>
                          
                          <p className="text-muted-foreground leading-relaxed mb-6">
                            {job.company} is a leading company in its industry, focused on innovation and growth.
                            We provide a collaborative work environment with opportunities for professional development.
                          </p>
                          
                          <div className="flex items-start gap-3 mb-4">
                            <div className="mt-1 text-job-primary">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">Company Size</h4>
                              <p className="text-muted-foreground">50-200 employees</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-job-primary">
                              <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">Headquarters</h4>
                              <p className="text-muted-foreground">{job.location}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div>
                <motion.div variants={itemVariants}>
                  <Card className="sticky top-6">
                    <CardContent className="p-6 space-y-6">
                      <h3 className="text-xl font-semibold">Job Summary</h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Job Type:</span>
                          <Badge variant="outline" className="font-medium">{job.type}</Badge>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{job.location}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Salary:</span>
                          <span className="font-medium text-job-success">{job.salary}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Posted:</span>
                          <span className="font-medium">{job.posted}</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-job-primary hover:bg-job-primary/90 text-white transition-all duration-300 relative overflow-hidden group"
                          onClick={handleApply}
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-job-primary via-job-accent to-job-primary bg-[length:200%] animate-shimmer opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                          <span className="relative">Apply Now</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="w-full border-job-primary/20 text-job-primary hover:bg-job-primary/10 hover:border-job-primary/30 transition-all duration-300"
                          onClick={handleBookmark}
                        >
                          {saved ? (
                            <>
                              <BookmarkCheck className="h-4 w-4 mr-2" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Bookmark className="h-4 w-4 mr-2" />
                              Save Job
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
            
            {/* Application form */}
            <AnimatePresence>
              {showApplicationForm && (
                <motion.div 
                  className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="w-full max-w-2xl overflow-y-auto max-h-[90vh]"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                  >
                    <JobApplicationForm 
                      jobId={job.id}
                      jobTitle={job.title}
                      companyName={job.company}
                      onSuccess={() => setShowApplicationForm(false)}
                      onCancel={() => setShowApplicationForm(false)}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default JobDetails;
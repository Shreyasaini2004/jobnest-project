import { useState, useMemo, useEffect } from "react";
import { Filter, Loader2 } from "lucide-react";
import { Job } from "@/contexts/SavedJobsContext";
import JobSearchFilters from "./JobSearchFilters";
import JobListingCard from "./JobListingCard";
import NoJobsFound from "./NoJobsFound";
import ErrorBoundary from "./ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";

interface BackendJob {
  _id: string;
  jobTitle: string;
  jobType: string;
  department?: string;
  location?: string;
  salaryRange?: string;
  experience?: string;
  deadline?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  registrationFee?: string;
  postedBy: {
    _id: string;
    companyName: string;
    companyEmail?: string;
    companyWebsite?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:5000/api';
console.log(API_BASE_URL)

const ViewOpenings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Added state for expand/collapse functionality
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const convertBackendJob = (backendJob: BackendJob): Job => {
    return {
      id: backendJob._id,
      title: backendJob.jobTitle,
      company: backendJob.postedBy.companyName,
      location: backendJob.location || "Location not specified",
      salary: backendJob.salaryRange || "Salary not specified",
      type: backendJob.jobType,
      posted: formatDate(backendJob.createdAt),
      description: backendJob.description || "No description provided",
      skills: extractSkills(backendJob.requirements || ""),
      featured: false, // You can add logic to determine featured jobs
    };
  };

  // Extract skills from requirements text (simple implementation)
  const extractSkills = (requirements: string): string[] => {
    if (!requirements) return [];
    
    // Common tech skills to look for
    const commonSkills = [
      'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++', 'C#',
      'Angular', 'Vue.js', 'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
      'AWS', 'Docker', 'Kubernetes', 'Git', 'Redux', 'GraphQL', 'REST', 'API',
      'Agile', 'Scrum', 'DevOps', 'CI/CD', 'Machine Learning', 'Data Science',
      'UI/UX', 'Figma', 'Adobe', 'Photoshop', 'Illustrator'
    ];
    
    const foundSkills = commonSkills.filter(skill => 
      requirements.toLowerCase().includes(skill.toLowerCase())
    );
    
    return foundSkills.slice(0, 5); // Limit to 5 skills
  };

  // Format date to human-readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Fetch all jobs from backend
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/jobs/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const backendJobs: BackendJob[] = await response.json();
      const convertedJobs = backendJobs.map(convertBackendJob);
      setJobs(convertedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  // Search jobs with filters
  const searchJobs = async (searchTerm: string, jobType: string, location: string) => {
    try {
      setIsSearching(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (jobType !== 'all') params.append('jobType', jobType);
      if (location !== 'all') params.append('location', location);
      
      const response = await fetch(`${API_BASE_URL}/jobs/search/filters?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const backendJobs: BackendJob[] = await response.json();
      const convertedJobs = backendJobs.map(convertBackendJob);
      setJobs(convertedJobs);
    } catch (err) {
      console.error('Error searching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to search jobs');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle expand/collapse toggle for job details
  const handleToggleJobDetails = (jobId: string) => {
    setExpandedJobId(prevId => prevId === jobId ? null : jobId);
  };

  // Handle job application
  const handleJobApplication = (jobId: string) => {
    // You can customize this based on your application flow
    const url = `/apply/${jobId}`;
    window.open(url, "_blank");
  };

  // Initial load
  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm || filterType !== 'all' || filterLocation !== 'all') {
        searchJobs(searchTerm, filterType, filterLocation);
      } else {
        fetchJobs();
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filterType, filterLocation]);

  // Reset expanded job when jobs change (after search/filter)
  useEffect(() => {
    setExpandedJobId(null);
  }, [jobs]);

  // Client-side filtering for immediate feedback (optional)
  const filteredJobs = useMemo(() => {
    if (isSearching) return jobs; // Don't filter while searching
    
    return jobs.filter(job => {
      const matchesSearch = searchTerm ? (
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) : true;
      
      const matchesType = filterType !== 'all' ? 
        job.type.toLowerCase() === filterType.toLowerCase() : true;
      
      const matchesLocation = filterLocation !== 'all' ? 
        job.location.toLowerCase().includes(filterLocation.toLowerCase()) : true;
      
      return matchesSearch && matchesType && matchesLocation;
    });
  }, [jobs, searchTerm, filterType, filterLocation, isSearching]);

  const handleRetry = () => {
    setError(null);
    fetchJobs();
  };

  const displayedJobs = filteredJobs;
  const showLoading = isLoading || isSearching;

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-job-primary/10 to-job-accent/10 rounded-xl p-8 border border-job-primary/20">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            🌟 Discover Your Dream Job
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to your gateway to endless opportunities! Browse through carefully curated job openings 
            that match your skills and aspirations. Your next career milestone is just a click away.
          </p>
        </div>

        {/* Search and Filter Section */}
        <JobSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterLocation={filterLocation}
          setFilterLocation={setFilterLocation}
        />

        {/* Results Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">
            {showLoading ? (
              <span className="flex items-center">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {isSearching ? 'Searching...' : 'Loading jobs...'}
              </span>
            ) : (
              <>
                {displayedJobs.length} Job{displayedJobs.length !== 1 ? 's' : ''} Found
              </>
            )}
          </h2>
          <div className="flex items-center text-muted-foreground">
            <Filter className="h-4 w-4 mr-2" />
            <span className="text-sm">Showing relevant opportunities</span>
          </div>
        </div>

        {/* Jobs Grid */}
        <ErrorBoundary>
          {showLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-job-primary" />
              <span className="ml-3 text-lg">
                {isSearching ? 'Searching for jobs...' : 'Loading job opportunities...'}
              </span>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="my-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                <div className="mt-4">
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedJobs.map((job) => (
                  <JobListingCard 
                    key={job.id} 
                    job={job}
                    isExpanded={expandedJobId === job.id}
                    onToggleDetails={() => handleToggleJobDetails(job.id)}
                    onApply={() => handleJobApplication(job.id)}
                  />
                ))}
              </div>

              {displayedJobs.length === 0 && <NoJobsFound />}
            </>
          )}
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default ViewOpenings;
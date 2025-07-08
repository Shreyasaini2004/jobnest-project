import { useState, useMemo, useEffect } from "react";
import { Filter, Loader2 } from "lucide-react";
import { Job } from "@/contexts/SavedJobsContext";
import JobSearchFilters from "./JobSearchFilters";
import { useNavigate } from "react-router-dom";
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

const ViewOpenings = () => {
  const navigate = useNavigate();
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:5000/api';

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<BackendJob[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/jobs/all`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const backendJobs: BackendJob[] = await response.json();
      setJobs(backendJobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobApplication = (
    jobId: string,
    jobTitle: string,
    companyName: string,
    recruiterId: string
  ) => {
    navigate(`/apply/${jobId}`, {
      state: {
        jobTitle,
        companyName,
        postedBy: recruiterId,
      },
    });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchTerm ? (
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.postedBy?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') // Safe check
      ) : true;

      const matchesType = filterType !== 'all' ?
        job.jobType.toLowerCase() === filterType.toLowerCase() : true;

      const matchesLocation = filterLocation !== 'all' ?
        (job.location || '').toLowerCase().includes(filterLocation.toLowerCase()) : true;

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [jobs, searchTerm, filterType, filterLocation]);

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        <JobSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterLocation={filterLocation}
          setFilterLocation={setFilterLocation}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-job-primary" />
            <span className="ml-3 text-lg">Loading job opportunities...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="my-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobListingCard
                key={job._id}
                job={{
                  id: job._id,
                  title: job.jobTitle,
                  company: job.postedBy?.companyName || 'Unknown Company',
                  location: job.location || 'Not specified',
                  salary: job.salaryRange || 'Not specified',
                  type: job.jobType,
                  posted: new Date(job.createdAt).toDateString(),
                  description: job.description || '',
                  skills: [],
                  featured: false,
                  postedById: job.postedBy?._id || '',
                }}
                isExpanded={expandedJobId === job._id}
                onToggleDetails={() => setExpandedJobId(prev => prev === job._id ? null : job._id)}
                onApply={() =>
                  handleJobApplication(
                    job._id,
                    job.jobTitle,
                    job.postedBy?.companyName || 'Unknown Company',
                    job.postedBy?._id || ''
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ViewOpenings;

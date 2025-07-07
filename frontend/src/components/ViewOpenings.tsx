import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import JobSearchFilters from "./JobSearchFilters";
import JobListingCard from "./JobListingCard";
import NoJobsFound from "./NoJobsFound";
import ErrorBoundary from "./ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface Job {
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
  const { user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchUserAndJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Fetch full user info from DB
        const profileRes = await fetch(`${API_BASE_URL}/api/jobseeker/${user?._id}`);
        if (!profileRes.ok) throw new Error("Failed to fetch user profile");
        const profile = await profileRes.json();

        // 2. Check if user profile is incomplete
        const isIncomplete =
          !profile.skills || !profile.education || !profile.experience;

        if (isIncomplete) {
          setShowUpdatePrompt(true);

          // 3. Show all jobs
          const jobsRes = await fetch(`${API_BASE_URL}/api/jobs/all`);
          if (!jobsRes.ok) throw new Error("Failed to fetch all jobs");
          const allJobs = await jobsRes.json();
          setJobs(allJobs);
        } else {
          // 4. Profile is complete — show recommended jobs
          setShowUpdatePrompt(false);
          const recJobsRes = await fetch(
            `${API_BASE_URL}/api/recommendations/jobs-for-user/${user?._id}`
          );
          if (!recJobsRes.ok) throw new Error("Failed to fetch recommended jobs");
          const recJobs = await recJobsRes.json();
          setJobs(recJobs);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) fetchUserAndJobs();
  }, [user]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = searchTerm
        ? job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.postedBy?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesType =
        filterType !== "all"
          ? job.jobType.toLowerCase() === filterType.toLowerCase()
          : true;

      const matchesLocation =
        filterLocation !== "all"
          ? (job.location || "").toLowerCase().includes(filterLocation.toLowerCase())
          : true;

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [jobs, searchTerm, filterType, filterLocation]);

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {showUpdatePrompt && (
          <Alert variant="default" className="border-blue-500 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle>Complete your profile</AlertTitle>
            <AlertDescription>
              To get personalized job recommendations, please update your profile.
            </AlertDescription>
          </Alert>
        )}

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
        ) : filteredJobs.length === 0 ? (
          <NoJobsFound />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobListingCard
                key={job._id}
                job={{
                  id: job._id,
                  title: job.jobTitle,
                  company: job.postedBy?.companyName || "Unknown",
                  location: job.location || "Not specified",
                  salary: job.salaryRange || "Not specified",
                  type: job.jobType,
                  posted: new Date(job.createdAt).toDateString(),
                  description: job.description || "",
                  skills: [],
                  featured: false,
                  postedById: job.postedBy?._id,
                }}
                isExpanded={expandedJobId === job._id}
                onToggleDetails={() =>
                  setExpandedJobId((prev) => (prev === job._id ? null : job._id))
                }
                onApply={() => {
                  console.log("Navigating with:", {
                    jobId: job._id,
                    postedBy:
                      typeof job.postedBy === "string"
                        ? job.postedBy
                        : job.postedBy?._id || "❌ Missing",
                  });
                  navigate(`/apply/${job._id}`, {
                    state: {
                      jobTitle: job.jobTitle,
                      companyName: job.postedBy?.companyName || "Unknown",
                      postedBy:
                        typeof job.postedBy === "string"
                          ? job.postedBy
                          : job.postedBy?._id || "",
                    },
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ViewOpenings;

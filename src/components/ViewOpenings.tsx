import { useState, useMemo } from "react";
import { Filter, Loader2 } from "lucide-react";
import { Job } from "@/contexts/SavedJobsContext";
import JobSearchFilters from "./JobSearchFilters";
import JobListingCard from "./JobListingCard";
import NoJobsFound from "./NoJobsFound";
import ErrorBoundary from "./ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";

const ViewOpenings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock job data
  const mockJobs: Job[] = [
    {
      id: "job1",
      title: "Senior React Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      salary: "$120k - $160k",
      type: "Full-time",
      posted: "2 days ago",
      description: "Join our innovative team building next-generation web applications using React, TypeScript, and modern development practices.",
      skills: ["React", "TypeScript", "Redux", "Node.js", "GraphQL"],
      featured: true
    },
    {
      id: "job2",
      title: "UX/UI Designer",
      company: "DesignHub",
      location: "Remote",
      salary: "$90k - $120k",
      type: "Full-time",
      posted: "1 week ago",
      description: "Create beautiful, intuitive interfaces for web and mobile applications. Work with a collaborative team of designers and developers.",
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "UI Design"],
      featured: true
    },
    {
      id: "job3",
      title: "DevOps Engineer",
      company: "CloudSystems",
      location: "Chicago, IL",
      salary: "$110k - $140k",
      type: "Full-time",
      posted: "3 days ago",
      description: "Manage our cloud infrastructure and CI/CD pipelines. Implement automation and ensure high availability of our services.",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
      featured: true
    },
    {
      id: "job4",
      title: "Data Scientist",
      company: "AnalyticsPro",
      location: "Boston, MA",
      salary: "$130k - $170k",
      type: "Full-time",
      posted: "Just now",
      description: "Apply machine learning and statistical modeling to solve complex business problems. Work with large datasets and create actionable insights.",
      skills: ["Python", "Machine Learning", "SQL", "Data Visualization", "Statistics"],
      featured: false
    },
    {
      id: "job5",
      title: "Product Manager",
      company: "InnovateCo",
      location: "New York, NY",
      salary: "$115k - $150k",
      type: "Full-time",
      posted: "2 weeks ago",
      description: "Lead product development from conception to launch. Work with cross-functional teams to define product vision and roadmap.",
      skills: ["Product Strategy", "Agile", "User Stories", "Market Research", "Roadmapping"],
      featured: false
    },
    {
      id: "job6",
      title: "Backend Engineer",
      company: "ServerStack",
      location: "Seattle, WA",
      salary: "$125k - $155k",
      type: "Full-time",
      posted: "3 days ago",
      description: "Design and implement scalable backend services. Work with databases, APIs, and server-side technologies.",
      skills: ["Java", "Spring Boot", "PostgreSQL", "RESTful APIs", "Microservices"],
      featured: false
    },
    {
      id: "job7",
      title: "Frontend Developer",
      company: "WebWorks",
      location: "Austin, TX",
      salary: "$90k - $120k",
      type: "Contract",
      posted: "1 week ago",
      description: "Create responsive and interactive user interfaces using modern frontend technologies.",
      skills: ["JavaScript", "React", "CSS", "HTML", "Responsive Design"],
      featured: false
    },
    {
      id: "job8",
      title: "Mobile App Developer",
      company: "AppGenius",
      location: "Remote",
      salary: "$100k - $130k",
      type: "Part-time",
      posted: "5 days ago",
      description: "Develop native mobile applications for iOS and Android platforms. Focus on performance and user experience.",
      skills: ["Swift", "Kotlin", "Mobile UI Design", "API Integration", "App Store Deployment"],
      featured: false
    },
  ];

  // Filter jobs based on search parameters
  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => {
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
  }, [searchTerm, filterType, filterLocation]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(false);
  };

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
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Loading jobs...
            </span>
          ) : (
            <>
              {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
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
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-job-primary" />
            <span className="ml-3 text-lg">Loading job opportunities...</span>
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
              {filteredJobs.map((job) => (
                <JobListingCard key={job.id} job={job} />
              ))}
            </div>

            {filteredJobs.length === 0 && <NoJobsFound />}
          </>
        )}
      </ErrorBoundary>
    </div>
    </ErrorBoundary>
  );
};

export default ViewOpenings;

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, SlidersHorizontal, Search, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobSearchFilters from "@/components/JobSearchFilters";
import JobListingCard from "@/components/JobListingCard";
import NoJobsFound from "@/components/NoJobsFound";
import { Button } from "@/components/ui/button";
import { jobApi } from "@/lib/api";
import { Job } from "@/contexts/SavedJobsContext";
import { motion, AnimatePresence, Variants } from "framer-motion";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  
  // Staggered animation for elements
  const staggerDelay = 0.1;
  
  // Get search parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [filterType, setFilterType] = useState(searchParams.get("type") || "all");
  const [filterLocation, setFilterLocation] = useState(searchParams.get("location") || "all");
  const [shouldFetchJobs, setShouldFetchJobs] = useState(true);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (filterType !== "all") params.set("type", filterType);
    if (filterLocation !== "all") params.set("location", filterLocation);
    
    navigate({
      pathname: "/search",
      search: params.toString()
    }, { replace: true });
    
    // Set flag to fetch jobs after URL update
    setShouldFetchJobs(true);
  }, [searchTerm, filterType, filterLocation, navigate]);

  // Fetch jobs based on search parameters
  useEffect(() => {
    // Only fetch if the shouldFetchJobs flag is true
    if (!shouldFetchJobs) return;
    
    let isMounted = true;
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      setIsVisible(false); // Reset visibility for animation
      
      // Add a small delay to make loading state visible
      const timeoutId = setTimeout(async () => {
        try {
          const featuredParam = searchParams.get("featured") || "";
          let results = await jobApi.searchJobs(searchTerm, filterType, filterLocation);
          
          // Filter for featured jobs if the parameter is present
          if (featuredParam === "true") {
            results = results.filter(job => job.featured === true);
          }
          
          if (isMounted) {
            setJobs(results);
            setIsLoading(false);
            // Trigger animation after data is loaded
            setTimeout(() => setIsVisible(true), 100);
            // Reset the fetch flag
            setShouldFetchJobs(false);
          }
        } catch (err) {
          console.error("Error fetching jobs:", err);
          if (isMounted) {
            setError("Failed to load job listings. Please try again later.");
            setIsLoading(false);
            // Reset the fetch flag even on error
            setShouldFetchJobs(false);
          }
        }
      }, 600); // Small delay for better UX
      
      return () => {
        clearTimeout(timeoutId);
      };
    };
    
    fetchJobs();
    
    return () => {
      isMounted = false;
    };
  }, [searchTerm, filterType, filterLocation, shouldFetchJobs, searchParams]);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <motion.main 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div 
          className="max-w-7xl mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Page Title */}
          <motion.div 
            className="bg-gradient-to-r from-job-primary/10 to-job-accent/10 rounded-xl p-8 border border-job-primary/20 relative overflow-hidden"
            variants={itemVariants}
          >
            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-job-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-job-accent/10 rounded-full blur-lg"></div>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: staggerDelay }}
              className="relative z-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-6 w-6 text-job-primary animate-pulse" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-job-primary to-job-accent bg-clip-text text-transparent">
                  Job Search Results
                </h1>
              </div>
              
              <motion.p 
                className="text-lg text-muted-foreground leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: staggerDelay * 2 }}
              >
                {isLoading ? (
                  "Finding the perfect opportunities for you..."
                ) : (
                  `Found ${jobs.length} job${jobs.length !== 1 ? "s" : ""} matching your search criteria.`
                )}
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Search Filters */}
          <motion.div
            variants={itemVariants}
          >
            <JobSearchFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              filterLocation={filterLocation}
              setFilterLocation={setFilterLocation}
            />
          </motion.div>

          {/* Results */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            {isLoading ? (
              <motion.div 
                className="flex justify-center items-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-job-primary/5 animate-pulse"></div>
                  <Loader2 className="h-8 w-8 animate-spin text-job-primary relative z-10" />
                </div>
                <span className="ml-3 text-lg bg-gradient-to-r from-job-primary to-job-accent bg-clip-text text-transparent font-medium">Searching for jobs...</span>
              </motion.div>
            ) : error ? (
              <motion.div 
                className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-red-800 mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="group"
                >
                  <Loader2 className="h-4 w-4 mr-2 group-hover:animate-spin" />
                  Try Again
                </Button>
              </motion.div>
            ) : (
              <>
                {jobs.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                  >
                    <AnimatePresence>
                      {jobs.map((job, index) => (
                        <motion.div 
                          key={job.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                        >
                          <JobListingCard job={job} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <NoJobsFound />
                  </motion.div>
                )}
              </>
            )}
          </motion.div>

          {/* Back to Home */}
          <motion.div 
            className="text-center pt-8"
            variants={itemVariants}
          >
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="rounded-full group px-6 border-job-primary/20 text-job-primary hover:bg-job-primary/10 hover:text-job-primary hover:border-job-primary/30 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Button>
          </motion.div>
        </motion.div>
      </motion.main>
      <Footer />
    </motion.div>
  );
};

export default SearchResults;
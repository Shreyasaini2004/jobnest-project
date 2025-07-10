import JobCard from "./JobCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Star, TrendingUp, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Variants } from "framer-motion";
import { jobApi } from "@/lib/realApi";
import { Job } from "@/contexts/SavedJobsContext";

const FeaturedJobs = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true);
        const jobs = await jobApi.getFeaturedJobs();
        setFeaturedJobs(jobs);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured jobs:', err);
        setError('Failed to load featured jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);
  
  // Fallback data in case API fails
  const fallbackJobs = [
    {
      id: "job1",
      title: "Senior React Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      salary: "$120k - $160k",
      type: "Full Time",
      posted: "2 days ago",
      description: "Join our innovative team building next-generation web applications using React, TypeScript, and modern development practices. Work on challenging projects that impact millions of users.",
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
      featured: true
    },
    {
      id: "job2",
      title: "Product Manager",
      company: "StartupXYZ",
      location: "Remote",
      salary: "$100k - $140k",
      type: "Full Time",
      posted: "1 day ago",
      description: "Lead product strategy and development for our cutting-edge SaaS platform. Collaborate with engineering, design, and stakeholders to deliver exceptional user experiences.",
      skills: ["Product Strategy", "Analytics", "Agile", "Figma"],
      featured: true
    },
    {
      id: "job3",
      title: "UX/UI Designer",
      company: "DesignStudio",
      location: "New York, NY",
      salary: "$85k - $110k",
      type: "Full Time",
      posted: "3 days ago",
      description: "Create beautiful, intuitive user experiences for web and mobile applications. Work closely with product and engineering teams to bring designs to life.",
      skills: ["Figma", "Sketch", "Prototyping", "User Research"],
      featured: true
    },
    {
      id: "job4",
      title: "Data Scientist",
      company: "DataCorp",
      location: "Seattle, WA",
      salary: "$110k - $150k",
      type: "Full Time",
      posted: "4 days ago",
      description: "Apply machine learning and statistical analysis to solve complex business problems. Work with large datasets to drive data-driven decision making.",
      skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
      featured: true
    },
    {
      id: "job5",
      title: "DevOps Engineer",
      company: "CloudTech",
      location: "Austin, TX",
      salary: "$105k - $135k",
      type: "Full Time",
      posted: "5 days ago",
      description: "Build and maintain scalable infrastructure using cloud technologies. Implement CI/CD pipelines and ensure high availability of our services.",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
      featured: true
    },
    {
      id: "job6",
      title: "Marketing Manager",
      company: "GrowthCo",
      location: "Los Angeles, CA",
      salary: "$75k - $95k",
      type: "Full Time",
      posted: "1 week ago",
      description: "Drive marketing initiatives to increase brand awareness and customer acquisition. Develop and execute comprehensive marketing strategies across multiple channels.",
      skills: ["Digital Marketing", "Analytics", "Content Strategy", "SEO"],
      featured: true
    }
  ];

  return (
    <motion.section 
      className="py-16 bg-gradient-to-br from-job-secondary/20 to-background relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-job-primary/30 via-job-accent/30 to-job-primary/30"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-job-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-job-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-job-primary to-job-accent opacity-30 blur-sm animate-pulse"></div>
                <Star className="h-6 w-6 text-job-primary relative z-10" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-job-primary to-job-accent bg-clip-text text-transparent">
                Featured Jobs
              </h2>
            </div>
            <motion.p 
              className="text-lg text-muted-foreground pl-9"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Hand-picked opportunities from top companies.
            </motion.p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button 
              variant="outline" 
              className="hidden md:flex items-center gap-2 border-job-primary/20 text-job-primary hover:bg-job-primary/10 hover:text-job-primary hover:border-job-primary/30 transition-all duration-300 group"
              onClick={() => navigate('/search')}
              onMouseEnter={() => setHoveredButton(1)}
              onMouseLeave={() => setHoveredButton(null)}
            >
              View All Jobs
              <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${hoveredButton === 1 ? 'translate-x-1' : ''}`} />
            </Button>
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 text-job-primary animate-spin" />
            <span className="ml-4 text-lg text-muted-foreground">Loading featured jobs...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-lg text-red-500 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mx-auto"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            {featuredJobs.length > 0 ? featuredJobs.map((job, index) => (
              <motion.div 
                key={job.id}
                variants={itemVariants}
                custom={index}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="h-full flex"
              >
                <JobCard
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  salary={job.salary}
                  type={job.type}
                  posted={job.posted}
                  description={job.description}
                  skills={job.skills}
                  featured={job.featured}
                  postedById={job.postedById || job.id}
                />
              </motion.div>
            )) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-lg text-muted-foreground mb-4">No featured jobs available at the moment.</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/search')}
                  className="mx-auto"
                >
                  View All Jobs
                </Button>
              </div>
            )}
          </motion.div>
        )}

        <motion.div 
          className="text-center mt-12"
          variants={itemVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          transition={{ delay: 0.6 }}
        >
          <Button 
            className="bg-job-primary hover:bg-job-primary/90 text-white px-8 py-6 rounded-xl group relative overflow-hidden"
            onClick={() => navigate('/search?featured=true')}
            onMouseEnter={() => setHoveredButton(2)}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-job-primary via-job-accent to-job-primary bg-[length:200%] animate-shimmer opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            <span className="relative flex items-center">
              <TrendingUp className={`h-5 w-5 mr-2 transition-transform duration-300 ${hoveredButton === 2 ? 'scale-125' : ''}`} />
              View All Featured Jobs
              <ArrowRight className={`h-4 w-4 ml-2 transition-transform duration-300 ${hoveredButton === 2 ? 'translate-x-1' : ''}`} />
            </span>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturedJobs;
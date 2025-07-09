import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, Sparkles, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchFocused, setSearchFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("all");
  const [activePopularTerm, setActivePopularTerm] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Staggered animation for elements
  const staggerDelay = 0.1;

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);
  
  // Particle effect elements
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  const companies = [
    "Microsoft", "Google", "Amazon", "Meta", "Apple", "Netflix", "Airbnb"
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim() && !location.trim() && jobType === "all") {
      toast({
        title: "Search Required",
        description: "Please enter a job title, location, or select a job type to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append("q", searchTerm.trim());
    if (location.trim()) params.append("location", location.trim());
    if (jobType !== "all") params.append("type", jobType);

    // Add a small animation before navigating
    setSearchFocused(true);
    
    toast({
      title: "Searching...",
      description: "Finding the best opportunities for you.",
      variant: "default",
    });
    
    setTimeout(() => {
      navigate(`/search?${params.toString()}`);
      setIsSearching(false);
    }, 300);
  };

  const handlePopularSearch = async (term: string, index: number) => {
    setActivePopularTerm(index);
    setSearchTerm(term);
    
    // Focus the search input with the term
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    
    setIsSearching(true);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Navigate after a short delay for animation
    setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(term)}`);
      setActivePopularTerm(null);
      setIsSearching(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-job-primary/10 via-job-primary/5 to-background pt-20 pb-16 md:pt-24 md:pb-20 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div 
            key={particle.id}
            className="absolute rounded-full bg-job-primary/10 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              opacity: 0.2 + Math.random() * 0.3,
            }}
          />
        ))}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-job-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-64 h-64 bg-job-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.7, delay: staggerDelay, ease: "easeOut" }}
              className="flex justify-center mb-6"
            >
              <Badge variant="outline" className="px-4 py-1 bg-job-secondary/20 text-job-primary border-job-primary/20 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI-Powered Job Matching</span>
              </Badge>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.7, delay: staggerDelay * 2, ease: "easeOut" }}
              className="text-4xl md:text-7xl font-bold text-center text-foreground mb-6 leading-tight"
            >
              Find Your Dream
              <span className="bg-gradient-to-r from-job-primary to-job-accent bg-clip-text text-transparent"> Career</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.7, delay: staggerDelay * 3, ease: "easeOut" }}
              className="text-lg md:text-xl text-center text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Connect with top companies and discover opportunities that match your skills and passion. Your next career move starts here.
            </motion.p>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
                <span>10,000+ Jobs</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
                <span>Verified Employers</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
                <span>ATS-Optimized Applications</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.7, delay: staggerDelay * 4, ease: "easeOut" }}
            className={`transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <div className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl mx-auto border border-border/40 ${searchFocused ? 'ring-2 ring-job-primary/20 shadow-job-primary/5' : ''} transition-all duration-300 relative overflow-hidden`}>
              {/* Decorative gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-job-primary/40 via-job-primary to-job-primary/40"></div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-job-primary/0 via-job-primary/20 to-job-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
                  <div className="relative bg-white rounded-md">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-hover:text-job-primary transition-colors duration-300" />
                    <Input 
                      placeholder="Job title, keywords, or company" 
                      className="pl-10 py-6 text-lg border-border/50 focus:ring-job-primary/30 transition-all duration-300"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      onKeyPress={handleKeyPress}
                      ref={searchInputRef}
                      disabled={isSearching}
                    />
                  </div>
                </div>
                
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-job-primary/0 via-job-primary/20 to-job-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
                  <div className="relative bg-white rounded-md">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-hover:text-job-primary transition-colors duration-300" />
                    <Input 
                      placeholder="City, state, or remote" 
                      className="pl-10 py-6 text-lg border-border/50 focus:ring-job-primary/30 transition-all duration-300"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      onKeyPress={handleKeyPress}
                      disabled={isSearching}
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-job-primary/0 via-job-primary/20 to-job-primary/0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></div>
                  <div className="relative bg-white rounded-md">
                    <Select 
                      value={jobType} 
                      onValueChange={setJobType} 
                      onOpenChange={setSearchFocused}
                      disabled={isSearching}
                    >
                      <SelectTrigger className="w-full md:w-48 py-6 text-lg border-border/50 focus:border-job-primary/50 focus:ring-job-primary/20 transition-all duration-300">
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-muted-foreground group-hover:text-job-primary transition-colors duration-300" />
                          <SelectValue placeholder="Job Type" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="border-job-primary/20 animate-in fade-in-80 zoom-in-95">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Full-time">Full Time</SelectItem>
                        <SelectItem value="Part-time">Part Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  className="py-6 px-8 text-lg bg-job-primary hover:bg-job-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-job-primary/0 via-white/20 to-job-primary/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    {isSearching ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Search Jobs
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.7, delay: staggerDelay * 5, ease: "easeOut" }}
              className="mt-8 text-sm text-muted-foreground text-center"
            >
              <span className="font-medium">Popular searches:</span>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {["React Developer", "Product Manager", "UX Designer", "Data Scientist", "Software Engineer"].map((term, index) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    className={`rounded-full text-xs transition-all duration-300 border-job-primary/20 ${activePopularTerm === index ? 'bg-job-primary text-white scale-110' : 'hover:bg-job-primary hover:text-white'}`}
                    onClick={() => handlePopularSearch(term, index)}
                    disabled={isSearching}
                  >
                    {activePopularTerm === index && isSearching ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      term
                    )}
                    {activePopularTerm === index && (
                      <span className="absolute inset-0 rounded-full animate-ping bg-job-primary/30"></span>
                    )}
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.7, delay: staggerDelay * 6, ease: "easeOut" }}
            className={`mt-16 text-center transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-sm font-medium text-muted-foreground mb-3">TRUSTED BY LEADING COMPANIES</p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
              {companies.map((company) => (
                <span key={company} className="text-muted-foreground/70 font-semibold text-sm md:text-base">{company}</span>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.7, delay: staggerDelay * 7, ease: "easeOut" }}
            className={`mt-12 flex justify-center transition-all duration-1000 delay-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <Button 
              variant="outline" 
              className="rounded-full group px-6 border-job-primary/20 text-job-primary hover:bg-job-primary/10 hover:text-job-primary hover:border-job-primary/30"
              onClick={() => {
                const params = new URLSearchParams();
                params.set("q", "");
                navigate(`/search?${params.toString()}`);
              }}
            >
              <span>View all job categories</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
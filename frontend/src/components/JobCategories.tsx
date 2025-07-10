import { Code, Palette, BarChart3, Megaphone, Shield, Users, Wrench, Heart, Grid, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import CategoryCard from "./CategoryCard";

const JobCategories = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
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
  
  const categories = [
    {
      title: "Technology",
      jobCount: 12543,
      icon: Code,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Design",
      jobCount: 3421,
      icon: Palette,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      title: "Marketing",
      jobCount: 5632,
      icon: Megaphone,
      gradient: "bg-gradient-to-br from-orange-500 to-red-500"
    },
    {
      title: "Sales",
      jobCount: 4123,
      icon: BarChart3,
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500"
    },
    {
      title: "Security",
      jobCount: 2341,
      icon: Shield,
      gradient: "bg-gradient-to-br from-gray-600 to-gray-700"
    },
    {
      title: "Human Resources",
      jobCount: 1876,
      icon: Users,
      gradient: "bg-gradient-to-br from-teal-500 to-cyan-500"
    },
    {
      title: "Operations",
      jobCount: 3254,
      icon: Wrench,
      gradient: "bg-gradient-to-br from-indigo-500 to-purple-600"
    },
    {
      title: "Healthcare",
      jobCount: 6789,
      icon: Heart,
      gradient: "bg-gradient-to-br from-pink-500 to-rose-500"
    }
  ];

  return (
    <motion.section 
      className="py-16 bg-background relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-job-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-job-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-12"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants} className="inline-block">
  <div className="flex items-center gap-3 mb-6 justify-center">
    <div className="relative flex-shrink-0">
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-job-primary to-job-accent opacity-30 blur-sm animate-pulse"></div>
      <Grid className="h-6 w-6 text-job-primary relative z-10" />
    </div>
    <h2
      className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-job-primary to-job-accent bg-clip-text text-transparent"
      style={{
        lineHeight: '1.4',
        paddingBottom: '0.25rem',
        paddingTop: '0.25rem',
        overflow: 'visible',
        display: 'inline-block',
      }}
    >
      Explore Jobs by Category
    </h2>
  </div>
</motion.div>


          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Discover opportunities across various industries and find the perfect role that matches your expertise.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              variants={itemVariants}
              custom={index}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onMouseEnter={() => setHoveredCategory(category.title)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <CategoryCard
                title={category.title}
                jobCount={category.jobCount}
                icon={category.icon}
                gradient={category.gradient}
                isHovered={hoveredCategory === category.title}
              />
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="text-center mt-12"
          variants={itemVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          transition={{ delay: 0.6 }}
        >
          <Button 
            className="bg-job-primary hover:bg-job-primary/90 text-white px-8 py-3 rounded-xl group relative overflow-hidden"
            onClick={() => navigate('/search')}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-job-primary via-job-accent to-job-primary bg-[length:200%] animate-shimmer opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            <span className="relative flex items-center">
              View All Categories
              <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default JobCategories;

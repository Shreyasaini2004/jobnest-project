import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  title: string;
  jobCount: number;
  icon: LucideIcon;
  gradient: string;
  onClick?: () => void;
  isHovered?: boolean;
}

const CategoryCard = ({ title, jobCount, icon: Icon, gradient, onClick, isHovered = false }: CategoryCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior
      navigate(`/search?q=${encodeURIComponent(title)}`);
    }
  };
  
  // Animation variants
  const iconVariants: Variants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2, type: "spring", stiffness: 400 } }
  };
  
  const arrowVariants: Variants = {
    initial: { x: -5, opacity: 0 },
    hover: { x: 0, opacity: 1, transition: { duration: 0.2 } }
  };
  return (
    <Card 
      className={cn(
        "group transition-all duration-300 cursor-pointer overflow-hidden",
        isHovered ? "shadow-lg shadow-job-primary/10 scale-[1.02]" : "shadow-sm hover:-translate-y-1 hover:shadow-md"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-6 text-center relative">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
          <div className={cn(
            "absolute transform rotate-45 translate-x-4 -translate-y-4 w-8 h-8 bg-job-primary/10",
            isHovered ? "opacity-100" : "opacity-0",
            "transition-opacity duration-300"
          )}></div>
        </div>
        
        <motion.div 
          className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center relative",
            gradient
          )}
          animate={isHovered ? "hover" : "initial"}
          variants={iconVariants}
        >
          <div className={cn(
            "absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent blur-sm",
            isHovered ? "opacity-100" : "opacity-0",
            "transition-opacity duration-300"
          )}></div>
          <Icon className="h-8 w-8 text-white relative z-10" />
        </motion.div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-job-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-center gap-2">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs transition-all duration-300",
              isHovered ? "bg-job-primary/10 text-job-primary" : ""
            )}
          >
            {jobCount.toLocaleString()} jobs
          </Badge>
          
          <motion.div 
            className="flex items-center text-muted-foreground text-xs"
            animate={isHovered ? "hover" : "initial"}
            variants={arrowVariants}
          >
            <span className="mr-1 text-job-primary font-medium">View</span>
            <ArrowRight className="h-3 w-3 text-job-primary" />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
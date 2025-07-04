import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NoJobsFound: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const handleRefreshHint = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 1000);
  };
  
  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-job-primary/10 p-10 text-center transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-job-primary/10 rounded-full blur-xl animate-pulse"></div>
        <div className="relative bg-white p-4 rounded-full shadow-lg">
          <Search className="h-12 w-12 text-job-primary animate-bounce" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
        <AlertCircle className="h-5 w-5 text-job-primary" />
        No matching jobs found
      </h3>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
        We couldn't find any jobs matching your current search criteria. Try adjusting your filters or search terms for better results.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="outline" 
          className="border-job-primary/20 text-job-primary hover:bg-job-primary/5 group flex items-center gap-2"
          onClick={handleRefreshHint}
        >
          <RefreshCw className={`h-4 w-4 ${isRotating ? 'animate-spin' : 'group-hover:animate-spin'}`} />
          Try different keywords
        </Button>
      </div>
    </div>
  );
};

export default NoJobsFound;
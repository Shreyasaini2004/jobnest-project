import { Search, MapPin, Briefcase, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface JobSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  filterLocation: string;
  setFilterLocation: (value: string) => void;
}

const JobSearchFilters = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterLocation,
  setFilterLocation,
}: JobSearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasFilters, setHasFilters] = useState(false);
  
  // Check if any filters are applied
  useEffect(() => {
    setHasFilters(filterType !== 'all' || filterLocation !== 'all' || searchTerm !== '');
  }, [filterType, filterLocation, searchTerm]);
  
  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterLocation('all');
  };
  
  return (
    <div className={`bg-white rounded-xl p-6 border shadow-lg transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${hasFilters ? 'border-job-primary/30 shadow-job-primary/5' : 'border-border/50'}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className={`h-5 w-5 transition-colors duration-300 ${hasFilters ? 'text-job-primary' : 'text-muted-foreground'}`} />
          <h3 className="font-medium text-foreground">Search Filters</h3>
        </div>
        
        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 group"
          >
            <X className="h-3.5 w-3.5 group-hover:text-destructive" />
            Clear filters
          </Button>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-job-primary" />
            Search Jobs
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-job-primary/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-job-primary transition-colors duration-300" />
            <Input
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border/50 focus:border-job-primary/50 focus:ring-job-primary/20 transition-all duration-300"
            />
          </div>
        </div>
        
        <div className="w-full lg:w-48">
          <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-job-primary" />
            Job Type
          </label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="border-border/50 focus:border-job-primary/50 focus:ring-job-primary/20 transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-job-primary/20 animate-in fade-in-80 zoom-in-95">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full lg:w-48">
          <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-job-primary" />
            Location
          </label>
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="border-border/50 focus:border-job-primary/50 focus:ring-job-primary/20 transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-job-primary/20 animate-in fade-in-80 zoom-in-95">
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="New York">New York</SelectItem>
              <SelectItem value="San Francisco">San Francisco</SelectItem>
              <SelectItem value="Austin">Austin</SelectItem>
              <SelectItem value="Boston">Boston</SelectItem>
              <SelectItem value="Seattle">Seattle</SelectItem>
              <SelectItem value="Chicago">Chicago</SelectItem>
              <SelectItem value="Los Angeles">Los Angeles</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default JobSearchFilters;
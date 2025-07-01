import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-job-secondary via-background to-job-secondary py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Find Your Dream
            <span className="bg-gradient-to-r from-job-primary to-job-accent bg-clip-text text-transparent"> Job</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Connect with top companies and discover opportunities that match your skills and passion. Your next career move starts here.
          </p>

          <div className="bg-card rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Job title, keywords, or company" 
                  className="pl-10 py-6 text-lg"
                />
              </div>
              
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="City, state, or remote" 
                  className="pl-10 py-6 text-lg"
                />
              </div>

              <Select>
                <SelectTrigger className="w-full md:w-48 py-6 text-lg">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Job Type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>

              <Button className="py-6 px-8 text-lg bg-job-primary hover:bg-job-primary/90">
                <Search className="h-5 w-5 mr-2" />
                Search Jobs
              </Button>
            </div>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            <span className="font-medium">Popular searches:</span>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {["React Developer", "Product Manager", "UX Designer", "Data Scientist", "Software Engineer"].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs hover:bg-job-primary hover:text-white transition-colors"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
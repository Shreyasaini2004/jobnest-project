import { Button } from "@/components/ui/button";
import { Search, Bell, User, Menu, ChevronDown, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  return (
    <header className="w-full bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-job-primary to-job-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JN</span>
            </div>
            <span className="text-xl font-bold text-foreground">JobNest</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-foreground hover:text-job-primary transition-colors">Jobs</a>
            <a href="#" className="text-foreground hover:text-job-primary transition-colors">Companies</a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="hidden md:flex items-center gap-2">
                <User className="h-4 w-4" />
                Sign Up
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/register?type=job-seeker" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>As Job Seeker</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/register?type=employer" className="cursor-pointer">
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>As Employer</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

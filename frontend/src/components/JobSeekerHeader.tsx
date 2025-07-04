import { Button } from "@/components/ui/button";
import { User, Settings, Bell } from "lucide-react";
// import { SidebarTrigger } from "@/components/ui/sidebar"; // Removed
import { useUser } from "@/contexts/UserContext";
import { useNavigate, Link } from "react-router-dom";

const JobSeekerHeader = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const userName = user?.name || "User";
  const userInitials = userName.split(' ').map(name => name[0]).join('').toUpperCase();
  const unreadNotifications = 2; // Example: replace with real count if available

  return (
    <header className="w-full bg-gradient-to-r from-background via-job-secondary/20 to-background border-b border-border/50 p-6 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* <SidebarTrigger className="hover:bg-job-primary/10 p-2 rounded-lg transition-colors" /> */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Welcome back, {userName}!
            </h1>
            <p className="text-muted-foreground">
              Ready to take the next step in your career journey?
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full bg-white shadow hover:bg-blue-100 transition-colors h-11 w-11 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6 text-blue-500" />
            {unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white" aria-label="Unread notifications"></span>
            )}
          </Button>
          {/* Profile Avatar */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full bg-white shadow hover:scale-105 transition-transform h-11 w-11 flex items-center justify-center text-lg font-bold text-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
            onClick={() => navigate('/profile')}
            aria-label="Profile"
          >
            {userInitials}
          </Button>
          {/* Settings Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white shadow hover:bg-blue-100 transition-colors h-11 w-11 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
            onClick={() => navigate('/settings')}
            aria-label="Settings"
          >
            <Settings className="h-6 w-6 text-blue-500" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default JobSeekerHeader;

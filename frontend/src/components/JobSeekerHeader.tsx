import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Bell } from "lucide-react";
// import { SidebarTrigger } from "@/components/ui/sidebar"; // Removed
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const JobSeekerHeader = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  // Mock company data - in real app this would come from user context or API
  const companyName = "TechCorp Solutions";
  const companyLocation = "San Francisco, CA";
  const userName = user?.name || "User";
  const initials = userName.split(' ').map(name => name[0]).join('').toUpperCase();
  const avatarUrl = user?.avatar;
  const unreadNotifications = 2; // Example: replace with real count if available

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header
      className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-100 via-blue-50 to-purple-50 shadow-sm rounded-2xl mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Left: Notification Bell */}
      <div className="flex items-center">
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
      </div>

      {/* Right: Welcome message and user dropdown */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">Welcome back,</p>
          <p className="text-sm text-slate-600">{userName}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="flex items-center gap-3 focus:outline-none bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 rounded-full p-1 shadow-md transition-all duration-200"
              whileHover={{ scale: 1.06, boxShadow: '0 4px 16px 0 rgba(99,102,241,0.15)' }}
              whileTap={{ scale: 0.97 }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="h-10 w-10 rounded-full object-cover border-2 border-indigo-400 shadow" />
              ) : (
                <span className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center text-lg font-bold text-indigo-700 border-2 border-indigo-400 shadow">
                  {initials}
                </span>
              )}
              <span className="font-semibold text-indigo-900 text-base hidden sm:inline">{userName}</span>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-xl rounded-xl animate-fade-in">
            <DropdownMenuLabel className="font-semibold">Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-red-50 text-red-600" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};

export default JobSeekerHeader;

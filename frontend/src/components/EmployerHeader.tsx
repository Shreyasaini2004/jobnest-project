import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User, Settings, LogOut, Building2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const EmployerHeader = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  
  // Mock company data - in real app this would come from user context or API
  const companyName = "TechCorp Solutions";
  const companyLocation = "San Francisco, CA";
  const userName = user?.name || "John Doe";
  const initials = user?.firstName?.[0]?.toUpperCase() + (user?.lastName?.[0]?.toUpperCase() || "");
  const avatarUrl = user?.avatar;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header
      className="flex items-center justify-between px-6 py-4 bg-white shadow-sm rounded-2xl mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{companyName}</h1>
            <p className="text-sm text-slate-600">{companyLocation}</p>
          </div>
        </div>
      </div>

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
              <span className="font-semibold text-indigo-900 text-base hidden sm:inline">{user?.firstName} {user?.lastName}</span>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-xl rounded-xl animate-fade-in">
            <DropdownMenuLabel className="font-semibold">Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50" onClick={() => navigate('/employer-profile')}>
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50" onClick={() => navigate('/employer-settings')}>
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

export default EmployerHeader;

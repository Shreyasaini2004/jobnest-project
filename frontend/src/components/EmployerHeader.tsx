
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User, Settings, LogOut, Building2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";

const EmployerHeader = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  
  // Mock company data - in real app this would come from user context or API
  const companyName = "TechCorp Solutions";
  const companyLocation = "San Francisco, CA";
  const userName = user?.name || "John Doe";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors" />
          
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
              <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-lg">
              <DropdownMenuLabel className="font-semibold">Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50">
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
      </div>
    </header>
  );
};

export default EmployerHeader;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Bell, User, Menu, ChevronDown, Briefcase, X, Globe, Sparkles, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import './notification-badge.css';
import { motion } from "framer-motion";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New job matches",
      message: "5 new jobs match your profile",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      title: "Application update",
      message: "Your application at TechCorp has been reviewed",
      time: "1 day ago",
      read: false
    }
  ]);
  const navigate = useNavigate();
  const { user, logout, refreshUserData, isLoading } = useUser();
  
  const initials = user?.firstName?.[0]?.toUpperCase() + (user?.lastName?.[0]?.toUpperCase() || "");
  const avatarUrl = user?.avatar;

  // Fetch user data when component mounts
  useEffect(() => {
    if (user && user._id) {
      refreshUserData();
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-background'} border-b border-border`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-job-primary to-job-accent rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">JN</span>
            </div>
            <span className="text-xl font-bold text-foreground group-hover:text-job-primary transition-colors">JobNest</span>
            <Badge variant="outline" className="hidden sm:flex bg-job-secondary/20 text-job-primary text-xs font-medium px-2 py-0 h-5">BETA</Badge>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/search" className="text-foreground hover:text-job-primary transition-colors font-medium">Jobs</Link>
            <Link to="/search?featured=true" className="text-foreground hover:text-job-primary transition-colors font-medium">Companies</Link>
            <Link to="/dashboard" className="text-foreground hover:text-job-primary transition-colors font-medium">Events</Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-job-primary transition-colors font-medium">
                Resources
                <ChevronDown className="h-4 w-4 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard?tab=ats-analysis">
                    <Sparkles className="mr-2 h-4 w-4 text-job-primary" />
                    <span>ATS Score Analysis</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/career-blog">
                    <Globe className="mr-2 h-4 w-4 text-job-primary" />
                    <span>Career Blog</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Dialog */}
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 rounded-full px-4 border-job-primary/20 text-job-primary hover:bg-job-primary/10 hover:text-job-primary hover:border-job-primary/30">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Search Jobs</DialogTitle>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Input
                    placeholder="Job title, keywords, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="focus:ring-job-primary/30"
                  />
                </div>
                <Button onClick={handleSearch} className="bg-job-primary hover:bg-job-primary/90">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-job-secondary/20 hover:text-job-primary relative" aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold shadow-lg border-2 border-white animate-pop-in transition-all z-20"
                    aria-label={`${unreadCount} unread notifications`}
                  >
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-2">
                <span className="text-sm font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className={`p-3 cursor-pointer ${!notification.read ? 'bg-job-primary/5' : ''}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{notification.title}</span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-job-primary rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard?tab=notifications" className="cursor-pointer text-center">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="hidden md:flex items-center gap-2 bg-job-primary hover:bg-job-primary/90">
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="h-10 w-10 rounded-full object-cover border-2 border-blue-400" />
                    ) : (
                      <span className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-lg font-bold text-blue-700 border-2 border-blue-400">
                        {initials}
                      </span>
                    )}
                    <span className="font-semibold text-blue-900 text-base hidden sm:inline">{user?.firstName} {user?.lastName}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={user?.userType === "employer" ? "/employer-dashboard" : "/dashboard"} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  logout();
                  navigate("/");
                }} className="cursor-pointer text-red-500 hover:text-red-500 hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="hidden md:flex items-center gap-2 bg-job-primary hover:bg-job-primary/90">
                  <User className="h-4 w-4" />
                  Sign In
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/login" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/register?type=job-seeker" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Register as Job Seeker</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/register?type=employer" className="cursor-pointer">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Register as Employer</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-8 h-8 bg-gradient-to-r from-job-primary to-job-accent rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">JN</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">JobNest</span>
                  </Link>
                  <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <X className="h-4 w-4" />
                  </SheetClose>
                </div>
                
                <div className="space-y-4 py-4">
                  <div className="px-2 py-1 font-medium text-sm text-muted-foreground">Navigation</div>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/search">Jobs</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/search?featured=true">Companies</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/dashboard">Events</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/dashboard?tab=ats-analysis">Resources</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="mt-auto space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {user ? (
                      <>
                        <Button asChild variant="outline" onClick={() => setMobileMenuOpen(false)}>
                          <Link to={user?.userType === "employer" ? "/employer-dashboard" : "/dashboard"}>Dashboard</Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            logout();
                            navigate("/");
                            setMobileMenuOpen(false);
                          }}
                        >
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild variant="outline" onClick={() => setMobileMenuOpen(false)}>
                          <Link to="/login">Sign In</Link>
                        </Button>
                        <Button asChild onClick={() => setMobileMenuOpen(false)}>
                          <Link to="/register?type=job-seeker">Register</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

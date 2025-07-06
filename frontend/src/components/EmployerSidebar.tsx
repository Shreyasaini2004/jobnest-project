import { Link } from 'react-router-dom';
import { PlusCircle, Users, BarChart3, Calendar, Home, BarChart2, MessageCircle } from 'lucide-react';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

const menuItems = [
  { id: 'dashboard-home', label: 'Dashboard Home', icon: Home },
  { id: 'post-opening', label: 'Post Opening', icon: PlusCircle },
  { id: 'view-applications', label: 'View Applications', icon: Users },
  { id: 'view-status', label: 'View Status', icon: BarChart3 },
  { id: 'calendar-events', label: 'Calendar & Events', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'notifications', label: 'Notifications', icon: BarChart3 },
  { id: 'messages', label: 'Messages', icon: MessageCircle }
];

const EmployerSidebar = ({ activeSection, onSectionChange }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <aside
      className={`min-h-screen p-4 flex flex-col bg-gradient-to-b from-blue-400 via-purple-300 to-blue-100 shadow-lg transition-all duration-300 ease-in-out z-20 fixed md:static
        ${isCollapsed ? 'w-20' : 'w-64'}
        dark:bg-gradient-to-b dark:from-[#23263A]/80 dark:via-[#23263A]/60 dark:to-[#181B23]/80 dark:backdrop-blur-xl dark:shadow-2xl dark:border-r-2 dark:border-job-accent/40 dark:border-opacity-60 with-noise fade-in
      `}
      style={{ left: 0, top: 0 }}
    >
      {/* SidebarTrigger at top left corner, matching JobSeekerSidebar */}
      <div className="absolute left-2 top-2 z-30">
        <SidebarTrigger aria-label="Toggle sidebar" className="p-2 rounded-full hover:bg-white/20 focus:bg-white/30 transition-colors" />
      </div>
      {/* JobNest logo at top left, matching JobSeekerSidebar */}
      <div className={`mb-8 px-2 mt-12 ${isCollapsed ? 'flex justify-center' : 'flex flex-col items-start'}`}>
        <Link to="/" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''} group`} tabIndex={0} aria-label="Go to homepage">
          <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-2xl font-bold text-blue-500 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">JN</div>
          {!isCollapsed && (
            <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow">JobNest</span>
          )}
        </Link>
      </div>
      <nav className={`flex-1 space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {menuItems.map((link) => {
          const isActive = activeSection === link.id;
          return (
            <button
              key={link.label || link.id}
              onClick={() => onSectionChange(link.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all font-medium text-base outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-white text-blue-600 shadow-lg scale-105 border-2 border-blue-400'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              style={{ boxShadow: isActive ? '0 4px 16px 0 rgba(59,130,246,0.15)' : undefined }}
              tabIndex={0}
              aria-label={link.label || link.id}
            >
              <link.icon className="h-5 w-5" aria-hidden="true" />
              {!isCollapsed && link.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default EmployerSidebar;

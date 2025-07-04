import { Link, useLocation } from 'react-router-dom';
import { User, Settings, FileText, Bookmark, Briefcase, Target, Clock, Home, HelpCircle, Bell, Calendar } from 'lucide-react';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

const sidebarLinks = [
  { label: 'Dashboard Home', icon: Home, to: '/dashboard?section=dashboard-home' },
  { label: 'View Openings', icon: Briefcase, to: '/dashboard?section=view-openings' },
  { label: 'Saved Jobs & Reminders', icon: Bookmark, to: '/dashboard?section=saved-jobs' },
  { label: 'Manage Applications', icon: FileText, to: '/dashboard?section=manage-applications' },
  { label: 'ATS Score Analysis', icon: Target, to: '/dashboard?section=ats-score' },
  { label: 'Saved Analyses', icon: Clock, to: '/dashboard?section=saved-analyses' },
  { label: 'Calendar', icon: Calendar, to: '/dashboard?section=calendar' },
  { label: 'Notifications', icon: Bell, to: '/dashboard?section=notifications' },
  { label: 'Support', icon: HelpCircle, to: '/dashboard?section=support' },
];

export default function JobSeekerSidebar({ activeSection, onSectionChange }: any) {
  const location = useLocation();
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
      {/* SidebarTrigger at top left corner */}
      <div className="absolute left-2 top-2 z-30">
        <SidebarTrigger aria-label="Toggle sidebar" className="p-2 rounded-full hover:bg-white/20 focus:bg-white/30 transition-colors" />
      </div>
      {/* Logo and JobNest text, alignment depends on collapsed state */}
      <div className={`mb-8 px-2 mt-12 ${isCollapsed ? 'flex justify-center' : 'flex flex-col items-start'}`}>
        <Link to="/" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''} group`} tabIndex={0} aria-label="Go to homepage">
          <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-2xl font-bold text-blue-500 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">JN</div>
          {!isCollapsed && (
            <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow">JobNest</span>
          )}
        </Link>
      </div>
      <nav className={`flex-1 space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {sidebarLinks.map((link) => {
          const isActive = location.pathname + location.search === link.to;
          return (
            <Link
              key={link.label}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all font-medium text-base outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive || (activeSection && link.to.includes(activeSection))
                  ? 'bg-white text-blue-600 shadow-lg scale-105 border-2 border-blue-400'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
              style={{ boxShadow: isActive ? '0 4px 16px 0 rgba(59,130,246,0.15)' : undefined }}
              onClick={() => {
                if (onSectionChange && link.to.includes('section=')) {
                  const section = link.to.split('section=')[1];
                  onSectionChange(section);
                }
              }}
              tabIndex={0}
              aria-label={link.label}
            >
              <link.icon className="h-5 w-5" aria-hidden="true" />
              {!isCollapsed && link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

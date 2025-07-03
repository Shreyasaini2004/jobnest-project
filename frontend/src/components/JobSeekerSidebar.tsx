import { Link, useLocation } from 'react-router-dom';
import { User, Settings, FileText, Bookmark, Briefcase, Target, Clock, Home, HelpCircle, Bell, Calendar } from 'lucide-react';

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
  return (
    <aside className="w-64 min-h-screen p-4 flex flex-col bg-gradient-to-b from-blue-400 via-purple-300 to-blue-100 shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2 group">
        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-2xl font-bold text-blue-500 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">JN</div>
        <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow">JobNest</span>
      </div>
      <nav className="flex-1 space-y-2">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname + location.search === link.to;
          return (
            <Link
              key={link.label}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all font-medium text-base outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
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
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { User, Settings, FileText, Bookmark, Briefcase, Target, Clock } from 'lucide-react';

const sidebarLinks = [
  { label: 'View Openings', icon: Briefcase, to: '/dashboard?section=view-openings' },
  { label: 'Saved Jobs & Reminders', icon: Bookmark, to: '/dashboard?section=saved-jobs' },
  { label: 'Manage Applications', icon: FileText, to: '/dashboard?section=manage-applications' },
  { label: 'ATS Score Analysis', icon: Target, to: '/dashboard?section=ats-score' },
  { label: 'Saved Analyses', icon: Clock, to: '/dashboard?section=saved-analyses' },
];

export default function JobSeekerSidebar({ activeSection, onSectionChange }: any) {
  const location = useLocation();
  return (
    <aside className="w-64 bg-background border-r min-h-screen p-4 space-y-2">
      {sidebarLinks.map((link) => {
        const isActive = location.pathname + location.search === link.to;
        return (
          <Link
            key={link.label}
            to={link.to}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
              isActive || (activeSection && link.to.includes(activeSection))
                ? 'bg-gradient-to-r from-job-primary to-job-accent text-white shadow'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
            onClick={() => {
              if (onSectionChange && link.to.includes('section=')) {
                const section = link.to.split('section=')[1];
                onSectionChange(section);
              }
            }}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
    </aside>
  );
}

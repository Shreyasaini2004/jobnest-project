import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Briefcase, Target, Bell, Upload, Search, Plus, Star, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from "@/contexts/UserContext";
import { applicationApi } from "@/lib/applicationApi";
import { eventApi } from "@/lib/eventApi";
import { useSavedJobs } from "@/contexts/SavedJobsContext";
import { useEvents } from "@/contexts/EventContext";

const statusColors = {
  Interview: 'bg-blue-100 text-blue-700',
  Offer: 'bg-green-100 text-green-700',
  Applied: 'bg-yellow-100 text-yellow-700',
};

// Animation utility for fade-in
const fadeIn = "transition-all duration-500 opacity-0 translate-y-4 animate-fadein";

const DashboardHome = () => {
  const { user } = useUser();
  const { savedJobs } = useSavedJobs();
  const { events } = useEvents();
  const userName = user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "User");
  const userType = user?.userType || "Job Seeker";
  const userInitials = userName.split(' ').map(name => name[0]).join('').toUpperCase();

  // State for dashboard data
  const [stats, setStats] = useState([
    { label: 'Applications', value: 0 },
    { label: 'Interviews', value: 0 },
    { label: 'Saved Jobs', value: savedJobs?.length || 0 }
  ]);

  const [applicationTracker, setApplicationTracker] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // Fetch application data
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (user && user._id && user.userType === 'job-seeker') {
        try {
          const applications = await applicationApi.getJobSeekerApplications(user._id);
          
          // Update application stats
          const interviewCount = applications.filter(app => 
            app.status === 'interview' || app.status === 'Interview'
          ).length;
          
          setStats([
            { label: 'Applications', value: applications.length },
            { label: 'Interviews', value: interviewCount },
            { label: 'Saved Jobs', value: savedJobs?.length || 0 }
          ]);
          
          // Update application tracker (most recent 3)
          const recentApplications = applications
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
            .map(app => ({
              role: app.job?.jobTitle || 'Unknown Position',
              company: app.job?.postedBy?.companyName || 'Unknown Company',
              status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
              jobId: app.job?._id
            }));
            
          setApplicationTracker(recentApplications);
          
          // Create notifications from applications
          const appNotifications = applications
            .filter(app => app.status === 'interview' || app.status === 'Interview')
            .slice(0, 2)
            .map(app => ({
              type: 'interview',
              message: `Interview scheduled for ${app.job?.jobTitle || 'a position'} on`,
              date: new Date(app.updatedAt || app.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })
            }));
            
          setNotifications(appNotifications);
        } catch (error) {
          console.error('Error fetching application data:', error);
        }
      }
    };
    
    fetchApplicationData();
  }, [user, savedJobs]);
  
  // Set upcoming events from events context
  useEffect(() => {
    if (events && events.length > 0) {
      const formattedEvents = events
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3)
        .map(event => ({
          type: event.type === 'job-fair' ? 'job-fair' : 'webinar',
          company: event.title.split(' at ')[1] || '',
          role: event.title.split(' at ')[0] || event.title,
          date: new Date(event.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          time: event.type === 'job-fair' ? 
            new Date(event.date).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }) : ''
        }));
        
      setUpcomingEvents(formattedEvents);
    }
  }, [events]);
  
  // Set recommended jobs from saved jobs (placeholder for real recommendations)
  useEffect(() => {
    if (savedJobs && savedJobs.length > 0) {
      const recommendations = savedJobs
        .slice(0, 2)
        .map(job => ({
          role: job.title,
          company: job.company,
          id: job.id
        }));
        
      setRecommendedJobs(recommendations);
    }
  }, [savedJobs]);

  // Animation state for fade-in
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  // Utility for fade-in animation
  const fadeInClass = show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';

  return (
    <main className="space-y-8 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-[#181B23] dark:via-[#23263A] dark:to-[#181B23] min-h-screen p-2 sm:p-4 md:p-6" aria-label="Job Seeker Dashboard">
      {/* Top row: Profile card and Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8" aria-label="Profile and Stats">
        {/* Profile Card */}
        <Card className={`lg:col-span-1 rounded-2xl shadow-xl border-0 bg-white/90 dark:bg-[#23263A] dark:shadow-2xl dark:border-none transform transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl ${fadeInClass}`}
          tabIndex={0} aria-label="Profile Card">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-700 dark:to-purple-700 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold mb-4 shadow-lg overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                userInitials
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 text-blue-700 dark:text-blue-200" id="welcome-heading">Welcome, {userName}!</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mb-4 dark:text-blue-100/70">{userType === 'job-seeker' ? 'Job Seeker' : 'Employer'}</p>
            <div className="grid grid-cols-1 gap-3 w-full max-w-xs mx-auto">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold rounded-xl shadow transition-transform duration-200 hover:scale-105 text-xs sm:text-base focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2" aria-label="Upload Resume">Upload Resume</Button>
              {userType === 'employer' && (
                <Button className="w-full bg-purple-400 hover:bg-purple-500 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-semibold rounded-xl shadow transition-transform duration-200 hover:scale-105 text-xs sm:text-base focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2" aria-label="Post a Job">Post a Job</Button>
              )}
              <Button variant="outline" className="w-full border-blue-200 text-blue-700 dark:text-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-transform duration-200 hover:scale-105 text-xs sm:text-base focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2" aria-label="Search Jobs">Search Jobs</Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className={`rounded-2xl shadow-xl border-0 bg-white/90 dark:bg-[#23263A] dark:shadow-2xl dark:border-none flex flex-col items-center justify-center py-4 sm:py-6 transform transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl ${fadeInClass}`}
              tabIndex={0} aria-label={`${stat.label} Card`}>
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-200">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base sm:text-lg text-blue-700 dark:text-blue-100 font-semibold">{stat.label}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Middle row: Application Tracker and Recommended Jobs */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8" aria-label="Applications and Recommendations">
        {/* Application Tracker */}
        <Card className={`rounded-2xl shadow-xl border-0 bg-white/90 dark:bg-[#23263A] dark:shadow-2xl dark:border-none transform transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl ${fadeInClass}`}
          tabIndex={0} aria-label="Application Tracker">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-200">
                <Briefcase className="h-5 w-5 text-blue-400 dark:text-blue-300" aria-hidden="true" /> Application Tracker
              </CardTitle>
              <Link to="/dashboard?section=manage-applications" className="text-xs sm:text-sm text-blue-500 dark:text-blue-300 hover:underline focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded-md" aria-label="View All Applications">View All</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applicationTracker.map((app, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-blue-50/60 dark:bg-blue-900/30 rounded-xl gap-2 sm:gap-0">
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm sm:text-base">{app.role}</h3>
                    <p className="text-xs sm:text-sm text-blue-400 dark:text-blue-300">{app.company}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${statusColors[app.status as keyof typeof statusColors]} dark:bg-opacity-30 dark:text-opacity-90`}>{app.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Jobs */}
        <Card className={`rounded-2xl shadow-xl border-0 bg-white/90 dark:bg-[#23263A] dark:shadow-2xl dark:border-none transform transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl ${fadeInClass}`}
          tabIndex={0} aria-label="Recommended Jobs">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-200">
                <Star className="h-5 w-5 text-yellow-400 dark:text-yellow-300" aria-hidden="true" /> Recommended Jobs
              </CardTitle>
              <Link to="/dashboard?section=view-openings" className="text-xs sm:text-sm text-blue-500 dark:text-blue-300 hover:underline focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded-md" aria-label="View All Openings">View All</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendedJobs.map((job, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-blue-50/60 dark:bg-blue-900/30 rounded-xl gap-2 sm:gap-0">
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm sm:text-base">{job.role}</h3>
                    <p className="text-xs sm:text-sm text-blue-400 dark:text-blue-300">at {job.company}</p>
                  </div>
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold rounded-xl px-4 sm:px-6 transition-transform duration-200 hover:scale-105 text-xs sm:text-base focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2" aria-label={`Apply for ${job.role}`}>Apply</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Bottom row: Notifications and Upcoming Events */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8" aria-label="Notifications and Events">
        {/* Notifications */}
        <Card className={`rounded-2xl shadow-xl border-0 bg-white/90 dark:bg-[#23263A] dark:shadow-2xl dark:border-none transform transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl ${fadeInClass}`}
          tabIndex={0} aria-label="Notifications">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-200">
              <Bell className="h-5 w-5 text-blue-400 dark:text-blue-300" aria-hidden="true" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50/60 dark:bg-blue-900/30 rounded-xl">
                  <div className="h-2 w-2 rounded-full bg-green-400 dark:bg-green-300 mt-2" aria-hidden="true"></div>
                  <div>
                    <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                      {notification.message} {notification.date && <span className="font-medium">{notification.date}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className={`rounded-2xl shadow-xl border-0 bg-white/90 dark:bg-[#23263A] dark:shadow-2xl dark:border-none transform transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl ${fadeInClass}`}
          tabIndex={0} aria-label="Upcoming Events">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-200">
              <Calendar className="h-5 w-5 text-purple-400 dark:text-purple-300" aria-hidden="true" /> Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50/60 dark:bg-blue-900/30 rounded-xl">
                  <div className="h-2 w-2 rounded-full bg-purple-400 dark:bg-purple-300 mt-2" aria-hidden="true"></div>
                  <div>
                    <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                      {event.type === 'job-fair' ? (
                        <>Job Fair with <span className="font-medium">{event.company}</span> - {event.date}, {event.time}</>
                      ) : (
                        <>Webinar for <span className="font-medium">{event.role}</span> - {event.date}</>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Saved Jobs */}
      <section className="mt-4" aria-label="Saved Jobs">
        <Card className={`rounded-2xl shadow-xl border-0 bg-white/90 dark:bg-[#23263A] dark:shadow-2xl dark:border-none transform transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl ${fadeInClass}`}
          tabIndex={0} aria-label="Saved Jobs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-200">
              <Bookmark className="h-5 w-5 text-blue-400 dark:text-blue-300" aria-hidden="true" /> Saved Jobs
            </CardTitle>
            <Link to="/dashboard?section=saved-jobs" className="text-xs sm:text-sm text-blue-500 dark:text-blue-300 hover:underline focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 rounded-md" aria-label="View All Saved Jobs">View All</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-blue-50/60 dark:bg-blue-900/30 rounded-xl gap-2 sm:gap-0">
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm sm:text-base">Data Scientist</h3>
                </div>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold rounded-xl px-4 sm:px-6 transition-transform duration-200 hover:scale-105 text-xs sm:text-base focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2" aria-label="Apply for Data Scientist">Apply</Button>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-blue-50/60 dark:bg-blue-900/30 rounded-xl gap-2 sm:gap-0">
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm sm:text-base">QA Engineer</h3>
                </div>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold rounded-xl px-4 sm:px-6 transition-transform duration-200 hover:scale-105 text-xs sm:text-base focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2" aria-label="Apply for QA Engineer">Apply</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default DashboardHome;

// Add this to your global CSS (e.g., App.css):
// @keyframes fadein { to { opacity: 1; transform: none; } }
// .animate-fadein { animation: fadein 0.7s cubic-bezier(0.4,0,0.2,1) forwards; }
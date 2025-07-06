import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Calendar, BarChart2, Eye, UserPlus, Calendar as CalendarIcon, Flame, CalendarDays, ListChecks, Activity } from "lucide-react";

const EmployerDashboardHome = () => {
  const { user } = useUser();
  const companyName = user?.companyName || "Your Company";
  const userName = user?.name || user?.firstName || "Employer";
  const userInitials = companyName.split(' ').map(n => n[0]).join('').toUpperCase();

  // Placeholder stats - replace with real data as needed
  const stats = [
    { label: 'Job Postings', value: 3, icon: Briefcase },
    { label: 'Applications', value: 12, icon: Users },
    { label: 'Events', value: 2, icon: Calendar }
  ];

  // Mock data for recent job postings
  const recentJobs = [
    { title: 'Frontend Developer', date: 'Jul 10, 2024', applicants: 5 },
    { title: 'Backend Engineer', date: 'Jul 5, 2024', applicants: 8 },
    { title: 'UI/UX Designer', date: 'Jun 28, 2024', applicants: 3 }
  ];

  // Mock data for recent applications
  const recentApplications = [
    { name: 'Alice Smith', job: 'Frontend Developer', status: 'Pending', date: 'Jul 11, 2024' },
    { name: 'John Doe', job: 'Backend Engineer', status: 'Interview', date: 'Jul 8, 2024' },
    { name: 'Jane Lee', job: 'UI/UX Designer', status: 'Rejected', date: 'Jul 1, 2024' }
  ];

  // Mock analytics
  const analytics = [
    { label: 'Total Job Views', value: 245, icon: Eye },
    { label: 'Avg. Applicants/Job', value: 7, icon: UserPlus },
    { label: 'Interviews Scheduled', value: 4, icon: BarChart2 }
  ];

  // Mock mini-calendar data
  const upcomingEvents = [
    { date: 'Jul 15, 2024', label: 'Interview: Alice Smith' },
    { date: 'Jul 17, 2024', label: 'Job Fair' },
    { date: 'Jul 20, 2024', label: 'Interview: John Doe' }
  ];

  // Mock data for widgets
  const topJobs = [
    { title: 'Frontend Developer', applicants: 12 },
    { title: 'Backend Engineer', applicants: 9 },
    { title: 'UI/UX Designer', applicants: 7 }
  ];
  const heatmap = [
    [2, 1, 0, 3, 2, 1, 0],
    [1, 2, 3, 1, 0, 2, 1],
    [0, 1, 2, 2, 3, 1, 0],
    [1, 0, 1, 2, 1, 2, 3]
  ];
  const interviewDates = [
    { date: 'Jul 15', candidate: 'Alice Smith' },
    { date: 'Jul 20', candidate: 'John Doe' }
  ];
  const pendingActions = [
    'Review 3 new applications',
    'Schedule interview for Jane Lee',
    'Approve job posting: DevOps Engineer'
  ];

  const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  const properUserName = toTitleCase(userName);

  return (
    <main className="space-y-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 min-h-screen p-2 sm:p-4 md:p-6" aria-label="Employer Dashboard Home">
      {/* Top row: Company/Profile card and Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8" aria-label="Profile and Stats">
        {/* Company/Profile Card */}
        <Card className="lg:col-span-1 rounded-2xl shadow-xl border-0 bg-white/90 flex flex-col items-center text-center p-8 transition-transform hover:scale-[1.02] hover:shadow-2xl">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Company Logo" className="h-full w-full object-cover" />
            ) : (
              userInitials
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-1 text-indigo-700">Welcome, {properUserName}!</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mb-4 font-normal">{companyName}</p>
          <div className="grid grid-cols-1 gap-3 w-full max-w-xs mx-auto">
            <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow transition-transform duration-200 hover:scale-105 text-xs sm:text-base py-2">Post a Job</button>
            <button className="w-full border-2 border-purple-400 text-purple-700 font-semibold rounded-xl shadow transition-transform duration-200 hover:scale-105 text-xs sm:text-base py-2 bg-white hover:bg-purple-50">View Applications</button>
          </div>
        </Card>
        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="rounded-2xl shadow-xl border-0 bg-white/90 flex flex-col items-center justify-center py-4 sm:py-6 hover:scale-[1.025] hover:shadow-2xl transition-transform">
              <CardHeader className="pb-2 text-center">
                <stat.icon className="h-8 w-8 text-indigo-400 mb-2" />
                <CardTitle className="text-3xl sm:text-4xl font-bold text-indigo-600">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base sm:text-lg text-indigo-700 font-semibold">{toTitleCase(stat.label)}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      {/* Analytics Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6" aria-label="Analytics">
        {analytics.map((item, idx) => (
          <Card key={idx} className="rounded-2xl shadow-xl border-0 bg-white/90 flex flex-col items-center justify-center py-6 hover:scale-105 transition-transform">
            <CardHeader className="pb-2 text-center">
              <item.icon className="h-8 w-8 text-purple-400 mb-2" />
              <CardTitle className="text-2xl font-bold text-purple-600">{item.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-purple-700 font-semibold">{toTitleCase(item.label)}</CardDescription>
            </CardContent>
          </Card>
        ))}
        {/* Mini Calendar Widget */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90 flex flex-col items-center justify-center py-6 hover:scale-105 transition-transform">
          <CardHeader className="pb-2 text-center">
            <CalendarIcon className="h-8 w-8 text-indigo-400 mb-2" />
            <CardTitle className="text-lg font-bold text-indigo-700">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {upcomingEvents.map((event, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="font-semibold text-indigo-600">{event.date}</span>
                  <span className="text-slate-500">{event.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
      {/* Optional Widgets Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Optional Widgets">
        {/* Top Performing Jobs */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90">
          <CardHeader className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <CardTitle className="text-base font-bold text-orange-700">Top Performing Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topJobs.map((job, idx) => (
                <li key={idx} className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{job.title}</span>
                  <span className="text-orange-600 font-bold">{job.applicants} apps</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {/* Applicant Heatmap */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90">
          <CardHeader className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-purple-500" />
            <CardTitle className="text-base font-bold text-purple-700">Applicant Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {heatmap.flat().map((val, idx) => (
                <div key={idx} className={`w-6 h-6 rounded ${val === 0 ? 'bg-slate-200' : val === 1 ? 'bg-purple-100' : val === 2 ? 'bg-purple-300' : 'bg-purple-500'} transition`} title={`Activity: ${val}`}></div>
              ))}
            </div>
            <div className="text-xs text-slate-400 mt-2">Darker = more applications</div>
          </CardContent>
        </Card>
        {/* Interview Calendar */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90">
          <CardHeader className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-base font-bold text-blue-700">Interview Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {interviewDates.map((item, idx) => (
                <li key={idx} className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.date}</span>
                  <span className="text-blue-600">{item.candidate}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {/* Pending Actions */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90">
          <CardHeader className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-green-500" />
            <CardTitle className="text-base font-bold text-green-700">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              {pendingActions.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
      {/* Recent Job Postings and Applications */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Recent Activity">
        {/* Recent Job Postings */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90 transition-transform hover:scale-[1.02] hover:shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-indigo-700">Recent Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-indigo-100">
              {recentJobs.map((job, idx) => (
                <li key={idx} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-indigo-800">{job.title}</span>
                  <span className="text-xs text-slate-500">{job.date}</span>
                  <span className="text-xs text-indigo-500 ml-2">{job.applicants} applicants</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {/* Recent Applications */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90 transition-transform hover:scale-[1.02] hover:shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-indigo-700">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-indigo-100">
              {recentApplications.map((app, idx) => (
                <li key={idx} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-indigo-800">{toTitleCase(app.name)}</span>
                  <span className="text-xs text-slate-500">{app.job}</span>
                  {/* Status badge with color logic */}
                  <span className={`text-xs font-semibold ml-2 px-2 py-1 rounded-full
                    ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : ''}
                    ${app.status === 'Interview' ? 'bg-blue-100 text-blue-800 border border-blue-300' : ''}
                    ${app.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-300' : ''}
                  `}>
                    {app.status}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">{app.date}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default EmployerDashboardHome; 
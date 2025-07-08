import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Building, MapPin, Clock, Eye, MessageSquare, Loader2 } from "lucide-react";
import { applicationApi } from "@/lib/applicationApi";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ManageApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) {
        setError("You must be logged in to view your applications");
        setIsLoading(false);
        return;
      }

      if (user.userType !== "job-seeker") {
        setError("Only job seekers can view applications");
        setIsLoading(false);
        return;
      }

      try {
        const jobSeekerId = user._id;
        const data = await applicationApi.getJobSeekerApplications(jobSeekerId);

        const formattedApplications = data.map((app: any) => ({
          id: app._id,
          jobTitle: app.job?.jobTitle || "Unknown Position",
          company: app.job?.postedBy?.companyName || "Unknown Company",
          location: app.job?.location || "Remote",
          appliedDate: app.createdAt,
          status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
          lastUpdate: formatTimeAgo(app.updatedAt || app.createdAt),
          jobId: app.job?._id
        }));

        setApplications(formattedApplications);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load your applications. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
    return `${Math.floor(diffDays / 30)} month(s) ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interview scheduled': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'interview scheduled': return '🎯';
      case 'under review': return '👀';
      case 'applied': return '📝';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-job-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button className="bg-job-primary hover:bg-job-primary/90" onClick={() => navigate('/search')}>
          Browse Jobs
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Sign in required</h3>
        <p className="text-muted-foreground mb-6">Please sign in to view your job applications.</p>
        <Button className="bg-job-primary hover:bg-job-primary/90" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-job-success/10 to-job-primary/10 rounded-xl p-8 border border-job-success/20">
        <h1 className="text-3xl font-bold text-foreground mb-3">📊 Track Your Applications</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Stay on top of your job search! Monitor all your applications in one place,
          track their progress, and never miss an important update from potential employers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {applications.filter(app => app.status.toLowerCase() === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {applications.filter(app => app.status.toLowerCase() === 'reviewed').length}
            </div>
            <div className="text-sm text-muted-foreground">Reviewed</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {applications.filter(app => app.status.toLowerCase() === 'shortlisted').length}
            </div>
            <div className="text-sm text-muted-foreground">Shortlisted</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-job-primary/10 to-job-accent/10">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-job-primary">{applications.length}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Your Applications</h2>
          <p className="text-muted-foreground">{applications.length} applications tracked</p>
        </div>

        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-lg transition-all duration-300 border-border/50 bg-gradient-to-r from-card to-card/50">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-foreground mb-2 flex items-center">
                      <span className="mr-2">{getStatusIcon(application.status)}</span>
                      {application.jobTitle}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-muted-foreground">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1 text-job-primary" />
                        <span className="font-medium">{application.company}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{application.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(application.status)} border`}>
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-job-primary" />
                      <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Updated: {application.lastUpdate}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-job-primary/20 hover:bg-job-primary/5"
                      onClick={() => navigate(`/jobs/${application.jobId}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Job
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-job-success/20 hover:bg-job-success/5"
                      // onClick={() =>
                      //   navigate(
                      //     `/chat?room=${application.jobId}&user=${encodeURIComponent(user.name || "User")}`
                      //   )
                      // }

                      onClick={() => {
    // Use the SAME Application ID for the room
    const roomId = application.id; 
    // Get the job seeker's name from your auth context
    const jobSeekerUsername = user.firstName || "Applicant"; 

    navigate(`/chat?room=${roomId}&user=${encodeURIComponent(jobSeekerUsername)}`);
  }}
  // In the "Message" button's onClick handler

// onClick={() => {
//   const roomId = application._id;
//   // We need to pass the employer's company name to the chat page
//   // const chatPartnerName = application.job.postedBy?.companyName || "Recruiter";
//   const chatPartnerName = application.job?.postedBy?.companyName || "Recruiter";

  
//   navigate(`/chat?room=${roomId}&partnerName=${encodeURIComponent(chatPartnerName)}`);
// }}

                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {applications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No applications yet</h3>
          <p className="text-muted-foreground mb-6">
            Start applying to jobs to track your progress here.
          </p>
          <Button className="bg-job-primary hover:bg-job-primary/90" onClick={() => navigate('/search')}>
            Browse Jobs
          </Button>
        </div>
      )}
    </div>
  );
};

export default ManageApplications;


// src/pages/ManageApplications.tsx (or components) - COMPLETELY UPDATED

// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { MessageSquare, Eye } from "lucide-react";
// import { useUser } from "@/contexts/UserContext";
// import apiClient from "@/lib/axios";
// import { ChatDialog } from "@/components/ChatDialog";
// import { socket } from "@/lib/socket";

// // Define the interface for this page's data
// interface ApplicationData {
//   _id: string;
//   status: string;
//   job: {
//     _id: string;
//     jobTitle: string;
//     postedBy?: {
//       _id: string;
//       companyName: string;
//     };
//   };
// }

// // Define the shape of the data needed to open the chat
// interface ChatState {
//   room: string;
//   chatPartnerName: string;
// }

// const ManageApplications: React.FC = () => {
//   const { user: jobSeeker, token } = useUser();
//   const [applications, setApplications] = useState<ApplicationData[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [chatState, setChatState] = useState<ChatState | null>(null); // State for the chat dialog

//   useEffect(() => {
//     if (!jobSeeker || !token) {
//       setError("Please log in as a job seeker to view your applications.");
//       setIsLoading(false);
//       return;
//     }

//     const fetchApplications = async () => {
//       try {
//         const response = await apiClient.get(`/api/applications/job-seeker/${jobSeeker._id}`, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//         setApplications(response.data);
//       } catch (err) {
//         console.error("Failed to fetch applications:", err);
//         setError("Could not load your applications.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchApplications();
//   }, [jobSeeker, token]);

//   if (isLoading) return <div className="p-8 text-center">Loading...</div>;
//   if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

//   return (
//     <div className="space-y-6 p-4 md:p-8">
//       <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white text-center">
//         <h1 className="text-3xl font-bold">Manage My Applications</h1>
//       </div>

//       <div className="space-y-4">
//         {applications.length === 0 ? (
//           <p className="text-center text-muted-foreground py-10">You have not applied to any jobs yet.</p>
//         ) : (
//           applications.map((app) => (
//             <Card key={app._id}>
//               <CardHeader>
//                 <div className="flex justify-between items-start">
//                   <CardTitle>{app.job.jobTitle}</CardTitle>
//                   <Badge>{app.status}</Badge>
//                 </div>
//                 <p className="text-sm text-muted-foreground">
//                   Applied to: {app.job.postedBy?.companyName || "Confidential Company"}
//                 </p>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex justify-end space-x-2">
//                   <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> View Details</Button>
//                   <Button
//                     variant="default"
//                     size="sm"
//                     onClick={() => {
//                       setChatState({
//                         room: app._id, // The unique Application ID
//                         chatPartnerName: app.job.postedBy?.companyName || "Recruiter",
//                       });
//                     }}
//                   >
//                     <MessageSquare className="h-4 w-4 mr-1" />
//                     Message
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         )}
//       </div>

//       {/* Render the Chat Dialog */}
//       {chatState && jobSeeker && (
//         <ChatDialog
//           isOpen={!!chatState}
//           onClose={() => setChatState(null)}
//           socket={socket}
//           room={chatState.room}
//           username={jobSeeker.firstName || "Applicant"}
//           chatPartnerName={chatState.chatPartnerName}
//         />
//       )}
//     </div>
//   );
// };

// export default ManageApplications;

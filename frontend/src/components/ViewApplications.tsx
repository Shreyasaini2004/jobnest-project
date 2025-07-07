import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { jobApi } from "@/lib/api";
import { applicationApi } from "@/lib/applicationApi";
import { useUser } from "@/contexts/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const ViewApplications = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterJob, setFilterJob] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user || user.userType !== "employer") {
          setError("You must be logged in as an employer to view applications.");
          setLoading(false);
          return;
        }
        // Fetch jobs for this employer
        const jobsData = await jobApi.getJobsByEmployer(user._id);
        setJobs(jobsData);
        // Fetch applications for each job
        const allApplications: any[] = [];
        for (const job of jobsData) {
          const jobApplications = await applicationApi.getJobApplications(job.id);
          jobApplications.forEach((app: any) => {
            allApplications.push({
              ...app,
              jobTitle: job.title,
              jobId: job.id,
            });
          });
        }
        setApplications(allApplications);
      } catch (err: any) {
        setError("Failed to load applications.");
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const jobTitles = [
    ...new Set(jobs.map((job) => job.title))
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "interviewed":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 75) return "text-blue-600 bg-blue-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.jobSeeker?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobSeeker?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobSeeker?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesJob = filterJob === "all" || app.jobTitle === filterJob;
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    return matchesSearch && matchesJob && matchesStatus;
  });

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  };

  // Handler to update application status
  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      await applicationApi.updateApplicationStatus(applicationId, newStatus);
      toast({
        title: `Application ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        description: `The candidate has been marked as ${newStatus}.`,
      });
      // Optimistically update the status in the UI
      setApplications((prev) => prev.map(app => {
        if ((app._id || app.id) === applicationId) {
          return { ...app, status: newStatus };
        }
        return app;
      }));
      setIsModalOpen(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update application status.',
        variant: 'destructive',
      });
    }
  };

  if (loading) return <div className="p-8 text-center">Loading applications...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white text-center">
        <h1 className="text-3xl font-bold">View Applications</h1>
      </div>

      {/* Search & Filter */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-t-lg">
          <CardTitle className="flex items-center text-lg text-slate-800">
            <Filter className="h-5 w-5 mr-2 text-purple-600" />
            Search & Filter Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Search Candidates</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Filter by Job</label>
              <Select value={filterJob} onValueChange={setFilterJob}>
                <SelectTrigger className="border-slate-300 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobTitles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Filter by Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-slate-300 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {filteredApplications.length} Application{filteredApplications.length !== 1 ? "s" : ""} Found
          </h2>
        </div>

        {filteredApplications.map((application) => {
          // Map backend fields to UI fields
          const name = application.jobSeeker?.firstName || application.candidateName || "Unknown";
          const email = application.jobSeeker?.email || application.email || "-";
          const phone = application.jobSeeker?.phone || application.phone || "-";
          // Prefer application fields for experience/location/education, fallback to jobSeeker
          const experience = application.experience || application.jobSeeker?.experience || "-";
          const location = application.location || application.jobSeeker?.location || "-";
          const education = application.education || application.jobSeeker?.education || "-";
          const appliedDate = formatDate(application.createdAt || application.appliedDate);
          const resumeScore = typeof application.resumeScore === 'number' ? application.resumeScore : "N/A";
          return (
            <Card key={application._id || application.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-800">{name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(resumeScore)}`}>
                          ATS Score: {resumeScore}%
                        </div>
                        <Badge className={`${getStatusColor(application.status)} border`}>
                          {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-lg text-purple-600 font-semibold mb-3">{application.jobTitle}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span>Applied: {appliedDate}</span>
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{education}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{location}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-slate-400 mr-2">Experience:</span>
                        <span className="font-medium">{experience}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                    <Eye className="h-4 w-4 mr-1" />
                    View Resume
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 hover:bg-blue-50"
                    onClick={() => navigate(`/chat?receiverId=${application._id || application.id}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                    onClick={() => { setSelectedApplication(application); setIsModalOpen(true); }}>
                    Review Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Applications */}
      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No applications found</h3>
          <p className="text-slate-600">
            No applications match your current search and filter criteria.
          </p>
        </div>
      )}

      {/* Modal for reviewing application */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Detailed information about this application.
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Name:</span> {selectedApplication.jobSeeker?.firstName || selectedApplication.candidateName || "Unknown"}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {selectedApplication.jobSeeker?.email || selectedApplication.email || "-"}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {selectedApplication.jobSeeker?.phone || selectedApplication.phone || "-"}
              </div>
              <div>
                <span className="font-semibold">Experience:</span> {selectedApplication.experience || selectedApplication.jobSeeker?.experience || "-"}
              </div>
              <div>
                <span className="font-semibold">Education:</span> {selectedApplication.education || selectedApplication.jobSeeker?.education || "-"}
              </div>
              <div>
                <span className="font-semibold">Location:</span> {selectedApplication.location || selectedApplication.jobSeeker?.location || "-"}
              </div>
              <div>
                <span className="font-semibold">Applied Date:</span> {formatDate(selectedApplication.createdAt || selectedApplication.appliedDate)}
              </div>
              <div>
                <span className="font-semibold">ATS Score:</span> {typeof selectedApplication.resumeScore === 'number' ? `${selectedApplication.resumeScore}%` : 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Cover Letter:</span>
                <div className="bg-slate-50 p-3 rounded mt-1 whitespace-pre-line max-h-48 overflow-y-auto border border-slate-200 shadow-inner break-words overflow-x-hidden">
                  {selectedApplication.coverLetter || <span className="italic text-slate-400">No cover letter provided.</span>}
                </div>
              </div>
              <div>
                <span className="font-semibold">Resume URL:</span> {selectedApplication.resumeUrl ? (
                  <a href={selectedApplication.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Resume</a>
                ) : <span>-</span>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)} type="button">Close</Button>
            {selectedApplication && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate(selectedApplication._id || selectedApplication.id, 'shortlisted')}
                  className="border-green-400 text-green-700 hover:bg-green-50"
                >
                  Shortlist
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate(selectedApplication._id || selectedApplication.id, 'rejected')}
                  className="border-red-400 text-red-700 hover:bg-red-50"
                >
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewApplications;

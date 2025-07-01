import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, Clock, CheckCircle, XCircle, Eye } from "lucide-react";

const ViewStatus = () => {
  const [selectedJob, setSelectedJob] = useState("all");

  // Mock data for job postings and their status
  const jobPostings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      postedDate: "2024-01-10",
      deadline: "2024-02-10",
      totalApplications: 45,
      pending: 20,
      reviewed: 15,
      interviewed: 8,
      rejected: 2,
      status: "active"
    },
    {
      id: 2,
      title: "Backend Engineer",
      postedDate: "2024-01-08",
      deadline: "2024-02-08",
      totalApplications: 32,
      pending: 12,
      reviewed: 10,
      interviewed: 6,
      rejected: 4,
      status: "active"
    },
    {
      id: 3,
      title: "UX Designer",
      postedDate: "2024-01-05",
      deadline: "2024-02-05",
      totalApplications: 28,
      pending: 8,
      reviewed: 12,
      interviewed: 5,
      rejected: 3,
      status: "active"
    },
    {
      id: 4,
      title: "Product Manager",
      postedDate: "2023-12-20",
      deadline: "2024-01-20",
      totalApplications: 56,
      pending: 0,
      reviewed: 20,
      interviewed: 15,
      rejected: 21,
      status: "closed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredJobs = selectedJob === "all" ? jobPostings : jobPostings.filter(job => job.id.toString() === selectedJob);

  const totalStats = {
    totalJobs: jobPostings.length,
    activeJobs: jobPostings.filter(job => job.status === 'active').length,
    totalApplications: jobPostings.reduce((sum, job) => sum + job.totalApplications, 0),
    pendingReview: jobPostings.reduce((sum, job) => sum + job.pending, 0)
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white text-center">
        <h1 className="text-3xl font-bold">View Status</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalStats.totalJobs}</div>
            <div className="text-sm text-slate-600">Total Job Postings</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{totalStats.activeJobs}</div>
            <div className="text-sm text-slate-600">Active Postings</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{totalStats.totalApplications}</div>
            <div className="text-sm text-slate-600">Total Applications</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{totalStats.pendingReview}</div>
            <div className="text-sm text-slate-600">Pending Review</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50 rounded-t-lg">
          <CardTitle className="flex items-center text-lg text-slate-800">
            <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
            Job Posting Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700 mb-2 block">Filter by Job Posting</label>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger className="w-full md:w-80 border-slate-300 focus:border-green-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Job Postings</SelectItem>
                {jobPostings.map(job => (
                  <SelectItem key={job.id} value={job.id.toString()}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job Status Cards */}
      <div className="space-y-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-slate-800 mb-2">{job.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge className={`${getStatusColor(job.status)} border`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Application Statistics */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                    Application Statistics
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Applications</span>
                      <span className="font-bold text-slate-800">{job.totalApplications}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                        Pending Review
                      </span>
                      <span className="font-semibold text-yellow-600">{job.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 flex items-center">
                        <Eye className="h-3 w-3 mr-1 text-blue-500" />
                        Reviewed
                      </span>
                      <span className="font-semibold text-blue-600">{job.reviewed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Interviewed
                      </span>
                      <span className="font-semibold text-green-600">{job.interviewed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 flex items-center">
                        <XCircle className="h-3 w-3 mr-1 text-red-500" />
                        Rejected
                      </span>
                      <span className="font-semibold text-red-600">{job.rejected}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800">Application Progress</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Pending Review</span>
                        <span className="text-slate-800">{((job.pending / job.totalApplications) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(job.pending / job.totalApplications) * 100} className="h-2 bg-slate-200" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Reviewed</span>
                        <span className="text-slate-800">{((job.reviewed / job.totalApplications) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(job.reviewed / job.totalApplications) * 100} className="h-2 bg-slate-200" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Interviewed</span>
                        <span className="text-slate-800">{((job.interviewed / job.totalApplications) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(job.interviewed / job.totalApplications) * 100} className="h-2 bg-slate-200" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ViewStatus;

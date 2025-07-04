import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
} from "lucide-react";

const ViewStatus = () => {
  const [selectedJob, setSelectedJob] = useState("all");

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
      status: "active",
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
      status: "active",
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
      status: "active",
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
      status: "closed",
    },
  ];

  const filteredJobs =
    selectedJob === "all"
      ? jobPostings
      : jobPostings.filter((job) => job.id.toString() === selectedJob);

  const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 text-xs rounded-full border";
    switch (status) {
      case "active":
        return `${base} bg-green-50 text-green-700 border-green-200`;
      case "closed":
        return `${base} bg-gray-100 text-gray-700 border-gray-300`;
      default:
        return `${base} bg-muted text-muted-foreground border-border`;
    }
  };

  const totalStats = {
    totalJobs: jobPostings.length,
    activeJobs: jobPostings.filter((job) => job.status === "active").length,
    totalApplications: jobPostings.reduce(
      (sum, job) => sum + job.totalApplications,
      0
    ),
    pendingReview: jobPostings.reduce((sum, job) => sum + job.pending, 0),
  };

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold text-foreground">Application Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review the status of all job postings and candidate applications.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Total Job Postings</p>
            <h2 className="text-xl font-semibold text-foreground">
              {totalStats.totalJobs}
            </h2>
          </CardContent>
        </Card>
        <Card className="shadow-sm border">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Active Postings</p>
            <h2 className="text-xl font-semibold text-foreground">
              {totalStats.activeJobs}
            </h2>
          </CardContent>
        </Card>
        <Card className="shadow-sm border">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Total Applications</p>
            <h2 className="text-xl font-semibold text-foreground">
              {totalStats.totalApplications}
            </h2>
          </CardContent>
        </Card>
        <Card className="shadow-sm border">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <h2 className="text-xl font-semibold text-foreground">
              {totalStats.pendingReview}
            </h2>
          </CardContent>
        </Card>
      </div>

      {/* Filter Dropdown */}
      <div className="flex items-center gap-4">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Filter by Job Posting:
        </span>
        <Select value={selectedJob} onValueChange={setSelectedJob}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Job Postings</SelectItem>
            {jobPostings.map((job) => (
              <SelectItem key={job.id} value={job.id.toString()}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="shadow-sm border h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-foreground">
                    {job.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Posted: {new Date(job.postedDate).toLocaleDateString()} | Deadline:{" "}
                    {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>
                <span className={getStatusBadge(job.status)}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" /> Total Applications
                </span>
                <span className="font-medium text-foreground">
                  {job.totalApplications}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2 text-yellow-500" /> Pending Review
                </span>
                <span className="font-medium text-yellow-600">{job.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center text-muted-foreground">
                  <Eye className="h-4 w-4 mr-2 text-blue-500" /> Reviewed
                </span>
                <span className="font-medium text-blue-600">{job.reviewed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Interviewed
                </span>
                <span className="font-medium text-green-600">{job.interviewed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center text-muted-foreground">
                  <XCircle className="h-4 w-4 mr-2 text-red-500" /> Rejected
                </span>
                <span className="font-medium text-red-600">{job.rejected}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ViewStatus;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, Mail, Phone, Calendar, GraduationCap, MapPin } from "lucide-react";

const ViewApplications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJob, setFilterJob] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data for applications
  const applications = [
    {
      id: 1,
      candidateName: "Alice Johnson",
      email: "alice.johnson@email.com",
      phone: "+1 (555) 123-4567",
      jobTitle: "Senior Frontend Developer",
      appliedDate: "2024-01-15",
      status: "pending",
      experience: "5 years",
      education: "Computer Science, Stanford",
      location: "San Francisco, CA",
      resumeScore: 85
    },
    {
      id: 2,
      candidateName: "Bob Smith",
      email: "bob.smith@email.com",
      phone: "+1 (555) 987-6543",
      jobTitle: "Backend Engineer",
      appliedDate: "2024-01-14",
      status: "reviewed",
      experience: "3 years",
      education: "Software Engineering, MIT",
      location: "Boston, MA",
      resumeScore: 92
    },
    {
      id: 3,
      candidateName: "Carol Davis",
      email: "carol.davis@email.com",
      phone: "+1 (555) 456-7890",
      jobTitle: "UX Designer",
      appliedDate: "2024-01-13",
      status: "interviewed",
      experience: "4 years",
      education: "Design, RISD",
      location: "New York, NY",
      resumeScore: 78
    }
  ];

  const jobTitles = [...new Set(applications.map(app => app.jobTitle))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interviewed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = filterJob === "all" || app.jobTitle === filterJob;
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    
    return matchesSearch && matchesJob && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white text-center">
        <h1 className="text-3xl font-bold">View Applications</h1>
      </div>

      {/* Search and Filter Section */}
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
                  {jobTitles.map(title => (
                    <SelectItem key={title} value={title}>{title}</SelectItem>
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

      {/* Applications List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {filteredApplications.length} Application{filteredApplications.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        {filteredApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{application.candidateName}</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(application.resumeScore)}`}>
                        ATS Score: {application.resumeScore}%
                      </div>
                      <Badge className={`${getStatusColor(application.status)} border`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-lg text-purple-600 font-semibold mb-3">{application.jobTitle}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-slate-400" />
                      <span>{application.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-slate-400" />
                      <span>{application.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                      <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-slate-400" />
                      <span>{application.education}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      <span>{application.location}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-2">Experience:</span>
                      <span className="font-medium">{application.experience}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                  <Eye className="h-4 w-4 mr-1" />
                  View Resume
                </Button>
                <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
                  <Mail className="h-4 w-4 mr-1" />
                  Contact
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                  Review Application
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No applications found</h3>
          <p className="text-slate-600">
            No applications match your current search and filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewApplications;

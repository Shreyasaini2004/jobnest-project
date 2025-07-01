import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Building, MapPin, Clock, Eye, MessageSquare } from "lucide-react";

const ManageApplications = () => {
  const applications = [
    {
      id: 1,
      jobTitle: "Frontend Developer",
      company: "Tech Corp",
      location: "New York, NY",
      appliedDate: "2024-01-15",
      status: "Under Review",
      lastUpdate: "2 days ago",
    },
    {
      id: 2,
      jobTitle: "UX Designer",
      company: "Design Studio",
      location: "San Francisco, CA",
      appliedDate: "2024-01-10",
      status: "Interview Scheduled",
      lastUpdate: "1 week ago",
    },
    {
      id: 3,
      jobTitle: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Austin, TX",
      appliedDate: "2024-01-20",
      status: "Applied",
      lastUpdate: "3 days ago",
    },
    {
      id: 4,
      jobTitle: "Product Manager",
      company: "Innovation Labs",
      location: "Seattle, WA",
      appliedDate: "2024-01-08",
      status: "Rejected",
      lastUpdate: "5 days ago",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interview scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'interview scheduled':
        return '🎯';
      case 'under review':
        return '👀';
      case 'applied':
        return '📝';
      case 'rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-job-success/10 to-job-primary/10 rounded-xl p-8 border border-job-success/20">
        <h1 className="text-3xl font-bold text-foreground mb-3">
          📊 Track Your Applications
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Stay on top of your job search! Monitor all your applications in one place, 
          track their progress, and never miss an important update from potential employers.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {applications.filter(app => app.status === 'Applied').length}
            </div>
            <div className="text-sm text-muted-foreground">Applied</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {applications.filter(app => app.status === 'Under Review').length}
            </div>
            <div className="text-sm text-muted-foreground">Under Review</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {applications.filter(app => app.status === 'Interview Scheduled').length}
            </div>
            <div className="text-sm text-muted-foreground">Interviews</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-gradient-to-br from-job-primary/10 to-job-accent/10">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-job-primary">
              {applications.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
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
                    <Button variant="outline" size="sm" className="border-job-primary/20 hover:bg-job-primary/5">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="border-job-success/20 hover:bg-job-success/5">
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
          <Button className="bg-job-primary hover:bg-job-primary/90">
            Browse Jobs
          </Button>
        </div>
      )}
    </div>
  );
};

export default ManageApplications;

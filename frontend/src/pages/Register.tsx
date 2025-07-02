import { JobSeekerSignup } from '@/components/JobSeekerSignup';
import { Button } from "@/components/ui/button";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, User, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'job-seeker';
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    navigate(`/register?type=${value}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-job-secondary via-background to-job-secondary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-foreground mb-2">
            Join <span className="bg-gradient-to-r from-job-primary to-job-accent bg-clip-text text-transparent">JobNest</span>
          </h1>
          <p className="mt-4 text-center text-lg text-muted-foreground">
            Create your account to get started
          </p>
        </div>
        
        <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border/50">
          <Tabs 
            value={userType} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-muted/50 h-14">
              <TabsTrigger 
                value="job-seeker" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4" />
                Job Seeker
              </TabsTrigger>
              <TabsTrigger 
                value="employer" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Briefcase className="h-4 w-4" />
                Employer
              </TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="job-seeker">
                <div className="py-4 text-center">
                  <User className="h-12 w-12 mx-auto text-job-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Job Seeker Sign Up</h3>
                  <p className="text-muted-foreground mb-6">
                    Create an account to find your dream job and advance your career
                  </p>
                  <JobSeekerSignup userType="job-seeker" />
                </div>
              </TabsContent>
              <TabsContent value="employer">
                <div className="py-4 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-job-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Employer Sign Up</h3>
                  <p className="text-muted-foreground mb-6">
                    Create an employer account to post jobs and find top talent
                  </p>
                  <JobSeekerSignup userType="employer" />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        <div className="text-center">
          <Button 
            variant="ghost" 
            className="text-job-primary hover:bg-job-primary/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to previous page
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-job-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

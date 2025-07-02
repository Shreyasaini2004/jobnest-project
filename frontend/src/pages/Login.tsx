import { JobSeekerLogin } from '@/components/JobSeekerLogin';
import { EmployerLogin } from '@/components/EmployerLogin';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import { User, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTab = params.get('tab') === 'employer' ? 'employer' : 'job-seeker';
  const [tab, setTab] = useState<'job-seeker' | 'employer'>(initialTab);

  useEffect(() => {
    const paramTab = params.get('tab');
    if (paramTab === 'employer' && tab !== 'employer') setTab('employer');
    if (paramTab === 'job-seeker' && tab !== 'job-seeker') setTab('job-seeker');
    // eslint-disable-next-line
  }, [location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background image and overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://cbx-prod.b-cdn.net/COLOURBOX53912236.jpg?width=800&height=800&quality=70)',
          filter: 'blur(2px) brightness(0.7)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/80 via-white/60 to-white/80" />
      <div className="w-full max-w-md space-y-8 relative z-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-foreground mb-2">
            Welcome to <span className="bg-gradient-to-r from-job-primary to-job-accent bg-clip-text text-transparent">JobNest</span>
          </h1>
          <p className="mt-4 text-center text-lg text-muted-foreground">
            Sign in to continue your job search journey
          </p>
        </div>
        <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/50 relative animate-fade-in">
          <div className="flex bg-muted/50">
            <button
              className={`flex-1 py-4 text-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${tab === 'job-seeker' ? 'text-job-primary bg-background shadow-md z-10' : 'text-muted-foreground bg-muted/50'}`}
              style={{ borderBottom: tab === 'job-seeker' ? '3px solid var(--job-primary)' : 'none', borderTopLeftRadius: 18 }}
              onClick={() => setTab('job-seeker')}
            >
              <User className="h-5 w-5" />
              Job Seeker
            </button>
            <button
              className={`flex-1 py-4 text-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${tab === 'employer' ? 'text-job-primary bg-background shadow-md z-10' : 'text-muted-foreground bg-muted/50'}`}
              style={{ borderBottom: tab === 'employer' ? '3px solid var(--job-primary)' : 'none', borderTopRightRadius: 18 }}
              onClick={() => setTab('employer')}
            >
              <Briefcase className="h-5 w-5" />
              Employer
            </button>
          </div>
          <div className="px-8 pt-4 pb-2 text-center border-b border-border/30 bg-background">
            {tab === 'job-seeker' ? (
              <span className="text-xs text-muted-foreground">Find your dream job and advance your career</span>
            ) : (
              <span className="text-xs text-muted-foreground">Post jobs and find talented candidates</span>
            )}
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent mb-2" />
          <div className="px-2 py-2 animate-fade-in">
            {tab === 'job-seeker' ? <JobSeekerLogin /> : <EmployerLogin />}
          </div>
          <div className="px-8 pb-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to={`/register?type=${tab}`} className="font-medium text-job-primary hover:underline">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
        <div className="text-center">
          <Button 
            variant="outline" 
            className="w-full max-w-xs mx-auto border-job-primary/30 text-job-primary hover:bg-job-primary/10 hover:border-job-primary/50 transition-colors"
            asChild
          >
            <Link to="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SUBSCRIBE_API_URL =
  (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development')
    ? '/api/users/subscribe'
    : 'https://jobnest-project.onrender.com/api/users/subscribe';

const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validateEmail = (email: string) =>
    /^\S+@\S+\.\S+$/.test(email);

  const handleGetStarted = () => {
    navigate('/register?type=job-seeker');
  };

  const handleRequestDemo = () => {
    navigate('/register?type=employer');
  };

  const handleUpgrade = () => {
    toast({
      title: "Premium Features",
      description: "Premium features are coming soon! Stay tuned for advanced AI-powered job matching and career tools.",
      variant: "default",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch(SUBSCRIBE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setMessage('Subscribed! Check your email for confirmation.');
        setEmail('');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Subscription failed.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-job-primary/5 to-job-accent/5 z-0"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-job-primary/10 rounded-full blur-3xl z-0"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-job-accent/10 rounded-full blur-3xl z-0"></div>
      
      {/* Diagonal lines decoration */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-gradient-to-r from-job-primary/0 via-job-primary/20 to-job-primary/0 h-px" 
              style={{
                width: '140%',
                left: '-20%',
                top: `${i * 12.5}%`,
                transform: 'rotate(-12deg)'
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-card border border-border/40 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-job-primary/10 text-job-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Job Matching</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Ready to transform your <span className="text-job-primary">career journey</span>?
              </h2>
              
              <p className="text-muted-foreground mb-8 text-lg">
                Join thousands of professionals who've found their dream jobs through JobNest's intelligent matching algorithm.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-job-primary hover:bg-job-primary/90 text-white px-8 py-6 h-auto text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  onClick={handleGetStarted}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-job-primary/30 text-job-primary hover:bg-job-primary/10 px-8 py-6 h-auto text-base"
                  onClick={handleRequestDemo}
                >
                  Request Demo
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground/70 mt-4">
                No credit card required. Free plan includes up to 10 job applications per month.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-job-accent/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-job-primary/20 rounded-full blur-xl"></div>
              
              <div className="bg-gradient-to-br from-background to-job-secondary/10 border border-border/40 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-job-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-job-primary font-bold">JN</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">JobNest Premium</h3>
                    <p className="text-sm text-muted-foreground">Unlock advanced features</p>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {[
                    "AI Resume Optimization",
                    "Priority Application Boosting",
                    "Advanced Skills Assessment",
                    "1-on-1 Career Coaching",
                    "Exclusive Job Listings"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">$19</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                
                <Button 
                  className="w-full bg-job-accent hover:bg-job-accent/90"
                  onClick={handleUpgrade}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">Trusted by leading companies worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {[
              "Microsoft", "Google", "Amazon", "Meta", "Salesforce", "Adobe"
            ].map((company, index) => (
              <div key={index} className="text-muted-foreground/70 font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
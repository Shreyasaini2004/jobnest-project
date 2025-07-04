
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Twitter, Linkedin, Github, Mail, ArrowRight, Globe, MapPin, Phone, Shield, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-background to-job-secondary/10 border-t border-border">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-12 border-b border-border/30">
        <div className="max-w-6xl mx-auto bg-card rounded-2xl shadow-lg p-8 border border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="outline" className="mb-4 px-3 py-1 bg-job-secondary/20 text-job-primary border-job-primary/20">
                Stay Updated
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Get job alerts that match your profile</h3>
              <p className="text-muted-foreground">
                Be the first to know about new opportunities. No spam, just relevant jobs tailored to your skills and preferences.
              </p>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input 
                    placeholder="Enter your email" 
                    className="pl-4 pr-4 py-6 text-base border-border/50 focus:ring-job-primary/30 rounded-lg"
                  />
                </div>
                <Button className="py-6 px-8 text-base bg-job-primary hover:bg-job-primary/90 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/70 mt-3">
                By subscribing, you agree to our <a href="#" className="underline hover:text-job-primary">Privacy Policy</a> and <a href="#" className="underline hover:text-job-primary">Terms of Service</a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-job-primary to-job-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">JN</span>
              </div>
              <span className="text-xl font-bold text-foreground">JobNest</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connecting talented professionals with their dream careers. Your next opportunity awaits on our AI-powered job platform.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" className="rounded-full hover:bg-job-primary/10 hover:text-job-primary hover:border-job-primary/30">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full hover:bg-job-primary/10 hover:text-job-primary hover:border-job-primary/30">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full hover:bg-job-primary/10 hover:text-job-primary hover:border-job-primary/30">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full hover:bg-job-primary/10 hover:text-job-primary hover:border-job-primary/30">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* For Job Seekers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg">For Job Seekers</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="hover:text-job-primary transition-colors cursor-pointer">View Openings</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">Saved Jobs & Reminders</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">Manage Applications</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">ATS Score Analysis</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">Saved Analyses</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">Career Resources</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">Skill Assessments</li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg">For Employers</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="hover:text-job-primary transition-colors cursor-pointer">Post Openings</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">View Applications</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">View Status</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">Calendar & Events</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">Candidate Matching</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">Company Branding</li>
              <li className="hover:text-job-primary transition-colors cursor-pointer">Analytics Dashboard</li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg">Contact & Legal</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-job-primary mt-0.5" />
                <span className="text-muted-foreground">123 Innovation Drive<br />San Francisco, CA 94103</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-job-primary" />
                <span className="text-muted-foreground hover:text-job-primary transition-colors cursor-pointer">support@jobnest.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-job-primary" />
                <span className="text-muted-foreground">(555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2 pt-2">
                <Shield className="h-4 w-4 text-job-primary" />
                <span className="text-muted-foreground hover:text-job-primary transition-colors cursor-pointer">Privacy Policy</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-job-primary" />
                <span className="text-muted-foreground hover:text-job-primary transition-colors cursor-pointer">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 opacity-30" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4 text-red-500" />
            <p>© 2025 JobNest. Made with passion for job seekers and employers.</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-job-primary transition-colors">Accessibility</a>
            <a href="#" className="hover:text-job-primary transition-colors">Sitemap</a>
            <a href="#" className="hover:text-job-primary transition-colors">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

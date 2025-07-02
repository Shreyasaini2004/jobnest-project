
import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageSquare, Shield, BarChart3, Users, Zap } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: Search,
      title: "Intelligent Job Matching",
      description: "AI-powered algorithms match candidates with the perfect job opportunities based on skills and preferences."
    },
    {
      icon: MessageSquare,
      title: "Real-time Messaging",
      description: "Seamless communication between job seekers and recruiters with instant messaging capabilities."
    },
    {
      icon: Shield,
      title: "Secure Payment Integration",
      description: "Safe and secure payment processing for premium features and services."
    },
    {
      icon: BarChart3,
      title: "Live Analytics Dashboard",
      description: "Visual dashboards showing application progress, job statistics, and performance metrics."
    },
    {
      icon: Users,
      title: "Company Branding",
      description: "Comprehensive company profiles with branding options to attract top talent."
    },
    {
      icon: Zap,
      title: "Resume Parsing",
      description: "Advanced resume parsing technology that extracts and analyzes candidate information automatically."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-job-secondary/20 via-background to-job-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            What is 
            <span className="bg-gradient-to-r from-job-primary to-job-accent bg-clip-text text-transparent"> JobNest</span>
            ?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Whether you're a job seeker searching for your next big opportunity or an employer looking to hire top talent, JobNest bridges the gap with powerful, modern tools.
          </p>
          <p className="text-base text-bold md:text-lg text-muted-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
            Discover smarter hiring. Experience effortless job searching. Welcome to JobNest.
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-job-primary to-job-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-job-primary transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  type: "job-seeker" | "employer";
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "TechCorp",
    avatar: "/avatars/sarah.jpg",
    content: "JobNest's AI matching helped me find a role that perfectly aligned with my skills and career goals. I received 3 interview requests within my first week!",
    rating: 5,
    type: "job-seeker"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "HR Director",
    company: "Innovate Inc",
    avatar: "/avatars/michael.jpg",
    content: "As a hiring manager, JobNest has revolutionized our recruitment process. The quality of candidates and the speed at which we fill positions has improved dramatically.",
    rating: 5,
    type: "employer"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Marketing Specialist",
    company: "BrandWave",
    avatar: "/avatars/emily.jpg",
    content: "The ATS Score Analysis feature was a game-changer for my job search. I optimized my resume based on the insights and landed my dream job within a month!",
    rating: 5,
    type: "job-seeker"
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Talent Acquisition",
    company: "Global Solutions",
    avatar: "/avatars/david.jpg",
    content: "JobNest's employer dashboard provides incredible insights into our hiring pipeline. The analytics have helped us refine our job descriptions and improve candidate quality.",
    rating: 4,
    type: "employer"
  },
  {
    id: 5,
    name: "Priya Patel",
    role: "UX Designer",
    company: "DesignHub",
    avatar: "/avatars/priya.jpg",
    content: "The job matching algorithm is surprisingly accurate! I was skeptical at first, but JobNest recommended positions that truly matched my experience and career aspirations.",
    rating: 5,
    type: "job-seeker"
  },
  {
    id: 6,
    name: "James Thompson",
    role: "CEO",
    company: "StartupX",
    avatar: "/avatars/james.jpg",
    content: "As a startup founder, finding the right talent is crucial. JobNest has been instrumental in helping us build our team with candidates who not only have the skills but also align with our company culture.",
    rating: 5,
    type: "employer"
  }
];

const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ));
  };

  return (
    <section className="py-20 overflow-hidden bg-gradient-to-b from-background to-job-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-4 px-3 py-1 bg-job-secondary/20 text-job-primary border-job-primary/20">
            Success Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">What our users are saying</h2>
          <p className="text-muted-foreground">
            Join thousands of job seekers and employers who have transformed their hiring and job search experience with JobNest.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-job-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-job-accent/5 rounded-full blur-3xl"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Featured testimonial */}
            <div 
              className={`bg-card border border-border/40 rounded-2xl p-8 shadow-lg transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-job-primary/20">
                    <AvatarImage src={testimonials[activeIndex].avatar} alt={testimonials[activeIndex].name} />
                    <AvatarFallback className="bg-job-primary/10 text-job-primary">
                      {testimonials[activeIndex].name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-lg">{testimonials[activeIndex].name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonials[activeIndex].role}</p>
                    <p className="text-sm font-medium text-job-primary">{testimonials[activeIndex].company}</p>
                  </div>
                </div>
                <Badge variant={testimonials[activeIndex].type === "job-seeker" ? "secondary" : "outline"} className="px-3 py-1">
                  {testimonials[activeIndex].type === "job-seeker" ? "Job Seeker" : "Employer"}
                </Badge>
              </div>
              
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-job-primary/20 rotate-180" />
                <p className="text-foreground text-lg leading-relaxed pl-6 mb-6">
                  {testimonials[activeIndex].content}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex">{renderStars(testimonials[activeIndex].rating)}</div>
                <span className="text-sm text-muted-foreground">{testimonials[activeIndex].rating}.0 out of 5</span>
              </div>
            </div>
            
            {/* Testimonial grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testimonials
                .filter((_, index) => index !== activeIndex)
                .slice(0, 4)
                .map((testimonial, index) => (
                  <div 
                    key={testimonial.id}
                    className={`bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-5 shadow-md cursor-pointer hover:shadow-lg transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                    onClick={() => setActiveIndex(testimonials.findIndex(t => t.id === testimonial.id))}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-job-primary/10 text-job-primary">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h5 className="font-medium text-sm">{testimonial.name}</h5>
                        <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{testimonial.content}</p>
                    <div className="flex mt-3">{renderStars(testimonial.rating)}</div>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Testimonial navigation dots */}
          <div className="flex justify-center mt-10 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-job-primary w-6' : 'bg-job-primary/30'}`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center gap-4 flex-wrap">
            <span className="text-lg font-semibold text-foreground">Trusted by leading companies:</span>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="text-muted-foreground/70 font-semibold">Microsoft</div>
              <div className="text-muted-foreground/70 font-semibold">Google</div>
              <div className="text-muted-foreground/70 font-semibold">Amazon</div>
              <div className="text-muted-foreground/70 font-semibold">Meta</div>
              <div className="text-muted-foreground/70 font-semibold">Salesforce</div>
              <div className="text-muted-foreground/70 font-semibold">Adobe</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
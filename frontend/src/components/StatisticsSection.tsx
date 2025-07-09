import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, Building, Award, TrendingUp } from "lucide-react";

interface StatProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  color: string;
  delay?: number;
}

const StatCard = ({
  icon,
  value,
  label,
  prefix = "",
  suffix = "",
  color,
  delay = 0,
}: StatProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const startTimestamp = performance.now();

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easedProgress * value));

      if (progress < 1) requestAnimationFrame(step);
      else setCount(value);
    };

    setTimeout(() => {
      requestAnimationFrame(step);
    }, delay);
  }, [isVisible, value, delay]);

  return (
    <div
      ref={ref}
      className={`bg-card border border-border/40 rounded-xl p-6 shadow-md transform transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-foreground">{prefix}</span>
            <span className={`${color}`}>{count.toLocaleString()}</span>
            <span className="text-foreground">{suffix}</span>
          </h3>
          <p className="text-muted-foreground">{label}</p>
        </div>
        <div
          className={`p-3 rounded-lg ${color
            .replace("text-", "bg-")
            .replace("primary", "primary/10")
            .replace("job-", "job-")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatisticsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-job-primary/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <Badge className="mb-4 px-3 py-1 bg-job-primary/10 text-job-primary border border-job-primary/20">
            By The Numbers
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Powering the future of hiring
          </h2>
          <p className="text-muted-foreground">
            JobNest is transforming how companies hire and how people find their dream jobs with our AI-powered platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Briefcase className="h-6 w-6 text-job-primary" />}
            value={250000}
            label="Active Job Listings"
            color="text-job-primary"
            delay={0}
          />
          <StatCard
            icon={<Users className="h-6 w-6 text-job-accent" />}
            value={1500000}
            label="Registered Job Seekers"
            color="text-job-accent"
            delay={200}
          />
          <StatCard
            icon={<Building className="h-6 w-6 text-emerald-500" />}
            value={50000}
            label="Partner Companies"
            color="text-emerald-500"
            delay={400}
          />
          <StatCard
            icon={<Award className="h-6 w-6 text-amber-500" />}
            value={92}
            suffix="%"
            label="Satisfaction Rate"
            color="text-amber-500"
            delay={600}
          />
        </div>

        {/* Growth Metrics Section */}
        <div className="mt-16 bg-white border border-border rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left */}
            <div className="md:w-1/2">
              <Badge className="mb-4 px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200">
                Growth Metrics
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Accelerating career success
              </h3>
              <p className="text-muted-foreground mb-6">
                Our AI-powered matching algorithm has helped thousands of professionals find their ideal positions faster than traditional job boards.
              </p>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-4xl font-bold text-black">
                    68<span className="text-lg">%</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Faster hiring time</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-black">
                    3.2<span className="text-lg">x</span>
                  </p>
                  <p className="text-sm text-muted-foreground">More relevant matches</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-black">
                    42<span className="text-lg">%</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Higher retention</p>
                </div>
              </div>
            </div>

            {/* Right (Bar Chart) */}
            <div className="md:w-1/2 bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">Monthly Job Placements</h4>
                <div className="flex items-center gap-1 text-emerald-500 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
                  <span>+24.8%</span>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-48 flex items-end gap-2">
                {[35, 45, 55, 40, 60, 75, 65, 90, 85, 95, 80, 100].map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-purple-600 rounded-t-md transition-all duration-700 ease-out"
                      style={{
                        height: `${(height / 100) * 192}px`,
                        minHeight: "8px",
                      }}
                    />
                    <span className="text-xs text-muted-foreground mt-1">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground text-center mt-2">
                Last 12 months
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;

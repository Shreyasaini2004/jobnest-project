import JobCard from "./JobCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedJobs = () => {
  const featuredJobs = [
    {
      id: "job1",
      title: "Senior React Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      salary: "$120k - $160k",
      type: "Full Time",
      posted: "2 days ago",
      description: "Join our innovative team building next-generation web applications using React, TypeScript, and modern development practices. Work on challenging projects that impact millions of users.",
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
      featured: true
    },
    {
      id: "job2",
      title: "Product Manager",
      company: "StartupXYZ",
      location: "Remote",
      salary: "$100k - $140k",
      type: "Full Time",
      posted: "1 day ago",
      description: "Lead product strategy and development for our cutting-edge SaaS platform. Collaborate with engineering, design, and stakeholders to deliver exceptional user experiences.",
      skills: ["Product Strategy", "Analytics", "Agile", "Figma"],
      featured: true
    },
    {
      id: "job3",
      title: "UX/UI Designer",
      company: "DesignStudio",
      location: "New York, NY",
      salary: "$85k - $110k",
      type: "Full Time",
      posted: "3 days ago",
      description: "Create beautiful, intuitive user experiences for web and mobile applications. Work closely with product and engineering teams to bring designs to life.",
      skills: ["Figma", "Sketch", "Prototyping", "User Research"],
      featured: true
    },
    {
      id: "job4",
      title: "Data Scientist",
      company: "DataCorp",
      location: "Seattle, WA",
      salary: "$110k - $150k",
      type: "Full Time",
      posted: "4 days ago",
      description: "Apply machine learning and statistical analysis to solve complex business problems. Work with large datasets to drive data-driven decision making.",
      skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
      featured: true
    },
    {
      id: "job5",
      title: "DevOps Engineer",
      company: "CloudTech",
      location: "Austin, TX",
      salary: "$105k - $135k",
      type: "Full Time",
      posted: "5 days ago",
      description: "Build and maintain scalable infrastructure using cloud technologies. Implement CI/CD pipelines and ensure high availability of our services.",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
      featured: true
    },
    {
      id: "job6",
      title: "Marketing Manager",
      company: "GrowthCo",
      location: "Los Angeles, CA",
      salary: "$75k - $95k",
      type: "Full Time",
      posted: "1 week ago",
      description: "Drive marketing initiatives to increase brand awareness and customer acquisition. Develop and execute comprehensive marketing strategies across multiple channels.",
      skills: ["Digital Marketing", "Analytics", "Content Strategy", "SEO"],
      featured: true
    }
  ];

  return (
    <section className="py-16 bg-job-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Jobs
            </h2>
            <p className="text-lg text-muted-foreground">
              Hand-picked opportunities from top companies.
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex items-center gap-2">
            View All Jobs
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job, index) => (
            <JobCard
              key={index}
              id={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              salary={job.salary}
              type={job.type}
              posted={job.posted}
              description={job.description}
              skills={job.skills}
              featured={job.featured}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button className="bg-job-primary hover:bg-job-primary/90 text-white px-8 py-3">
            <ArrowRight className="h-4 w-4 mr-2" />
            View All Featured Jobs
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
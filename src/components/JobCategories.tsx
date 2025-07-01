import CategoryCard from "./CategoryCard";
import { Code, Palette, BarChart3, Megaphone, Shield, Users, Wrench, Heart } from "lucide-react";

const JobCategories = () => {
  const categories = [
    {
      title: "Technology",
      jobCount: 12543,
      icon: Code,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Design",
      jobCount: 3421,
      icon: Palette,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      title: "Marketing",
      jobCount: 5632,
      icon: Megaphone,
      gradient: "bg-gradient-to-br from-orange-500 to-red-500"
    },
    {
      title: "Sales",
      jobCount: 4123,
      icon: BarChart3,
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500"
    },
    {
      title: "Security",
      jobCount: 2341,
      icon: Shield,
      gradient: "bg-gradient-to-br from-gray-600 to-gray-700"
    },
    {
      title: "Human Resources",
      jobCount: 1876,
      icon: Users,
      gradient: "bg-gradient-to-br from-teal-500 to-cyan-500"
    },
    {
      title: "Operations",
      jobCount: 3254,
      icon: Wrench,
      gradient: "bg-gradient-to-br from-indigo-500 to-purple-600"
    },
    {
      title: "Healthcare",
      jobCount: 6789,
      icon: Heart,
      gradient: "bg-gradient-to-br from-pink-500 to-rose-500"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explore Jobs by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover opportunities across various industries and find the perfect role that matches your expertise.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.title}
              title={category.title}
              jobCount={category.jobCount}
              icon={category.icon}
              gradient={category.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobCategories;
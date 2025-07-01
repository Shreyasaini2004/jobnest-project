import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  jobCount: number;
  icon: LucideIcon;
  gradient: string;
}

const CategoryCard = ({ title, jobCount, icon: Icon, gradient }: CategoryCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1">
      <CardContent className="p-6 text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-job-primary transition-colors">
          {title}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {jobCount.toLocaleString()} jobs
        </Badge>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
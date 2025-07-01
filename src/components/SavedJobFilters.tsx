import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface SavedJobFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  showRemindersOnly: boolean;
  setShowRemindersOnly: (value: boolean) => void;
}

const SavedJobFilters = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  showRemindersOnly,
  setShowRemindersOnly,
}: SavedJobFiltersProps) => {
  return (
    <div className="bg-card rounded-lg p-6 border shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Search Saved Jobs
          </label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="w-full lg:w-48">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Job Type
          </label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full lg:w-auto flex items-center gap-2 pt-2">
          <Switch 
            id="reminder-filter" 
            checked={showRemindersOnly}
            onCheckedChange={setShowRemindersOnly}
          />
          <Label htmlFor="reminder-filter">Show jobs with reminders only</Label>
        </div>
      </div>
    </div>
  );
};

export default SavedJobFilters;
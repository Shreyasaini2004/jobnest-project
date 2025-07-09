import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CalendarPlus, CheckCircle2, AlertTriangle } from "lucide-react";
import { eventApi } from "@/lib/eventApi";

const eventTypes = [
  { value: "job-fair", label: "Job Fair" },
  { value: "webinar", label: "Webinar" },
  { value: "other", label: "Other" },
];

export default function CreateEvent() {
  const [form, setForm] = useState<{
    title: string;
    date: string;
    type: "job-fair" | "webinar" | "other";
    description: string;
    meetingLink: string;
  }>({
    title: "",
    date: "",
    type: "job-fair",
    description: "",
    meetingLink: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    setForm({ ...form, type: value as "job-fair" | "webinar" | "other" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (!form.title || !form.date || !form.type) {
      setError("Title, date, and type are required.");
      setLoading(false);
      return;
    }
    try {
      await eventApi.createEvent({
        title: form.title,
        date: new Date(form.date),
        type: form.type,
        description: form.description,
        meetingLink: form.meetingLink,
        // createdBy will be set by backend (from auth)
      });
      setSuccess(true);
      setForm({ title: "", date: "", type: "job-fair", description: "", meetingLink: "" });
    } catch (err) {
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-xl mx-auto w-full">
      <Card className="rounded-2xl shadow-lg p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-2xl">
            <CalendarPlus className="h-6 w-6 text-blue-400" /> Create New Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              name="title"
              placeholder="Event Title"
              value={form.title}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <Input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <Select value={form.type} onValueChange={handleTypeChange} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((et) => (
                  <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              name="description"
              placeholder="Event Description (optional)"
              value={form.description}
              onChange={handleChange}
              disabled={loading}
              rows={3}
            />
            <Input
              name="meetingLink"
              placeholder="Meeting Link (optional)"
              value={form.meetingLink}
              onChange={handleChange}
              disabled={loading}
            />
            {error && (
              <div className="flex items-center text-red-500 text-sm gap-2">
                <AlertTriangle className="h-4 w-4" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center text-green-600 text-sm gap-2">
                <CheckCircle2 className="h-4 w-4" /> Event created successfully!
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
              Create Event
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
} 
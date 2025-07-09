import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Edit, Trash2, Save, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { eventApi } from "@/lib/eventApi";
import { format } from "date-fns";

const eventTypes = [
  { value: "job-fair", label: "Job Fair" },
  { value: "webinar", label: "Webinar" },
  { value: "other", label: "Other" },
];

export default function MyEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventApi.getMyEvents?.() || await eventApi.getEvents(); // fallback if getMyEvents not implemented
      setEvents(res);
    } catch (err) {
      setError("Failed to fetch your events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, []);

  const startEdit = (event: any) => {
    setEditId(event._id || event.id);
    setEditForm({
      title: event.title,
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      type: event.type,
      description: event.description || "",
      meetingLink: event.meetingLink || "",
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    setEditForm({ ...editForm, type: value });
  };

  const saveEdit = async (id: string) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await eventApi.updateEvent(id, {
        ...editForm,
        date: new Date(editForm.date),
      });
      setSuccess("Event updated!");
      setEditId(null);
      fetchEvents();
    } catch (err) {
      setError("Failed to update event.");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await eventApi.deleteEvent(id);
      setSuccess("Event deleted!");
      fetchEvents();
    } catch (err) {
      setError("Failed to delete event.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto w-full">
      <Card className="rounded-2xl shadow-lg p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 text-2xl">
            My Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : error ? (
            <div className="flex items-center text-red-500 text-sm gap-2">
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          ) : (
            <ul className="space-y-6">
              {events.length === 0 && <li className="text-muted-foreground">No events found.</li>}
              {events.map((event) => (
                <li key={event._id || event.id} className="bg-blue-50/60 dark:bg-blue-900/30 rounded-xl p-4 flex flex-col gap-2">
                  {editId === (event._id || event.id) ? (
                    <form className="space-y-2" onSubmit={e => { e.preventDefault(); saveEdit(event._id || event.id); }}>
                      <Input name="title" value={editForm.title} onChange={handleEditChange} required disabled={actionLoading} />
                      <Input name="date" type="date" value={editForm.date} onChange={handleEditChange} required disabled={actionLoading} />
                      <Select value={editForm.type} onValueChange={handleTypeChange} disabled={actionLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Event Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map((et) => (
                            <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea name="description" value={editForm.description} onChange={handleEditChange} rows={2} disabled={actionLoading} />
                      <Input name="meetingLink" value={editForm.meetingLink} onChange={handleEditChange} disabled={actionLoading} />
                      <div className="flex gap-2 mt-2">
                        <Button type="submit" size="sm" disabled={actionLoading}><Save className="h-4 w-4 mr-1" /> Save</Button>
                        <Button type="button" size="sm" variant="secondary" onClick={cancelEdit} disabled={actionLoading}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-blue-900 text-lg">{event.title}</span>
                      <span className="text-xs text-blue-400">{format(new Date(event.date), 'PPPP')}</span>
                      <span className="text-xs text-blue-700">{event.description}</span>
                      <span className="text-xs text-blue-500">{event.meetingLink}</span>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(event)} disabled={actionLoading}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteEvent(event._id || event.id)} disabled={actionLoading}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {success && (
            <div className="flex items-center text-green-600 text-sm gap-2 mt-4">
              <CheckCircle2 className="h-4 w-4" /> {success}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
} 
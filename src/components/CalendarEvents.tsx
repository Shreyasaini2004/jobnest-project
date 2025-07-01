import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEvents, Event } from '@/contexts/EventContext';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  GraduationCap,
  Trash2,
  Edit,
  ExternalLink,
  Bell
} from 'lucide-react';
import { format, isToday, isTomorrow, isSameDay } from 'date-fns';

const CalendarEvents = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { events, addEvent, removeEvent } = useEvents();
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    type: 'job-fair',
    description: '',
    meetingLink: ''
  });

  // Get events for the selected date
  const selectedDateEvents = useMemo(() => {
    if (!date) return [];
    return events.filter(event => isSameDay(event.date, date));
  }, [events, date]);

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return events
      .filter(event => event.date >= today && event.date <= nextWeek)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [events]);

  const handleCreateEvent = () => {
    if (!date || !newEvent.title) return;

    addEvent({
      date: date,
      title: newEvent.title,
      type: newEvent.type as 'job-fair' | 'webinar',
      meetingLink: newEvent.meetingLink,
      description: newEvent.description
    });

    setShowEventForm(false);
    setNewEvent({
      title: '',
      type: 'job-fair',
      description: '',
      meetingLink: ''
    });
  };

  const formatEventDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd, yyyy');
  };

  const formatEventTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const getEventTypeIcon = (type: string) => {
    return type === 'job-fair' ? <Users className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />;
  };

  const getEventTypeColor = (type: string) => {
    return type === 'job-fair' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar & Events</h1>
          <p className="text-muted-foreground mt-1">Manage your events and schedule</p>
        </div>
        <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
          <DialogTrigger asChild>
            <Button className="bg-job-primary hover:bg-job-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Schedule a new job fair or webinar event.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, type: value as 'job-fair' | 'webinar' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job-fair">Job Fair</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                <Input
                  id="meetingLink"
                  value={newEvent.meetingLink}
                  onChange={(e) => setNewEvent({ ...newEvent, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEventForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent} disabled={!newEvent.title}>
                Create Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  event: (date) => events.some(event => isSameDay(event.date, date))
                }}
                modifiersStyles={{
                  event: { backgroundColor: '#3b82f6', color: 'white' }
                }}
              />
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {date ? formatEventDate(date) : 'Select a date'} Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events scheduled for this date</p>
                  <p className="text-sm">Click "Create Event" to add one</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          {getEventTypeIcon(event.type)}
                          <div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">{formatEventTime(event.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getEventTypeColor(event.type)}>
                            {event.type === 'job-fair' ? 'Job Fair' : 'Webinar'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEvent(event.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                      )}
                      {event.meetingLink && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Events</span>
                <span className="font-semibold">{events.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="font-semibold">{upcomingEvents.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Job Fairs</span>
                <span className="font-semibold">{events.filter(e => e.type === 'job-fair').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Webinars</span>
                <span className="font-semibold">{events.filter(e => e.type === 'webinar').length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-job-primary pl-3 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">{formatEventDate(event.date)}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${getEventTypeColor(event.type)}`}>
                          {event.type === 'job-fair' ? 'Job Fair' : 'Webinar'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarEvents;
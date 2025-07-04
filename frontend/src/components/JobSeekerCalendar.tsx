import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar as CalendarIcon, Loader2, AlertTriangle, CalendarPlus, Users, Video } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { useEvents } from "@/contexts/EventContext";
import { eventApi } from "@/lib/eventApi";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

// Helper to check if two dates are the same day
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getEventTypeBadge(type: string) {
  if (type === "job-fair") return <Badge className="bg-green-100 text-green-700 flex items-center gap-1"><Users className="h-3 w-3" /> Job Fair</Badge>;
  if (type === "webinar") return <Badge className="bg-purple-100 text-purple-700 flex items-center gap-1"><Video className="h-3 w-3" /> Webinar</Badge>;
  return <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Event</Badge>;
}

function getGoogleCalendarUrl(event: any) {
  const start = format(new Date(event.date), "yyyyMMdd'T'HHmmss");
  const end = format(new Date(new Date(event.date).getTime() + 60 * 60 * 1000), "yyyyMMdd'T'HHmmss");
  const details = encodeURIComponent(event.description || "");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${details}`;
}

// Custom Day cell with event marker
function CustomDay({ date, eventsForDay, today, onShowEvents }: { date: Date, eventsForDay: any[], today: boolean, onShowEvents: (date: Date, events: any[]) => void }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200
              ${today ? 'ring-2 ring-blue-500 bg-blue-50 font-bold' : ''}
              ${eventsForDay.length > 0 ? 'hover:bg-blue-100' : ''}
            `}
            onClick={eventsForDay.length > 0 ? () => onShowEvents(date, eventsForDay) : undefined}
            type="button"
          >
            {date.getDate()}
            {eventsForDay.length > 0 && (
              <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${eventsForDay[0].type === 'job-fair' ? 'bg-green-500' : eventsForDay[0].type === 'webinar' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
            )}
          </button>
        </TooltipTrigger>
        {eventsForDay.length > 0 && (
          <TooltipContent side="top" className="z-50 min-w-[180px]">
            <div className="space-y-2">
              {eventsForDay.map((event, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <span className="font-medium text-blue-900 flex items-center gap-2">{event.title} {getEventTypeBadge(event.type)}</span>
                  <span className="text-xs text-blue-400">{format(new Date(event.date), 'PPPP')}</span>
                  <Button asChild variant="ghost" size="sm" className="w-fit px-2 py-1 mt-1 text-xs gap-1">
                    <a href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                      <CalendarPlus className="h-4 w-4" /> Add to Google Calendar
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

// Presentational component
function CalendarView({ events, onShowEvents }: { events: any[], onShowEvents: (date: Date, events: any[]) => void }) {
  const today = new Date();
  const eventDates = useMemo(() => events.map(e => new Date(e.date)), [events]);
  const modifiers = {
    event: (date: Date) => eventDates.some(d => isSameDay(d, date)),
    today: (date: Date) => isSameDay(date, today),
  };
  // For legend
  const hasJobFair = events.some(e => e.type === "job-fair");
  const hasWebinar = events.some(e => e.type === "webinar");

  // Custom Day renderer
  const renderDay = (date: Date) => {
    const eventsForDay = events.filter(e => isSameDay(new Date(e.date), date));
    return <CustomDay date={date} eventsForDay={eventsForDay} today={isSameDay(date, today)} onShowEvents={onShowEvents} />;
  };

  return (
    <div className="w-full">
      <DayPicker
        showOutsideDays
        modifiers={modifiers}
        components={{
          Day: ({ date }) => renderDay(date),
          Months: ({ children }) => (
            <AnimatePresence mode="wait">
              <motion.div
                key={children?.[0]?.props?.month?.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          ),
        }}
        className="rounded-2xl shadow-lg bg-white dark:bg-[#181B23] p-2"
        classNames={{
          months: "flex flex-col",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-lg font-semibold",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative",
          day: "h-9 w-9 p-0 font-normal",
          day_today: "ring-2 ring-blue-500 bg-blue-50 font-bold",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
        }}
      />
      <div className="flex gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Event</span>
        {hasJobFair && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Job Fair</span>}
        {hasWebinar && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Webinar</span>}
      </div>
    </div>
  );
}

// Logic container
export default function JobSeekerCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalEvents, setModalEvents] = useState<{ date: Date, events: any[] } | null>(null);
  const { addEvent, removeEvent, updateEvent } = useEvents();

  useEffect(() => {
    setLoading(true);
    setError(null);
    eventApi.getEvents()
      .then(fetchedEvents => {
        setEvents(fetchedEvents);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load events. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <span>{error}</span>
      </div>
    );
  }

  // Format events for display
  const formattedEvents = (events || []).map((event: any) => ({
    title: event.title,
    date: event.date,
    type: event.type,
    description: event.description,
  }));

  return (
    <section className="p-2 sm:p-4 md:p-6">
      <Card className="rounded-2xl shadow-lg p-4 bg-white dark:bg-[#181B23] flex flex-col md:flex-row gap-8 w-full">
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200 text-2xl">
              <CalendarIcon className="h-6 w-6 text-blue-400" /> Calendar & Events
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CalendarView events={formattedEvents} onShowEvents={(date, events) => setModalEvents({ date, events })} />
          </CardContent>
        </div>
        <div className="w-full md:w-1/2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200 text-2xl">
              <CalendarIcon className="h-6 w-6 text-blue-400" /> Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {formattedEvents.length === 0 ? (
              <div className="text-muted-foreground text-sm">No upcoming events.</div>
            ) : (
              <ul className="space-y-3">
                {formattedEvents.map((event, idx) => (
                  <li key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-blue-50/60 dark:bg-blue-900/30 rounded-xl gap-2 hover:bg-blue-100 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">{event.title} {getEventTypeBadge(event.type)}</span>
                      <span className="text-xs text-blue-400 dark:text-blue-300">{format(new Date(event.date), 'PPPP')}</span>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="w-fit px-2 py-1 text-xs gap-1">
                      <a href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                        <CalendarPlus className="h-4 w-4" /> Add to Google Calendar
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </div>
      </Card>
      {/* Modal for events on a date (mobile-friendly) */}
      {modalEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModalEvents(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#23263A] rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg text-blue-700">Events on {format(modalEvents.date, 'PPP')}</span>
              <Button variant="ghost" size="icon" onClick={() => setModalEvents(null)} aria-label="Close">
                ×
              </Button>
            </div>
            <ul className="space-y-4">
              {modalEvents.events.map((event, idx) => (
                <li key={idx} className="flex flex-col gap-1">
                  <span className="font-medium text-blue-900 flex items-center gap-2">{event.title} {getEventTypeBadge(event.type)}</span>
                  <span className="text-xs text-blue-400">{format(new Date(event.date), 'PPPP')}</span>
                  <span className="text-xs text-blue-700">{event.description}</span>
                  <Button asChild variant="outline" size="sm" className="w-fit px-2 py-1 text-xs gap-1 mt-1">
                    <a href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                      <CalendarPlus className="h-4 w-4" /> Add to Google Calendar
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </section>
  );
} 
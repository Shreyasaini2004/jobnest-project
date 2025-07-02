import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Loader2, Video, Users, GraduationCap, ExternalLink, Clock } from 'lucide-react';
import { useEvents, Event } from '@/contexts/EventContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isTomorrow, isSameDay } from 'date-fns';

const EventsBulletin = () => {
  const { events } = useEvents();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [visibleEvents, setVisibleEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update visible events based on scroll position
  useEffect(() => {
    if (events.length > 0) {
      const startIdx = Math.min(scrollPosition, Math.max(0, events.length - 3));
      setVisibleEvents(events.slice(startIdx, startIdx + 3));
      setIsLoading(false);
    } else if (events.length === 0 && !isLoading) {
      setIsLoading(false);
    }
  }, [scrollPosition, events, isLoading]);

  const scrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1));
  };

  const scrollRight = () => {
    setScrollPosition(Math.min(events.length - 3, scrollPosition + 1));
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
    return type === 'job-fair' ? <Users className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />;
  };

  const getEventTypeColor = (type: string) => {
    return type === 'job-fair' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const getEventTypeGradient = (type: string) => {
    return type === 'job-fair' 
      ? 'from-blue-500 to-blue-600' 
      : 'from-purple-500 to-purple-600';
  };

  return (
    <section className="py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Upcoming Events
            </h2>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover exciting job fairs and webinars to advance your career. Join industry experts and connect with top employers.
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <Button
            onClick={scrollLeft}
            disabled={scrollPosition === 0}
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(events.length / 3) }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  i === Math.floor(scrollPosition / 3) 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={scrollRight}
            disabled={scrollPosition >= events.length - 3}
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {isLoading ? (
            <div className="col-span-3 flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-lg text-slate-600">Loading exciting events...</p>
              </div>
            </div>
          ) : visibleEvents.length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="p-6 bg-white rounded-full w-24 h-24 mx-auto mb-6 shadow-lg">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Events Scheduled</h3>
                <p className="text-slate-500 mb-4">
                  We're working on bringing you amazing events. Check back soon!
                </p>
                <Button variant="outline" className="rounded-full">
                  Get Notified
                </Button>
              </div>
            </div>
          ) : (
            visibleEvents.map((event) => (
              <Card 
                key={event.id} 
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white"
              >
                {/* Event Type Indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getEventTypeGradient(event.type)}`} />
                
                <CardContent className="p-6">
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${event.type === 'job-fair' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-500">
                            {formatEventDate(event.date)} • {formatEventTime(event.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={getEventTypeColor(event.type)}>
                      {event.type === 'job-fair' ? 'Job Fair' : 'Webinar'}
                    </Badge>
                  </div>

                  {/* Event Description */}
                  {event.description && (
                    <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  {/* Event Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Live Event</span>
                    </div>
                    
                    {event.meetingLink ? (
                      <Button 
                        asChild
                        size="sm" 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-6"
                      >
                        <a 
                          href={event.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <Video className="h-4 w-4" />
                          Join Event
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full px-6 border-slate-200 hover:border-slate-300"
                      >
                        Learn More
                      </Button>
                    )}
                  </div>
                </CardContent>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            ))
          )}
        </div>

        {/* Call to Action */}
        {visibleEvents.length > 0 && (
          <div className="text-center mt-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Don't Miss Out!
              </h3>
              <p className="text-slate-600 mb-6">
                Stay updated with the latest career opportunities and industry insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full px-8">
                  View All Events
                </Button>
                <Button variant="outline" className="rounded-full px-8 border-slate-200 hover:border-slate-300">
                  Subscribe to Updates
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsBulletin;
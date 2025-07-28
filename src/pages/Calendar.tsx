import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus } from "lucide-react";

const mockEvents = [
  {
    id: "1",
    title: "Project Kickoff Meeting",
    project: "Website Redesign",
    date: "2024-01-15",
    time: "10:00 AM",
    type: "meeting",
  },
  {
    id: "2",
    title: "Design Review",
    project: "Mobile App",
    date: "2024-01-16",
    time: "2:00 PM",
    type: "review",
  },
  {
    id: "3",
    title: "Sprint Planning",
    project: "API Development",
    date: "2024-01-18",
    time: "9:00 AM",
    type: "planning",
  },
  {
    id: "4",
    title: "Client Presentation",
    project: "Website Redesign",
    date: "2024-01-20",
    time: "3:00 PM",
    type: "presentation",
  },
];

const Calendar = () => {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "default";
      case "review":
        return "secondary";
      case "planning":
        return "outline";
      case "presentation":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View your project schedules and upcoming events
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Your scheduled meetings and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="space-y-1">
                  <p className="font-medium leading-none">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.project}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.date} at {event.time}
                  </p>
                </div>
                <Badge variant={getEventTypeColor(event.type)}>
                  {event.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>
              A full calendar component would be integrated here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <div className="text-center">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Calendar component placeholder
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Integration with react-calendar or similar library
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
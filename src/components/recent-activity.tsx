import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Plus, Edit3, Clock } from "lucide-react";

interface Activity {
  id: string;
  type: "task_completed" | "project_created" | "task_updated" | "comment";
  description: string;
  timestamp: string;
  user: string;
  project?: string;
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "task_completed",
    description: "Completed 'Design user interface' task",
    timestamp: "2 hours ago",
    user: "You",
    project: "Website Redesign"
  },
  {
    id: "2",
    type: "project_created",
    description: "Created new project 'Mobile App Development'",
    timestamp: "1 day ago",
    user: "You",
  },
  {
    id: "3",
    type: "task_updated",
    description: "Updated task priority for 'API Integration'",
    timestamp: "2 days ago",
    user: "You",
    project: "Backend Development"
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "task_completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "project_created":
      return <Plus className="h-4 w-4 text-primary" />;
    case "task_updated":
      return <Edit3 className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {activity.user.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.type)}
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </span>
                  {activity.project && (
                    <Badge variant="secondary" className="text-xs">
                      {activity.project}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
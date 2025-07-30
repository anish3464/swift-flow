import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, CheckCircle2 } from "lucide-react";
import { Project } from "@/lib/projects";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "on_hold":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "active":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "on_hold":
        return "On Hold";
      case "planning":
        return "Planning";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const isOverdue = () => {
    if (!project.due_date) return false;
    const today = new Date();
    const dueDate = new Date(project.due_date);
    return project.status !== 'completed' && today > dueDate;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${isOverdue() ? 'border-red-500/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {project.title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority}
            </Badge>
            <Badge className={getStatusColor(isOverdue() ? 'overdue' : project.status)}>
              {isOverdue() ? 'Overdue' : getStatusLabel(project.status)}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description || 'No description provided'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.completion_percentage}%</span>
          </div>
          <Progress value={project.completion_percentage} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            <span>{project.completed_tasks}/{project.task_count} tasks</span>
          </div>
          {project.due_date && (
            <div className={`flex items-center gap-1 ${isOverdue() ? 'text-red-500' : 'text-muted-foreground'}`}>
              <Calendar className="h-4 w-4" />
              <span>{formatDate(project.due_date)}</span>
            </div>
          )}
        </div>
        
        {project.manager_name && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Manager: {project.manager_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
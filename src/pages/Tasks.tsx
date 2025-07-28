import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Circle, Clock, Plus } from "lucide-react";

const mockTasks = [
  {
    id: "1",
    title: "Design landing page mockups",
    project: "Website Redesign",
    status: "todo",
    priority: "high",
    dueDate: "2024-01-15",
  },
  {
    id: "2",
    title: "Implement user authentication",
    project: "Mobile App",
    status: "in-progress",
    priority: "medium",
    dueDate: "2024-01-20",
  },
  {
    id: "3",
    title: "Write project documentation",
    project: "API Development",
    status: "done",
    priority: "low",
    dueDate: "2024-01-10",
  },
  {
    id: "4",
    title: "Set up CI/CD pipeline",
    project: "DevOps Setup",
    status: "todo",
    priority: "high",
    dueDate: "2024-01-25",
  },
];

const Tasks = () => {
  const [filter, setFilter] = useState("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredTasks = mockTasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your project tasks
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="done">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <CardTitle className="text-base">{task.title}</CardTitle>
                    </div>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <CardDescription>
                    Project: {task.project} • Due: {task.dueDate}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
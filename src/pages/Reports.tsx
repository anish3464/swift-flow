import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Users, CheckCircle2 } from "lucide-react";

const Reports = () => {
  const stats = [
    {
      title: "Total Projects",
      value: "12",
      change: "+2 from last month",
      icon: BarChart3,
    },
    {
      title: "Completed Tasks",
      value: "89",
      change: "+12% from last week",
      icon: CheckCircle2,
    },
    {
      title: "Team Members",
      value: "8",
      change: "+1 new member",
      icon: Users,
    },
    {
      title: "Success Rate",
      value: "94%",
      change: "+5% improvement",
      icon: TrendingUp,
    },
  ];

  const projectProgress = [
    { name: "Website Redesign", progress: 85, status: "On Track" },
    { name: "Mobile App", progress: 60, status: "In Progress" },
    { name: "API Development", progress: 100, status: "Completed" },
    { name: "DevOps Setup", progress: 30, status: "Starting" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Track your project performance and team analytics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>
              Current status of active projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectProgress.map((project) => (
              <div key={project.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-muted-foreground">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{project.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Chart</CardTitle>
            <CardDescription>
              Team productivity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Chart component placeholder
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Integration with Recharts or Chart.js
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
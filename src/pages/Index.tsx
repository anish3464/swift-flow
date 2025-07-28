import { useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { CreateProjectModal } from "@/components/create-project-modal";
import { RecentActivity } from "@/components/recent-activity";

interface Project {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  progress: number;
  taskCount: number;
  completedTasks: number;
  status: "active" | "completed" | "overdue";
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Website Redesign",
    description: "Complete overhaul of the company website with modern design and improved user experience",
    dueDate: "2024-08-15",
    progress: 65,
    taskCount: 12,
    completedTasks: 8,
    status: "active"
  },
  {
    id: "2",
    title: "Mobile App Development",
    description: "Native mobile application for iOS and Android platforms",
    dueDate: "2024-09-30",
    progress: 30,
    taskCount: 15,
    completedTasks: 4,
    status: "active"
  },
  {
    id: "3",
    title: "Database Migration",
    description: "Migrate legacy database to new cloud infrastructure",
    dueDate: "2024-07-20",
    progress: 100,
    taskCount: 8,
    completedTasks: 8,
    status: "completed"
  }
];

const Index = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const handleCreateProject = (projectData: { title: string; description: string; dueDate: string }) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: projectData.title,
      description: projectData.description,
      dueDate: projectData.dueDate,
      progress: 0,
      taskCount: 0,
      completedTasks: 0,
      status: "active"
    };
    setProjects([...projects, newProject]);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your project management dashboard
          </p>
        </div>
        <CreateProjectModal onCreateProject={handleCreateProject} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">Create your first project to get started</p>
              <CreateProjectModal onCreateProject={handleCreateProject} />
            </div>
          </div>
        )}
      </div>

      <RecentActivity />
    </div>
  );
};

export default Index;

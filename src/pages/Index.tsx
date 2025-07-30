import { useState, useEffect } from "react";
import { ProjectCard } from "@/components/project-card";
import { CreateProjectModal } from "@/components/create-project-modal";
import { RecentActivity } from "@/components/recent-activity";
import { useAuth } from "@/contexts/AuthContext";
import { projectService, Project } from "@/lib/projects";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: { title: string; description: string; dueDate: string }) => {
    try {
      const newProject = await projectService.createProject({
        title: projectData.title,
        description: projectData.description,
        due_date: projectData.dueDate,
        status: 'active',
        priority: 'medium',
      });
      setProjects([newProject, ...projects]);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.first_name || user?.username}! Manage your projects and tasks.
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

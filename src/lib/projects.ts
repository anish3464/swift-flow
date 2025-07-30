import api from './api';
import { User } from './auth';

export interface Project {
  id: string;
  title: string;
  description?: string;
  company: string;
  company_name: string;
  manager?: string;
  manager_name?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  due_date?: string;
  budget?: number;
  progress: number;
  task_count: number;
  completed_tasks: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  project: string;
  project_title: string;
  assigned_to?: string;
  assigned_to_name?: string;
  created_by?: string;
  created_by_name?: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours?: number;
  actual_hours?: number;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  comments_count: number;
}

export interface TaskComment {
  id: string;
  task: string;
  user: User;
  user_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateData {
  title: string;
  description?: string;
  manager?: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  due_date?: string;
  budget?: number;
  assigned_user_ids?: string[];
  assigned_team_ids?: string[];
}

export interface TaskCreateData {
  title: string;
  description?: string;
  project: string;
  assigned_to?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours?: number;
  start_date?: string;
  due_date?: string;
}

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get('/projects/');
    return response.data.results || response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
  },

  async createProject(data: ProjectCreateData): Promise<Project> {
    const response = await api.post('/projects/', data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<ProjectCreateData>): Promise<Project> {
    const response = await api.patch(`/projects/${id}/`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}/`);
  },

  async getMyProjects(): Promise<Project[]> {
    const response = await api.get('/my-projects/');
    return response.data.results || response.data;
  },

  async getProjectTasks(projectId: string): Promise<Task[]> {
    const response = await api.get(`/projects/${projectId}/tasks/`);
    return response.data;
  },

  async addProjectMember(projectId: string, userId: string, role?: string): Promise<void> {
    await api.post(`/projects/${projectId}/add_member/`, {
      user_id: userId,
      role: role || 'member',
    });
  },

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/remove_member/`, {
      data: { user_id: userId },
    });
  },
};

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await api.get('/tasks/');
    return response.data.results || response.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
  },

  async createTask(data: TaskCreateData): Promise<Task> {
    const response = await api.post('/tasks/', data);
    return response.data;
  },

  async updateTask(id: string, data: Partial<TaskCreateData>): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/`, data);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}/`);
  },

  async getMyTasks(): Promise<Task[]> {
    const response = await api.get('/my-tasks/');
    return response.data.results || response.data;
  },

  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    const response = await api.get(`/tasks/${taskId}/comments/`);
    return response.data;
  },

  async addTaskComment(taskId: string, content: string): Promise<TaskComment> {
    const response = await api.post(`/tasks/${taskId}/add_comment/`, {
      content,
    });
    return response.data;
  },
};
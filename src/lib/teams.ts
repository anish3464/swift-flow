import api from './api';
import { User } from './auth';

export interface Team {
  id: string;
  name: string;
  description?: string;
  company: string;
  company_name: string;
  lead?: string;
  lead_name?: string;
  members_count: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface TeamMembership {
  id: string;
  user: User;
  role: 'lead' | 'member';
  joined_at: string;
  is_active: boolean;
}

export interface TeamCreateData {
  name: string;
  description?: string;
  lead?: string;
  member_ids?: string[];
}

export const teamService = {
  async getTeams(): Promise<Team[]> {
    const response = await api.get('/teams/');
    return response.data.results || response.data;
  },

  async getTeam(id: string): Promise<Team> {
    const response = await api.get(`/teams/${id}/`);
    return response.data;
  },

  async createTeam(data: TeamCreateData): Promise<Team> {
    const response = await api.post('/teams/', data);
    return response.data;
  },

  async updateTeam(id: string, data: Partial<TeamCreateData>): Promise<Team> {
    const response = await api.patch(`/teams/${id}/`, data);
    return response.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}/`);
  },

  async getTeamMembers(teamId: string): Promise<TeamMembership[]> {
    const response = await api.get(`/teams/${teamId}/members/`);
    return response.data;
  },

  async addTeamMember(teamId: string, userId: string, role?: string): Promise<TeamMembership> {
    const response = await api.post(`/teams/${teamId}/add_member/`, {
      user_id: userId,
      role: role || 'member',
    });
    return response.data;
  },

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/remove_member/`, {
      data: { user_id: userId },
    });
  },

  async getMyTeams(): Promise<TeamMembership[]> {
    const response = await api.get('/my-teams/');
    return response.data.results || response.data;
  },
};
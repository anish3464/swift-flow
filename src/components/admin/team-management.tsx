import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { User } from "@/lib/auth";
import { Team, teamService, TeamCreateData } from "@/lib/teams";
import { useToast } from "@/hooks/use-toast";

interface TeamManagementProps {
  teams: Team[];
  users: User[];
  onTeamsChange: () => void;
}

export function TeamManagement({ teams, users, onTeamsChange }: TeamManagementProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [createForm, setCreateForm] = useState<TeamCreateData>({
    name: '',
    description: '',
    lead: '',
    member_ids: [],
  });

  const [editForm, setEditForm] = useState<TeamCreateData>({
    name: '',
    description: '',
    lead: '',
    member_ids: [],
  });

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await teamService.createTeam(createForm);
      toast({
        title: "Success",
        description: "Team created successfully",
      });
      setCreateDialogOpen(false);
      setCreateForm({
        name: '',
        description: '',
        lead: '',
        member_ids: [],
      });
      onTeamsChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || 
                    Object.values(error.response?.data || {}).flat().join(', ') ||
                    "Failed to create team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    setLoading(true);
    try {
      await teamService.updateTeam(selectedTeam.id, editForm);
      toast({
        title: "Success",
        description: "Team updated successfully",
      });
      setEditDialogOpen(false);
      setSelectedTeam(null);
      setEditForm({
        name: '',
        description: '',
        lead: '',
        member_ids: [],
      });
      onTeamsChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    setLoading(true);
    try {
      await teamService.deleteTeam(team.id);
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
      onTeamsChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team);
    setEditForm({
      name: team.name,
      description: team.description || '',
      lead: team.lead || '',
      member_ids: [],
    });
    setEditDialogOpen(true);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? (user.full_name || user.username) : 'Unknown User';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>
              Create and manage teams within your company
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Create a new team and assign members
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name *</Label>
                  <Input
                    id="team-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team-description">Description</Label>
                  <Textarea
                    id="team-description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Brief description of the team"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team-lead">Team Lead</Label>
                  <Select value={createForm.lead} onValueChange={(value) => setCreateForm({ ...createForm, lead: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team lead" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Lead</SelectItem>
                      {users.filter(u => u.is_active).map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.username} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Team Members</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    {users.filter(u => u.is_active).map((user) => (
                      <div key={user.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id={`edit-member-${user.id}`}
                          checked={editForm.member_ids?.includes(user.id) || false}
                          onChange={(e) => {
                            const memberIds = editForm.member_ids || [];
                            if (e.target.checked) {
                              setEditForm({ 
                                ...editForm, 
                                member_ids: [...memberIds, user.id] 
                              });
                            } else {
                              setEditForm({ 
                                ...editForm, 
                                member_ids: memberIds.filter(id => id !== user.id) 
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={`edit-member-${user.id}`} className="text-sm cursor-pointer">
                          {user.full_name || user.username} ({user.role})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Team Members</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    {users.filter(u => u.is_active).map((user) => (
                      <div key={user.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id={`member-${user.id}`}
                          checked={createForm.member_ids?.includes(user.id) || false}
                          onChange={(e) => {
                            const memberIds = createForm.member_ids || [];
                            if (e.target.checked) {
                              setCreateForm({ 
                                ...createForm, 
                                member_ids: [...memberIds, user.id] 
                              });
                            } else {
                              setCreateForm({ 
                                ...createForm, 
                                member_ids: memberIds.filter(id => id !== user.id) 
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={`member-${user.id}`} className="text-sm cursor-pointer">
                          {user.full_name || user.username} ({user.role})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Team'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-muted-foreground">{team.description || 'No description'}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {team.lead_name ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {team.lead_name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{team.lead_name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No lead assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {team.members_count} members
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(team.created_at).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(team)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Team</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the team "{team.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTeam(team)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Team Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
              <DialogDescription>
                Update team information and settings
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-team-name">Team Name *</Label>
                <Input
                  id="edit-team-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-team-description">Description</Label>
                <Textarea
                  id="edit-team-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Brief description of the team"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-team-lead">Team Lead</Label>
                <Select value={editForm.lead} onValueChange={(value) => setEditForm({ ...editForm, lead: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Lead</SelectItem>
                    {users.filter(u => u.is_active).map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.username} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Team'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
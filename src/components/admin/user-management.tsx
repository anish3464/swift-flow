import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { User } from "@/lib/auth";
import { userService, UserCreateData, UserUpdateData } from "@/lib/users";
import { useToast } from "@/hooks/use-toast";

interface UserManagementProps {
  users: User[];
  onUsersChange: () => void;
}

export function UserManagement({ users, onUsersChange }: UserManagementProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [createForm, setCreateForm] = useState<UserCreateData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'member',
    phone: '',
    position: '',
    department: '',
    hire_date: null,
  });

  const [editForm, setEditForm] = useState<UserUpdateData>({});

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createForm.password !== createForm.password_confirm) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await userService.createUser(createForm);
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setCreateDialogOpen(false);
      setCreateForm({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        role: 'member',
        phone: '',
        position: '',
        department: '',
        hire_date: null,
      });
      onUsersChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || 
                    Object.values(error.response?.data || {}).flat().join(', ') ||
                    "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    try {
      await userService.updateUser(selectedUser.id, editForm);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setEditDialogOpen(false);
      setSelectedUser(null);
      setEditForm({});
      onUsersChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setLoading(true);
    try {
      await userService.deleteUser(user.id);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      onUsersChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    setLoading(true);
    try {
      if (user.is_active) {
        await userService.deactivateUser(user.id);
        toast({
          title: "Success",
          description: "User deactivated successfully",
        });
      } else {
        await userService.activateUser(user.id);
        toast({
          title: "Success",
          description: "User activated successfully",
        });
      }
      onUsersChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone: user.phone || '',
      position: user.position || '',
      department: user.department || '',
      hire_date: user.hire_date || null,
    });
    setEditDialogOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'member':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getUserInitials = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username[0]?.toUpperCase() || 'U';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage company users, roles, and permissions
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to your company
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={createForm.username}
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={createForm.first_name}
                      onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={createForm.last_name}
                      onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password_confirm">Confirm Password *</Label>
                    <Input
                      id="password_confirm"
                      type="password"
                      value={createForm.password_confirm}
                      onChange={(e) => setCreateForm({ ...createForm, password_confirm: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={createForm.role} onValueChange={(value) => setCreateForm({ ...createForm, role: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={createForm.position}
                      onChange={(e) => setCreateForm({ ...createForm, position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={createForm.department}
                      onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date (Optional)</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={createForm.hire_date || ''}
                    onChange={(e) => setCreateForm({ ...createForm, hire_date: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create User'}
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
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.full_name || user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{user.position || 'Not specified'}</p>
                    <p className="text-xs text-muted-foreground">{user.department || ''}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleUserStatus(user)}
                    >
                      {user.is_active ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {user.full_name || user.username}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user)}>
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

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_username">Username</Label>
                  <Input
                    id="edit_username"
                    value={editForm.username || ''}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_first_name">First Name</Label>
                  <Input
                    id="edit_first_name"
                    value={editForm.first_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_last_name">Last Name</Label>
                  <Input
                    id="edit_last_name"
                    value={editForm.last_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_role">Role</Label>
                  <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    id="edit_phone"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_position">Position</Label>
                  <Input
                    id="edit_position"
                    value={editForm.position || ''}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_department">Department</Label>
                  <Input
                    id="edit_department"
                    value={editForm.department || ''}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_hire_date">Hire Date</Label>
                <Input
                  id="edit_hire_date"
                  type="date"
                  value={editForm.hire_date || ''}
                  onChange={(e) => setEditForm({ ...editForm, hire_date: e.target.value || null })}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
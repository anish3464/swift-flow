import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySettings } from "@/components/admin/company-settings";
import { UserManagement } from "@/components/admin/user-management";
import { TeamManagement } from "@/components/admin/team-management";
import { User, Company } from "@/lib/auth";
import { userService } from "@/lib/users";
import { companyService } from "@/lib/company";
import { teamService, Team } from "@/lib/teams";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, teamsData, companyData] = await Promise.all([
        userService.getCompanyUsers(),
        teamService.getTeams(),
        companyService.getCompany(),
      ]);
      
      setUsers(usersData);
      setTeams(teamsData);
      setCompany(companyData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUsersChange = () => {
    userService.getCompanyUsers().then(setUsers).catch(console.error);
  };

  const handleTeamsChange = () => {
    teamService.getTeams().then(setTeams).catch(console.error);
  };

  const handleCompanyChange = () => {
    companyService.getCompany().then(setCompany).catch(console.error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">Failed to load company data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage your company settings, users, and teams
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company">Company Settings</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="teams">Team Management</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <CompanySettings 
            company={company} 
            onCompanyChange={handleCompanyChange}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagement 
            users={users} 
            onUsersChange={handleUsersChange}
          />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <TeamManagement 
            teams={teams} 
            users={users}
            onTeamsChange={handleTeamsChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
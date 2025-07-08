import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { UserRole } from "@/context/AuthContext";
import RoleBasedContent from "@/components/RoleBasedContent";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { getAllUsers, updateUserRoleById, getAllRoles, createNewRole, updateRoleAccess } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Loader2, UserPlus, Shield, Settings as SettingsIcon } from "lucide-react";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  photoURL: string | null;
}

interface RouteAccess {
  path: string;
  name: string;
  description: string;
  allowedRoles: UserRole[];
}

interface RoleWithAccess {
  id: string;
  name: string;
  description: string;
  routes: string[];
}

interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  lastLogin: Date | null;
  createdAt: Date;
}

const defaultRoutes: RouteAccess[] = [
  {
    path: "/dashboard",
    name: "Dashboard",
    description: "Overview of projects, activities, and actions",
    allowedRoles: ["Admin", "Supervisor"]
  },
  {
    path: "/projects",
    name: "Projects",
    description: "Project management and tracking",
    allowedRoles: ["Admin", "Supervisor", "Operator"]
  },
  {
    path: "/activities",
    name: "Activities Log",
    description: "Daily activity logging and monitoring",
    allowedRoles: ["Admin", "Supervisor", "Operator"]
  },
  {
    path: "/action-tracker",
    name: "Action Tracker",
    description: "Track and manage action items",
    allowedRoles: ["Admin", "Supervisor", "Operator"]
  },
  {
    path: "/reports",
    name: "Reports",
    description: "Generate and export reports",
    allowedRoles: ["Admin", "Supervisor"]
  },
  {
    path: "/admin",
    name: "Settings",
    description: "System settings and user management",
    allowedRoles: ["Admin"]
  }
];

export default function Admin() {
  const { userData: currentUserData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleWithAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [routes, setRoutes] = useState<RouteAccess[]>(defaultRoutes);
  const [selectedRoute, setSelectedRoute] = useState<RouteAccess | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const { toast } = useToast();
  
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const fetchedUsers: User[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedUsers.push({
            id: doc.id,
            email: data.email,
            displayName: data.displayName,
            role: data.role,
            lastLogin: data.lastLogin ? new Date(data.lastLogin) : null,
            createdAt: new Date(data.createdAt),
          });
        });

        setUsers(fetchedUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);
  
  // Handle user role change
  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRoleById(userId, newRole as UserRole);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole as UserRole } : user
        )
      );
      
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };
  
  // Handle new role creation
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newRole = await createNewRole({
        name: newRoleName,
        description: newRoleDescription,
        routes: []
      });
      
      setRoles(prev => [...prev, newRole]);
      setNewRoleName("");
      setNewRoleDescription("");
      
      toast({
        title: "Role Created",
        description: `New role "${newRoleName}" has been created`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating role:", error);
      toast({
        title: "Creation Failed",
        description: "Failed to create new role",
        variant: "destructive",
      });
    }
  };
  
  // Handle role route access update
  const handleUpdateRoleAccess = async () => {
    if (!selectedRoute) return;
    
    try {
      await updateRoleAccess(selectedRoute.path, selectedRoute.allowedRoles);
      
      // Update local state
      setRoutes(prev => 
        prev.map(route => 
          route.path === selectedRoute.path 
            ? { ...route, allowedRoles: selectedRoute.allowedRoles } 
            : route
        )
      );
      
      toast({
        title: "Access Updated",
        description: `Route access for "${selectedRoute.name}" has been updated`,
        variant: "default",
      });
      
      setSelectedRoute(null);
    } catch (error) {
      console.error("Error updating role access:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update role access",
        variant: "destructive",
      });
    }
  };
  
  const handleEditRole = (route: RouteAccess) => {
    setSelectedRoute(route);
  };
  
  const handleRouteToggle = (path: string) => {
    setRoutes(prev => {
      const route = prev.find(r => r.path === path);
      if (route) {
        const newRoutes = [...route.allowedRoles];
        if (newRoutes.includes(path)) {
          return prev.map(r =>
            r.path === path ? { ...r, allowedRoles: newRoutes.filter(p => p !== path) } : r
          );
        } else {
          return prev.map(r =>
            r.path === path ? { ...r, allowedRoles: [...newRoutes, path] } : r
          );
        }
      }
      return prev;
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Role & Access
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.displayName || "No Name"}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: UserRole) => handleUserRoleChange(user.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Supervisor">Supervisor</SelectItem>
                              <SelectItem value="Operator">Operator</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? format(user.lastLogin, "MMM d, yyyy") : "Never"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditingUser(true);
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control</CardTitle>
              <CardDescription>
                Configure which roles can access specific routes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Allowed Roles</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.map((route) => (
                      <TableRow key={route.path}>
                        <TableCell>
                          <div className="font-medium">{route.name}</div>
                          <div className="text-sm text-muted-foreground">{route.path}</div>
                        </TableCell>
                        <TableCell>{route.description}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {route.allowedRoles.map((role) => (
                              <Badge key={role} variant="secondary">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRoute(route);
                              setIsEditingRoute(true);
                            }}
                          >
                            Edit Access
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure global system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure when to send email notifications
                  </p>
                  {/* Add email notification settings here */}
                </div>

                <div>
                  <h3 className="text-lg font-medium">Data Retention</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how long to keep different types of data
                  </p>
                  {/* Add data retention settings here */}
                </div>

                <div>
                  <h3 className="text-lg font-medium">Backup Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure automated backup settings
                  </p>
                  {/* Add backup settings here */}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditingUser} onOpenChange={setIsEditingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <Input 
                  value={selectedUser.displayName || ""} 
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    displayName: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value: UserRole) => setSelectedUser({
                    ...selectedUser,
                    role: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingUser(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (selectedUser) {
                handleUserRoleChange(selectedUser.id, selectedUser.role);
                setIsEditingUser(false);
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Route Access Dialog */}
      <Dialog open={isEditingRoute} onOpenChange={setIsEditingRoute}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Route Access</DialogTitle>
            <DialogDescription>
              Configure which roles can access this route
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoute && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedRoute.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedRoute.path}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Allowed Roles</label>
                <div className="space-y-2">
                  {(["Admin", "Supervisor", "Operator"] as UserRole[]).map((role) => (
                    <div key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={role}
                        checked={selectedRoute.allowedRoles.includes(role)}
                        onChange={(e) => {
                          const newRoles = e.target.checked
                            ? [...selectedRoute.allowedRoles, role]
                            : selectedRoute.allowedRoles.filter(r => r !== role);
                          setSelectedRoute({
                            ...selectedRoute,
                            allowedRoles: newRoles
                          });
                        }}
                      />
                      <label htmlFor={role}>{role}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingRoute(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRoleAccess}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
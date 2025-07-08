import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RoleBasedContent from "@/components/RoleBasedContent";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { UserRole } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const { currentUser, userData, logout, setUserRole } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  // Redirect to home if not logged in
  if (!currentUser) {
    return <Navigate to="/" />;
  }
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleSetRole = async (role: UserRole) => {
    if (!role) return;
    
    setIsUpdating(true);
    try {
      const success = await setUserRole(role);
      if (success) {
        toast({
          title: "Role Updated",
          description: `Your role has been updated to ${role}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Update Failed", 
          description: "Failed to update role",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating your role",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Helper function to get badge variant based on role
  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "Admin": return "destructive";
      case "Supervisor": return "default";
      case "Operator": return "secondary";
      default: return "outline";
    }
  };
  
  return (
    <div className="py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            {currentUser.photoURL ? (
              <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || "User"} />
            ) : (
              <AvatarFallback className="text-2xl">{currentUser.displayName?.charAt(0) || "U"}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle>{currentUser.displayName || "User"}</CardTitle>
            <CardDescription>{currentUser.email}</CardDescription>
            {userData?.role ? (
              <Badge variant={getRoleBadgeVariant(userData.role)} className="w-fit mt-1">
                {userData.role}
              </Badge>
            ) : (
              <Badge variant="outline" className="w-fit mt-1">
                Not Assigned
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Account Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Email</div>
              <div>{currentUser.email}</div>
              
              <div className="text-gray-500">Account created</div>
              <div>{currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : "N/A"}</div>
              
              <div className="text-gray-500">Last sign in</div>
              <div>{currentUser.metadata.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : "N/A"}</div>
              
              <div className="text-gray-500">Email verified</div>
              <div>{currentUser.emailVerified ? "Yes" : "No"}</div>
              
              <div className="text-gray-500">Role</div>
              <div>{userData?.role || "Not assigned"}</div>
            </div>
          </div>
          
          {/* Role assignment section */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Assign Role</h3>
            <p className="text-sm text-muted-foreground mb-3">
              You can assign yourself a role for demonstration purposes:
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleSetRole("Admin")}
                disabled={isUpdating || userData?.role === "Admin"}
                className="border-red-200"
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSetRole("Supervisor")}
                disabled={isUpdating || userData?.role === "Supervisor"}
                className="border-blue-200"
              >
                Supervisor
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSetRole("Operator")}
                disabled={isUpdating || userData?.role === "Operator"}
                className="border-green-200"
              >
                Operator
              </Button>
            </div>
          </div>
          
          {/* Role-specific content */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Your Access</h3>
            
            <div className="space-y-2">
              <RoleBasedContent allowedRoles={["Admin"]}>
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium">Admin Access</p>
                  <p className="text-sm text-muted-foreground mb-2">You have full administrative access to the system.</p>
                  <Link to="/admin">
                    <Button size="sm" variant="default">Go to Admin Dashboard</Button>
                  </Link>
                </div>
              </RoleBasedContent>
              
              <RoleBasedContent allowedRoles={["Admin", "Supervisor"]}>
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium">Reporting Access</p>
                  <p className="text-sm text-muted-foreground mb-2">You can view and generate reports.</p>
                  <Link to="/reports">
                    <Button size="sm" variant="default">View Reports</Button>
                  </Link>
                </div>
              </RoleBasedContent>
              
              <RoleBasedContent allowedRoles={["Admin", "Supervisor", "Operator"]}>
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium">Task Access</p>
                  <p className="text-sm text-muted-foreground mb-2">You can view and manage tasks.</p>
                  <Link to="/tasks">
                    <Button size="sm" variant="default">View Tasks</Button>
                  </Link>
                </div>
              </RoleBasedContent>
            </div>
          </div>
          
          <div className="pt-4 flex justify-center">
            <Button variant="destructive" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </CardContent>
        
        <RoleBasedContent allowedRoles={["Admin"]}>
          <CardFooter className="bg-muted/50 flex justify-between">
            <p className="text-sm text-muted-foreground">Admin users can change roles in the Admin Dashboard</p>
            <Link to="/admin">
              <Button variant="outline" size="sm">Admin Dashboard</Button>
            </Link>
          </CardFooter>
        </RoleBasedContent>
      </Card>
    </div>
  );
} 
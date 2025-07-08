import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getProjectById, addUserToProject, updateUserRoleInProject, removeUserFromProject } from "@/lib/services/project-service";
import { getActivitiesByProject, createActivity, updateActivity } from "@/lib/services/activity-service";
import { getAllUsers } from "@/lib/firebase";
import { Project, ProjectUser, ProjectRole } from "@/lib/types/project";
import { Activity, ActivityFormData, ActivityType } from "@/lib/types/activity";
import { format } from "date-fns";
import ActivityForm from "@/components/ActivityForm";
import ActivityList from "@/components/ActivityList";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, MapPin, Users, Pencil, UserPlus, AlertCircle, ClipboardList, Search, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<ProjectRole>("Team Member");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  // Activity states
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitySubmitting, setActivitySubmitting] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  // Activity filtering and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityType | "all">("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<{startDate?: string, endDate?: string}>({});
  
  // Check if user is admin or supervisor
  const isAdminOrSupervisor = userData?.role === "Admin" || userData?.role === "Supervisor";
  
  // Project roles for select dropdown
  const projectRoles: ProjectRole[] = [
    "Project Manager",
    "Field Supervisor",
    "Technical Advisor",
    "Team Member",
    "Observer"
  ];

  // Activity types for filter dropdown
  const activityTypes: ActivityType[] = [
    "Drilling",
    "Blasting",
    "Hauling",
    "Excavation",
    "Demolition",
    "Clearance",
    "Survey",
    "Training",
    "Other"
  ];

  // Fetch project data
  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
      fetchActivities(projectId);
    }
  }, [projectId]);

  // Filter activities when filter criteria change
  useEffect(() => {
    if (!activities.length) {
      setFilteredActivities([]);
      return;
    }
    
    let filtered = [...activities];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        (activity.crew && activity.crew.toLowerCase().includes(query)) ||
        (activity.remarks && activity.remarks.toLowerCase().includes(query)) ||
        activity.type.toLowerCase().includes(query)
      );
    }
    
    // Apply activity type filter
    if (activityTypeFilter !== "all") {
      filtered = filtered.filter(activity => activity.type === activityTypeFilter);
    }
    
    // Apply date range filter
    if (dateRangeFilter.startDate) {
      const startDate = new Date(dateRangeFilter.startDate);
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= startDate;
      });
    }
    
    if (dateRangeFilter.endDate) {
      const endDate = new Date(dateRangeFilter.endDate);
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate <= endDate;
      });
    }
    
    setFilteredActivities(filtered);
  }, [activities, searchQuery, activityTypeFilter, dateRangeFilter]);

  const fetchProjectData = async (id: string) => {
    setLoading(true);
    try {
      const projectData = await getProjectById(id);
      if (projectData) {
        setProject(projectData);
        
        // Fetch all users to provide options for adding to project
        const users = await getAllUsers();
        
        // Filter out users already in the project
        const projectUserIds = projectData.users?.map(u => u.id) || [];
        const filteredUsers = users.filter(user => 
          !projectUserIds.includes(user.uid)
        );
        
        setAvailableUsers(filteredUsers);
        
        if (filteredUsers.length > 0) {
          setSelectedUserId(filteredUsers[0].uid);
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch activities for this project
  const fetchActivities = async (id: string) => {
    setActivitiesLoading(true);
    try {
      const activitiesData = await getActivitiesByProject(id);
      setActivities(activitiesData);
      setFilteredActivities(activitiesData);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load activities data. Please try again.",
      });
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Handle resetting all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setActivityTypeFilter("all");
    setDateRangeFilter({});
    setFilteredActivities(activities);
  };

  // Handle adding a user to the project
  const handleAddUser = async () => {
    if (!projectId || !selectedUserId) return;
    
    try {
      // Find the selected user in available users
      const userToAdd = availableUsers.find(user => user.uid === selectedUserId);
      
      if (userToAdd) {
        const projectUser: ProjectUser = {
          id: userToAdd.uid,
          email: userToAdd.email,
          displayName: userToAdd.displayName,
          photoURL: userToAdd.photoURL,
          role: selectedRole
        };
        
        await addUserToProject(projectId, projectUser);
        
        // Update local state
        setProject(prev => {
          if (!prev) return prev;
          const updatedUsers = [...(prev.users || []), projectUser];
          return { ...prev, users: updatedUsers };
        });
        
        // Remove the user from available users
        setAvailableUsers(availableUsers.filter(u => u.uid !== selectedUserId));
        
        // Reset selection and close dialog
        if (availableUsers.length > 1) {
          setSelectedUserId(availableUsers.find(u => u.uid !== selectedUserId)?.uid || "");
        } else {
          setSelectedUserId("");
        }
        
        setIsAddUserDialogOpen(false);
        
        toast({
          title: "User added",
          description: "The user has been successfully added to the project.",
        });
      }
    } catch (error) {
      console.error("Error adding user to project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add user to project. Please try again.",
      });
    }
  };

  // Handle updating user role in the project
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!projectId) return;
    
    try {
      await updateUserRoleInProject(projectId, userId, newRole);
      
      // Update local state
      setProject(prev => {
        if (!prev) return prev;
        const updatedUsers = prev.users.map(user => {
          if (user.id === userId) {
            return { ...user, role: newRole as ProjectRole };
          }
          return user;
        });
        return { ...prev, users: updatedUsers };
      });
      
      toast({
        title: "Role updated",
        description: "The user's role has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role. Please try again.",
      });
    }
  };

  // Handle removing a user from the project
  const handleRemoveUser = async (userId: string) => {
    if (!projectId) return;
    
    try {
      await removeUserFromProject(projectId, userId);
      
      // Update local state
      const removedUser = project?.users.find(u => u.id === userId);
      
      setProject(prev => {
        if (!prev) return prev;
        const updatedUsers = prev.users.filter(user => user.id !== userId);
        return { ...prev, users: updatedUsers };
      });
      
      // Add the user back to available users if we have their data
      if (removedUser) {
        const userForAvailable = {
          uid: removedUser.id,
          email: removedUser.email,
          displayName: removedUser.displayName,
          photoURL: removedUser.photoURL
        };
        setAvailableUsers([...availableUsers, userForAvailable]);
      }
      
      toast({
        title: "User removed",
        description: "The user has been successfully removed from the project.",
      });
    } catch (error) {
      console.error("Error removing user from project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove user from project. Please try again.",
      });
    }
  };
  
  // Handle creating or updating an activity
  const handleActivitySubmit = async (data: ActivityFormData) => {
    if (!projectId || !currentUser) return;
    
    setActivitySubmitting(true);
    try {
      if (editingActivity) {
        await updateActivity(editingActivity.id, data);
        
        // Update local state
        const updatedActivity = { ...editingActivity, ...data, updatedAt: new Date() };
        setActivities(prev => 
          prev.map(activity => 
            activity.id === editingActivity.id 
              ? updatedActivity
              : activity
          )
        );
        
        toast({
          title: "Activity updated",
          description: "The activity log has been successfully updated.",
        });
      } else {
        const newActivity = await createActivity(projectId, data, currentUser.uid);
        
        // Update local state
        setActivities(prev => [newActivity, ...prev]);
        
        toast({
          title: "Activity logged",
          description: "New activity has been successfully logged.",
        });
      }
      
      // Reset editing state
      setEditingActivity(null);
    } catch (error) {
      console.error("Error saving activity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save activity. Please try again.",
      });
    } finally {
      setActivitySubmitting(false);
    }
  };
  
  // Handle editing an activity
  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    
    // Scroll to the form
    document.getElementById('activity-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle deleting an activity from the list
  const handleDeleteActivity = (activityId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium">Project not found</h3>
        <p className="text-muted-foreground mb-4">
          The project you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => navigate("/projects")}>
          Go to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={() => navigate("/projects")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
      </Button>
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        {isAdminOrSupervisor && (
          <Button asChild>
            <div onClick={() => navigate(`/projects/${projectId}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Project
            </div>
          </Button>
        )}
      </div>
      
      <Badge 
        className={`${
          project.status === "Active" 
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : project.status === "Planning" 
            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
            : project.status === "On Hold"
            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            : project.status === "Completed"
            ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
        }`}
      >
        {project.status}
      </Badge>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="team">Team ({project.users?.length || 0})</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Information about the {project.name} project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {project.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{project.description}</p>
                  <Separator className="my-4" />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Type</h3>
                  <p className="flex items-center">
                    {project.type}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Location</h3>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    {project.location}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Start Date</h3>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {typeof project.startDate === 'string'
                      ? project.startDate
                      : format(project.startDate, "MMMM d, yyyy")}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">End Date</h3>
                  <p className="flex items-center">
                    {project.endDate ? (
                      <>
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {typeof project.endDate === 'string'
                          ? project.endDate
                          : format(project.endDate, "MMMM d, yyyy")}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Created</h3>
                <p className="text-sm text-muted-foreground">
                  {typeof project.createdAt === 'string'
                    ? project.createdAt
                    : format(project.createdAt, "MMMM d, yyyy")}
                </p>
                {project.updatedAt && (
                  <p className="text-sm text-muted-foreground">
                    Last updated: {typeof project.updatedAt === 'string'
                      ? project.updatedAt
                      : format(project.updatedAt, "MMMM d, yyyy")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>People assigned to this project</CardDescription>
                </div>
                {isAdminOrSupervisor && availableUsers.length > 0 && (
                  <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                          Assign a new user to this project and set their role.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <h3 className="font-medium">Select User</h3>
                          <Select 
                            value={selectedUserId} 
                            onValueChange={setSelectedUserId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableUsers.map((user) => (
                                <SelectItem key={user.uid} value={user.uid}>
                                  {user.displayName || user.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">Select Role</h3>
                          <Select 
                            value={selectedRole} 
                            onValueChange={(value) => setSelectedRole(value as ProjectRole)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {projectRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="button" onClick={handleAddUser}>
                          Add to Project
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {project.users && project.users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      {isAdminOrSupervisor && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.photoURL || undefined} />
                              <AvatarFallback>
                                {user.displayName 
                                  ? user.displayName.charAt(0).toUpperCase()
                                  : user.email?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.displayName || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isAdminOrSupervisor ? (
                            <Select 
                              defaultValue={user.role} 
                              onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {projectRoles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>{user.role}</span>
                          )}
                        </TableCell>
                        {isAdminOrSupervisor && (
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Remove
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove {user.displayName || user.email} from the project.
                                    You can add them back later if needed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveUser(user.id)}>
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No team members</h3>
                  <p className="text-muted-foreground mb-4">
                    This project doesn't have any team members assigned yet.
                  </p>
                  {isAdminOrSupervisor && availableUsers.length > 0 && (
                    <Button onClick={() => setIsAddUserDialogOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Activity Filters</CardTitle>
              <CardDescription>
                Search and filter project activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select 
                    value={activityTypeFilter} 
                    onValueChange={(value) => setActivityTypeFilter(value as ActivityType | "all")}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {activityTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium mb-2">Start Date</h3>
                    <Input
                      type="date"
                      value={dateRangeFilter.startDate}
                      onChange={(e) => setDateRangeFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium mb-2">End Date</h3>
                    <Input
                      type="date"
                      value={dateRangeFilter.endDate}
                      onChange={(e) => setDateRangeFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={handleResetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div id="activity-form">
                <ActivityForm 
                  projectId={projectId || ""}
                  onSubmit={handleActivitySubmit}
                  initialData={editingActivity || undefined}
                  isSubmitting={activitySubmitting}
                />
              </div>
              {editingActivity && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setEditingActivity(null)}
                  >
                    Cancel Editing
                  </Button>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              {activitiesLoading ? (
                <Card>
                  <CardContent className="flex justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredActivities.length} of {activities.length} activities
                    </p>
                  </div>
                  
                  <Tabs defaultValue="timeline" className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      <TabsTrigger value="list">List</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="timeline">
                      {/* Timeline view */}
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-8">
                            {filteredActivities.length > 0 ? (
                              filteredActivities
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((activity, index) => (
                                  <div key={activity.id} className="relative pl-8 pb-8">
                                    {/* Timeline connector */}
                                    {index < filteredActivities.length - 1 && (
                                      <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-muted" />
                                    )}
                                    
                                    {/* Activity type indicator */}
                                    <div 
                                      className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center
                                        ${activity.type === "Drilling" ? "bg-blue-100 text-blue-700" :
                                          activity.type === "Blasting" ? "bg-red-100 text-red-700" :
                                          activity.type === "Hauling" ? "bg-orange-100 text-orange-700" :
                                          activity.type === "Excavation" ? "bg-amber-100 text-amber-700" :
                                          activity.type === "Demolition" ? "bg-purple-100 text-purple-700" :
                                          activity.type === "Clearance" ? "bg-green-100 text-green-700" :
                                          activity.type === "Survey" ? "bg-cyan-100 text-cyan-700" :
                                          activity.type === "Training" ? "bg-indigo-100 text-indigo-700" :
                                          "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                      <span className="text-xs font-bold">{activity.type.charAt(0)}</span>
                                    </div>
                                    
                                    <div className="flex flex-col space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">{activity.type}</Badge>
                                        <Badge variant="outline">{activity.shift} Shift</Badge>
                                        <span className="text-sm text-muted-foreground">
                                          {typeof activity.date === 'string'
                                            ? format(new Date(activity.date), "MMM d, yyyy")
                                            : format(activity.date, "MMM d, yyyy")}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Crew: {activity.crew}</span>
                                      </div>
                                      
                                      {activity.remarks && (
                                        <p className="text-sm text-muted-foreground">{activity.remarks}</p>
                                      )}
                                      
                                      <div className="flex justify-end gap-2 mt-2">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => handleEditActivity(activity)}
                                        >
                                          <Pencil className="h-4 w-4 mr-1" /> Edit
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8">
                                <p className="text-muted-foreground">No activities to display</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="list">
                      <ActivityList 
                        activities={filteredActivities}
                        onEdit={handleEditActivity}
                        onDelete={handleDeleteActivity}
                      />
                    </TabsContent>
                  </Tabs>
                  
                  {filteredActivities.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No activities found</h3>
                      <p className="text-muted-foreground text-center">
                        {activities.length > 0 
                          ? "Try adjusting your filters or search query."
                          : "No activities have been logged for this project yet."}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail; 
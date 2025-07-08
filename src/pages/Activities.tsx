import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getProjectsByUser } from "@/lib/services/project-service";
import { getActivitiesByProject } from "@/lib/services/activity-service";
import { Activity } from "@/lib/types/activity";
import { Project } from "@/lib/types/project";
import { format } from "date-fns";

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, ClipboardList, Filter, Search } from "lucide-react";

export default function Activities() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  
  // Filter states
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch user's projects and activities
  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);
  
  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [projectFilter, activityTypeFilter, searchQuery, activities]);
  
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Get all projects the user has access to
      const userProjects = await getProjectsByUser(currentUser!.uid);
      setProjects(userProjects);
      
      // Fetch activities from all projects
      const allActivities: Activity[] = [];
      
      await Promise.all(
        userProjects.map(async (project) => {
          const projectActivities = await getActivitiesByProject(project.id);
          // Add project information to each activity
          const activitiesWithProject = projectActivities.map(activity => ({
            ...activity,
            projectName: project.name,
            projectId: project.id
          }));
          allActivities.push(...activitiesWithProject);
        })
      );
      
      // Sort activities by date (newest first)
      const sortedActivities = allActivities.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      
      setActivities(sortedActivities);
      setFilteredActivities(sortedActivities);
      
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your activities. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...activities];
    
    // Filter by project
    if (projectFilter !== "all") {
      result = result.filter(activity => activity.projectId === projectFilter);
    }
    
    // Filter by activity type
    if (activityTypeFilter !== "all") {
      result = result.filter(activity => activity.type === activityTypeFilter);
    }
    
    // Filter by search query (check crew and remarks)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        activity => 
          (activity.crew && activity.crew.toLowerCase().includes(query)) ||
          (activity.remarks && activity.remarks.toLowerCase().includes(query))
      );
    }
    
    setFilteredActivities(result);
  };
  
  // Get unique activity types from all activities
  const uniqueActivityTypes = Array.from(new Set(activities.map(activity => activity.type)));
  
  // Get shift color class
  const getShiftColor = (shift: string) => {
    switch(shift) {
      case "Morning":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "Afternoon":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "Night":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <ClipboardList className="mr-2 h-8 w-8" /> Activities Log
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Activities</CardTitle>
          <CardDescription>Daily activities logged across all your projects</CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="text-sm font-medium mb-2">Filter by Project</div>
              <Select 
                value={projectFilter} 
                onValueChange={setProjectFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-medium mb-2">Filter by Activity Type</div>
              <Select 
                value={activityTypeFilter} 
                onValueChange={setActivityTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueActivityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-medium mb-2">Search</div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by crew or remarks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No activities found</h3>
              <p className="text-muted-foreground mb-4">
                {activities.length === 0 
                  ? "No activities have been logged across your projects yet." 
                  : "No activities match your current filters."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Crew</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {typeof activity.date === 'string'
                          ? activity.date
                          : format(activity.date, "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link 
                        to={`/projects/${activity.projectId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {activity.projectName}
                      </Link>
                    </TableCell>
                    <TableCell>{activity.type}</TableCell>
                    <TableCell>
                      <Badge className={getShiftColor(activity.shift)}>
                        {activity.shift}
                      </Badge>
                    </TableCell>
                    <TableCell>{activity.crew}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {activity.remarks || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {filteredActivities.length > 0 && (
                <TableCaption>
                  Showing {filteredActivities.length} of {activities.length} activities
                </TableCaption>
              )}
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
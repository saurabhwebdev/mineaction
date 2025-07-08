import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Project } from "@/lib/types/project";
import { Activity } from "@/lib/types/activity";
import { Action } from "@/lib/types/action";
import { getProjectsByUser } from "@/lib/services/project-service";
import { getActivitiesByProject } from "@/lib/services/activity-service";
import { getAllActions } from "@/lib/services/action-service";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clock,
  Activity as ActivityIcon,
  Briefcase,
  AlertCircle,
} from "lucide-react";


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<"week" | "month">("week");

  // Stats
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    todayActivities: 0,
    openActions: 0,
    closedActions: 0,
    overdueActions: 0,
  });

  // Fetch all data
  useEffect(() => {
    if (currentUser?.uid) {
      fetchDashboardData();
    }
  }, [currentUser?.uid]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching dashboard data for user:', currentUser?.uid);
      
      // Fetch projects
      const userProjects = await getProjectsByUser(currentUser!.uid);
      console.log('Fetched projects:', userProjects);
      setProjects(userProjects);

      // Create a map of project IDs to names for quick lookup
      const projectMap = new Map(userProjects.map(p => [p.id, p.name]));

      // Fetch activities from all projects
      const allActivities: Activity[] = [];
      await Promise.all(
        userProjects.map(async (project) => {
          const projectActivities = await getActivitiesByProject(project.id);
          allActivities.push(...projectActivities.map(activity => ({
            ...activity,
            projectName: projectMap.get(project.id) || 'Unknown Project',
            projectId: project.id
          })));
        })
      );

      // Sort activities by date (newest first)
      const sortedActivities = allActivities.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      setActivities(sortedActivities);

      // Fetch actions
      const allActions = await getAllActions();
      
      // Sort actions by due date (closest first)
      const sortedActions = allActions.sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      });
      setActions(sortedActions);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setStats({
        totalProjects: userProjects.length,
        activeProjects: userProjects.filter(p => p.status === "Active").length,
        todayActivities: allActivities.filter(a => {
          const activityDate = new Date(a.date);
          activityDate.setHours(0, 0, 0, 0);
          return activityDate.getTime() === today.getTime();
        }).length,
        openActions: allActions.filter(a => a.status !== "Completed").length,
        closedActions: allActions.filter(a => a.status === "Completed").length,
        overdueActions: allActions.filter(a => {
          if (a.status === "Completed") return false;
          const dueDate = new Date(a.dueDate);
          return dueDate < today;
        }).length,
      });

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button onClick={() => fetchDashboardData()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => fetchDashboardData()}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Refreshing...
            </>
          ) : (
            'Refresh Data'
          )}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayActivities}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openActions}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{stats.closedActions} closed</span>
              {stats.overdueActions > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.overdueActions} overdue
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Ongoing Projects */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Ongoing Projects</CardTitle>
            <CardDescription>Active projects and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Recent Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects
                    .filter(project => project.status === "Active")
                    .map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{project.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {/* Calculate progress based on activities */}
                          {Math.round((activities
                            .filter(a => a.projectId === project.id)
                            .length / 100) * 100)}%
                        </TableCell>
                        <TableCell>
                          {activities
                            .filter(a => a.projectId === project.id)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date
                            ? format(new Date(activities
                                .filter(a => a.projectId === project.id)
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
                              ), "MMM d, yyyy")
                            : "No activity"
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Actions Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Overview</CardTitle>
            <CardDescription>Open vs Closed Actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Open", value: stats.openActions },
                      { name: "Closed", value: stats.closedActions },
                      { name: "Overdue", value: stats.overdueActions },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#0088FE] mr-2" />
                  <span className="text-sm">Open</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#00C49F] mr-2" />
                  <span className="text-sm">Closed</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#FFBB28] mr-2" />
                  <span className="text-sm">Overdue</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Activities */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Today's Activities</CardTitle>
            <CardDescription>Activities logged across all projects today</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities
                    .filter(activity => {
                      const activityDate = new Date(activity.date);
                      const today = new Date();
                      return (
                        activityDate.getDate() === today.getDate() &&
                        activityDate.getMonth() === today.getMonth() &&
                        activityDate.getFullYear() === today.getFullYear()
                      );
                    })
                    .map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{format(new Date(activity.date), "HH:mm")}</TableCell>
                        <TableCell className="font-medium">{activity.projectName}</TableCell>
                        <TableCell>{activity.type}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{activity.shift}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Overdue Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overdue Actions</CardTitle>
              {stats.overdueActions > 0 && (
                <Badge variant="destructive">{stats.overdueActions} overdue</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {actions
                .filter(action => {
                  if (action.status === "Completed") return false;
                  const dueDate = new Date(action.dueDate);
                  return dueDate < new Date();
                })
                .map((action) => (
                  <div
                    key={action.id}
                    className="mb-4 rounded-lg border p-3 hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{action.issue}</div>
                      <Badge variant="outline">
                        {format(new Date(action.dueDate), "MMM d")}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Assigned to: {action.responsiblePerson}
                    </div>
                  </div>
                ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

    </div>
  );
} 
import { useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { Activity } from "@/lib/types/activity";
import { deleteActivity } from "@/lib/services/activity-service";
import { ActionList } from "@/components/ActionList";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Clipboard, Trash, Edit, ChevronDown, ChevronUp } from "lucide-react";

interface ActivityListProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}

export default function ActivityList({ activities, onEdit, onDelete }: ActivityListProps) {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  
  // Check if user is admin or supervisor
  const canManageActivities = userData?.role === "Admin" || userData?.role === "Supervisor";

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

  const handleDelete = async (activityId: string) => {
    setDeleteLoading(activityId);
    try {
      await deleteActivity(activityId);
      onDelete(activityId);
      toast({
        title: "Activity deleted",
        description: "The activity log has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete activity. Please try again.",
      });
    } finally {
      setDeleteLoading(null);
    }
  };
  
  const toggleExpand = (activityId: string) => {
    if (expandedActivity === activityId) {
      setExpandedActivity(null);
    } else {
      setExpandedActivity(activityId);
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
          <CardDescription>No activities logged for this project yet.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Clipboard className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">
            No activity records found for this project. Log your first activity using the form.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activities</CardTitle>
        <CardDescription>Daily activities logged for this project</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Crew</TableHead>
              <TableHead>Remarks</TableHead>
              {canManageActivities && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <>
                <TableRow 
                  key={activity.id} 
                  className={expandedActivity === activity.id ? "bg-secondary/20" : ""}
                >
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleExpand(activity.id)}
                      className="p-0 h-8 w-8"
                    >
                      {expandedActivity === activity.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {typeof activity.date === 'string'
                        ? activity.date
                        : format(activity.date, "MMM d, yyyy")}
                    </div>
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
                  {canManageActivities && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(activity)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Activity</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this activity log? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(activity.id)}
                                disabled={deleteLoading === activity.id}
                              >
                                {deleteLoading === activity.id ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
                {expandedActivity === activity.id && (
                  <TableRow>
                    <TableCell colSpan={canManageActivities ? 7 : 6} className="p-0">
                      <div className="p-4 bg-secondary/10">
                        <ActionList 
                          activityId={activity.id} 
                          canEdit={canManageActivities}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 
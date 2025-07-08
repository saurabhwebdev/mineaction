import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { ActionForm } from "@/components/ActionForm";
import { useAuth } from "@/context/AuthContext";
import { Action } from "@/lib/types/action";
import { getActionsByActivity, updateActionStatus, addActionComment } from "@/lib/services/action-service";
import { format } from "date-fns";
import { PlusIcon, CheckCircle, Clock, AlertTriangle, Loader2, FileText, MessageSquare, PaperclipIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActionCommentList } from "@/components/ActionCommentList";
import { ActionEvidence } from "@/components/ActionEvidence";

interface ActionListProps {
  activityId: string;
  canEdit?: boolean;
}

export function ActionList({ activityId, canEdit = false }: ActionListProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [actionToEdit, setActionToEdit] = useState<Action | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const fetchActions = async () => {
    try {
      setLoading(true);
      const fetchedActions = await getActionsByActivity(activityId);
      setActions(fetchedActions);
      setError("");
    } catch (err) {
      console.error("Error fetching actions:", err);
      setError("Failed to load actions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [activityId]);

  const handleStatusChange = async (actionId: string, newStatus: "Pending" | "In Progress" | "Completed" | "Overdue") => {
    try {
      await updateActionStatus(actionId, newStatus);
      
      setActions(actions.map(action => 
        action.id === actionId ? { ...action, status: newStatus } : action
      ));
      
      toast({
        title: "Status updated",
        description: `Action status has been updated to ${newStatus}.`
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Update failed",
        description: "Failed to update action status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async () => {
    if (!selectedAction || !commentText.trim() || !currentUser) return;
    
    try {
      setSubmittingComment(true);
      await addActionComment(selectedAction.id, commentText.trim(), currentUser.uid);
      
      // Update local state
      const updatedAction = { 
        ...selectedAction, 
        comments: [
          ...selectedAction.comments, 
          { 
            id: Date.now().toString(), 
            content: commentText.trim(), 
            createdAt: new Date(),
            createdBy: currentUser.uid
          }
        ] 
      };
      
      setActions(actions.map(action => 
        action.id === selectedAction.id ? updatedAction : action
      ));
      
      setSelectedAction(updatedAction);
      setCommentText("");
      
      toast({
        title: "Comment added",
        description: "Your comment has been added to the action."
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      toast({
        title: "Comment failed",
        description: "Failed to add your comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const filteredActions = () => {
    if (activeTab === "all") return actions;
    if (activeTab === "pending") return actions.filter(a => a.status === "Pending");
    if (activeTab === "in-progress") return actions.filter(a => a.status === "In Progress");
    if (activeTab === "completed") return actions.filter(a => a.status === "Completed");
    if (activeTab === "overdue") return actions.filter(a => a.status === "Overdue");
    if (activeTab === "high-priority") return actions.filter(a => ["High", "Critical"].includes(a.priority));
    return actions;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "Overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "Pending":
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">In Progress</Badge>;
      case "Overdue":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">Overdue</Badge>;
      case "Pending":
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case "Critical":
        return <Badge className="bg-red-500">Critical</Badge>;
      case "High":
        return <Badge className="bg-orange-500">High</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case "Low":
      default:
        return <Badge className="bg-green-500">Low</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading actions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Action Log</h2>
        {canEdit && (
          <Button onClick={() => {
            setActionToEdit(null);
            setShowForm(true);
          }} size="sm">
            <PlusIcon className="mr-2 h-4 w-4" /> Add Action
          </Button>
        )}
      </div>

      {/* Action Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{actionToEdit ? "Edit Action" : "New Action"}</DialogTitle>
            <DialogDescription>
              {actionToEdit 
                ? "Update the details of this corrective/preventive action."
                : "Create a new corrective/preventive action for this activity."
              }
            </DialogDescription>
          </DialogHeader>
          <ActionForm 
            activityId={activityId}
            actionToEdit={actionToEdit ?? undefined}
            onSuccess={() => {
              setShowForm(false);
              fetchActions();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Action Detail Dialog */}
      <Dialog open={!!selectedAction} onOpenChange={(open) => !open && setSelectedAction(null)}>
        {selectedAction && (
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>Action Details</DialogTitle>
                <div className="flex space-x-2">
                  {getPriorityBadge(selectedAction.priority)}
                  {getStatusBadge(selectedAction.status)}
                </div>
              </div>
              <DialogDescription>
                Created on {format(selectedAction.createdAt, "PPP")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-auto max-h-[60vh]">
              <div className="space-y-4 p-1">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Issue</h3>
                  <p className="mt-1">{selectedAction.issue}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Responsible Person</h3>
                    <p className="mt-1">{selectedAction.responsiblePerson}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                    <p className="mt-1">{format(selectedAction.dueDate, "PPP")}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">
                      {canEdit ? (
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={selectedAction.status}
                          onChange={(e) => handleStatusChange(selectedAction.id, e.target.value as any)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      ) : (
                        getStatusBadge(selectedAction.status)
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Evidence Section */}
                <div>
                  <h3 className="text-sm font-medium flex items-center mb-2">
                    <PaperclipIcon className="h-4 w-4 mr-1" />
                    Evidence & Attachments
                  </h3>
                  <ActionEvidence 
                    actionId={selectedAction.id} 
                    evidence={selectedAction.evidence || []} 
                    canUpload={canEdit}
                    onEvidenceAdded={(newEvidence) => {
                      const updatedAction = {
                        ...selectedAction,
                        evidence: [...(selectedAction.evidence || []), newEvidence]
                      };
                      setSelectedAction(updatedAction);
                      setActions(actions.map(a => a.id === selectedAction.id ? updatedAction : a));
                    }}
                  />
                </div>
                
                <Separator />
                
                {/* Comments Section */}
                <div>
                  <h3 className="text-sm font-medium flex items-center mb-2">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Comments
                  </h3>
                  <ActionCommentList comments={selectedAction.comments || []} />
                  
                  {currentUser && (
                    <div className="mt-4 space-y-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={handleAddComment}
                          disabled={!commentText.trim() || submittingComment}
                        >
                          {submittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Tabs for filtering actions */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="high-priority">High Priority</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredActions().length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <FileText className="mx-auto h-8 w-8 opacity-50" />
                <p className="mt-2">No actions found in this category.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 mt-4">
              {filteredActions().map((action) => (
                <Card key={action.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-0">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(action.priority)}
                        {getStatusBadge(action.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Due: {format(action.dueDate, "MMM d, yyyy")}
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2 line-clamp-1">{action.issue}</CardTitle>
                    <CardDescription className="flex items-center">
                      Assigned to: {action.responsiblePerson}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-2 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-secondary">
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {action.comments?.length || 0}
                        </span>
                      </Badge>
                      <Badge variant="outline" className="bg-secondary">
                        <span className="flex items-center">
                          <PaperclipIcon className="h-3 w-3 mr-1" />
                          {action.evidence?.length || 0}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      {canEdit && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setActionToEdit(action);
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedAction(action)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 
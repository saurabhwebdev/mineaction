import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, AlertTriangle, ArrowUpDown, Clock, CheckCircle, FileIcon, RefreshCcw, SearchIcon, SlidersHorizontal, XIcon } from "lucide-react";
import { getAllActions, updateActionStatus } from "@/lib/services/action-service";
import { Action } from "@/lib/types/action";
import { useAuth } from "@/context/AuthContext";
import { ActionCommentList } from "@/components/ActionCommentList";
import { ActionEvidence } from "@/components/ActionEvidence";
import { useToast } from "@/components/ui/use-toast";

export default function ActionTracker() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Filters
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined);
  const [personFilter, setPersonFilter] = useState("");
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const canEdit = currentUser && ["Admin", "Supervisor"].includes(currentUser.role || "");
  
  const fetchActions = async () => {
    try {
      setLoading(true);
      
      const filters = {
        status: statusFilters.length > 0 ? statusFilters : undefined,
        priority: priorityFilters.length > 0 ? priorityFilters : undefined,
        responsiblePerson: personFilter || undefined,
        dueDate: (dateRangeStart || dateRangeEnd) ? {
          start: dateRangeStart,
          end: dateRangeEnd,
        } : undefined,
      };
      
      const fetchedActions = await getAllActions(filters);
      setActions(fetchedActions);
    } catch (error) {
      console.error("Error fetching actions:", error);
      toast({
        title: "Error",
        description: "Failed to load actions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchActions();
  }, []);
  
  const handleStatusChange = async (actionId: string, newStatus: "Pending" | "In Progress" | "Completed" | "Overdue") => {
    try {
      await updateActionStatus(actionId, newStatus);
      
      setActions(actions.map(action => 
        action.id === actionId ? { ...action, status: newStatus } : action
      ));
      
      if (selectedAction && selectedAction.id === actionId) {
        setSelectedAction({ ...selectedAction, status: newStatus });
      }
      
      toast({
        title: "Status updated",
        description: `Action status has been updated to ${newStatus}.`
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update failed",
        description: "Failed to update action status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };
  
  const applyFilters = () => {
    fetchActions();
    setShowFilterPanel(false);
  };
  
  const resetFilters = () => {
    setStatusFilters([]);
    setPriorityFilters([]);
    setDateRangeStart(undefined);
    setDateRangeEnd(undefined);
    setPersonFilter("");
  };
  
  const filteredActions = actions
    .filter(action => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        action.issue.toLowerCase().includes(searchLower) ||
        action.responsiblePerson.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        return sortDirection === "asc" 
          ? a.dueDate.getTime() - b.dueDate.getTime()
          : b.dueDate.getTime() - a.dueDate.getTime();
      } else if (sortBy === "priority") {
        const priorityValues = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
        return sortDirection === "asc"
          ? priorityValues[a.priority as keyof typeof priorityValues] - priorityValues[b.priority as keyof typeof priorityValues]
          : priorityValues[b.priority as keyof typeof priorityValues] - priorityValues[a.priority as keyof typeof priorityValues];
      } else {
        // Default sort by issue
        return sortDirection === "asc"
          ? a.issue.localeCompare(b.issue)
          : b.issue.localeCompare(a.issue);
      }
    });
  
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
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Completed":
        return <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Completed</div>;
      case "In Progress":
        return <div className="flex items-center"><Clock className="h-4 w-4 text-blue-500 mr-1" /> In Progress</div>;
      case "Overdue":
        return <div className="flex items-center"><AlertTriangle className="h-4 w-4 text-red-500 mr-1" /> Overdue</div>;
      case "Pending":
      default:
        return <div className="flex items-center"><Clock className="h-4 w-4 text-yellow-500 mr-1" /> Pending</div>;
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Action Tracker</h1>
          <p className="text-muted-foreground">Monitor and manage all corrective and preventive actions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => fetchActions()} size="sm" variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by issue or responsible person..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button 
          variant={showFilterPanel ? "default" : "outline"}
          onClick={() => setShowFilterPanel(!showFilterPanel)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {(statusFilters.length > 0 || priorityFilters.length > 0 || dateRangeStart || dateRangeEnd || personFilter) && 
            <Badge className="ml-2 bg-primary-foreground text-primary h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {statusFilters.length + priorityFilters.length + (dateRangeStart || dateRangeEnd ? 1 : 0) + (personFilter ? 1 : 0)}
            </Badge>
          }
        </Button>
      </div>
      
      {showFilterPanel && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pending" 
                        checked={statusFilters.includes("Pending")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStatusFilters([...statusFilters, "Pending"]);
                          } else {
                            setStatusFilters(statusFilters.filter(s => s !== "Pending"));
                          }
                        }}
                      />
                      <label htmlFor="pending" className="text-sm font-medium">
                        Pending
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="in-progress" 
                        checked={statusFilters.includes("In Progress")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStatusFilters([...statusFilters, "In Progress"]);
                          } else {
                            setStatusFilters(statusFilters.filter(s => s !== "In Progress"));
                          }
                        }}
                      />
                      <label htmlFor="in-progress" className="text-sm font-medium">
                        In Progress
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="completed" 
                        checked={statusFilters.includes("Completed")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStatusFilters([...statusFilters, "Completed"]);
                          } else {
                            setStatusFilters(statusFilters.filter(s => s !== "Completed"));
                          }
                        }}
                      />
                      <label htmlFor="completed" className="text-sm font-medium">
                        Completed
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="overdue" 
                        checked={statusFilters.includes("Overdue")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStatusFilters([...statusFilters, "Overdue"]);
                          } else {
                            setStatusFilters(statusFilters.filter(s => s !== "Overdue"));
                          }
                        }}
                      />
                      <label htmlFor="overdue" className="text-sm font-medium">
                        Overdue
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Priority</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="critical" 
                        checked={priorityFilters.includes("Critical")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPriorityFilters([...priorityFilters, "Critical"]);
                          } else {
                            setPriorityFilters(priorityFilters.filter(p => p !== "Critical"));
                          }
                        }}
                      />
                      <label htmlFor="critical" className="text-sm font-medium">
                        Critical
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="high" 
                        checked={priorityFilters.includes("High")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPriorityFilters([...priorityFilters, "High"]);
                          } else {
                            setPriorityFilters(priorityFilters.filter(p => p !== "High"));
                          }
                        }}
                      />
                      <label htmlFor="high" className="text-sm font-medium">
                        High
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="medium" 
                        checked={priorityFilters.includes("Medium")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPriorityFilters([...priorityFilters, "Medium"]);
                          } else {
                            setPriorityFilters(priorityFilters.filter(p => p !== "Medium"));
                          }
                        }}
                      />
                      <label htmlFor="medium" className="text-sm font-medium">
                        Medium
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="low" 
                        checked={priorityFilters.includes("Low")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPriorityFilters([...priorityFilters, "Low"]);
                          } else {
                            setPriorityFilters(priorityFilters.filter(p => p !== "Low"));
                          }
                        }}
                      />
                      <label htmlFor="low" className="text-sm font-medium">
                        Low
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Due Date Range</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-1">Start Date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {dateRangeStart ? (
                            format(dateRangeStart, "PPP")
                          ) : (
                            <span className="text-muted-foreground">Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRangeStart}
                          onSelect={setDateRangeStart}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <p className="text-sm mb-1">End Date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {dateRangeEnd ? (
                            format(dateRangeEnd, "PPP")
                          ) : (
                            <span className="text-muted-foreground">Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRangeEnd}
                          onSelect={setDateRangeEnd}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Responsible Person</h3>
                <Input
                  placeholder="Filter by name..."
                  value={personFilter}
                  onChange={(e) => setPersonFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("priority")}
                    >
                      Priority
                      {sortBy === "priority" && (
                        <ArrowUpDown className={cn("ml-2 h-4 w-4", sortDirection === "desc" && "rotate-180")} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("issue")}
                    >
                      Issue
                      {sortBy === "issue" && (
                        <ArrowUpDown className={cn("ml-2 h-4 w-4", sortDirection === "desc" && "rotate-180")} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Responsible Person</TableHead>
                  <TableHead className="w-[120px]">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("dueDate")}
                    >
                      Due Date
                      {sortBy === "dueDate" && (
                        <ArrowUpDown className={cn("ml-2 h-4 w-4", sortDirection === "desc" && "rotate-180")} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <FileIcon className="h-8 w-8 animate-pulse opacity-50" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Loading actions...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredActions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <FileIcon className="h-8 w-8 opacity-50" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">No actions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActions.map((action) => (
                    <TableRow 
                      key={action.id} 
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        action.status === "Overdue" && "bg-red-50",
                        action.priority === "Critical" && "bg-orange-50"
                      )}
                      onClick={() => setSelectedAction(action)}
                    >
                      <TableCell>{getPriorityBadge(action.priority)}</TableCell>
                      <TableCell className="font-medium">
                        <div className="line-clamp-2">{action.issue}</div>
                      </TableCell>
                      <TableCell>{action.responsiblePerson}</TableCell>
                      <TableCell>
                        {format(action.dueDate, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(action.status)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAction(action);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Action Details Dialog */}
      <Dialog open={!!selectedAction} onOpenChange={(open) => !open && setSelectedAction(null)}>
        {selectedAction && (
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{selectedAction.issue}</h2>
                <p className="text-sm text-muted-foreground">Created on {format(selectedAction.createdAt, "PPP")}</p>
              </div>
              <div className="flex space-x-2">
                {getPriorityBadge(selectedAction.priority)}
              </div>
            </div>
            
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <Select 
                          value={selectedAction.status}
                          onValueChange={(value) => handleStatusChange(
                            selectedAction.id, 
                            value as "Pending" | "In Progress" | "Completed" | "Overdue"
                          )}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getStatusBadge(selectedAction.status)
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Activity ID</h3>
                    <p className="mt-1">{selectedAction.activityId}</p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Evidence Section */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Evidence & Attachments</h3>
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
                    }}
                  />
                </div>
                
                <Separator />
                
                {/* Comments Section */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Comments</h3>
                  <ActionCommentList comments={selectedAction.comments || []} />
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
} 
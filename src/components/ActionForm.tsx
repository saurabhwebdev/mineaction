import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ActionFormData } from "@/lib/types/action";
import { createAction, updateAction } from "@/lib/services/action-service";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  issue: z.string().min(5, {
    message: "Issue description must be at least 5 characters.",
  }),
  responsiblePerson: z.string().min(2, {
    message: "Responsible person must be at least 2 characters.",
  }),
  dueDate: z.date({
    required_error: "A due date is required.",
  }),
  priority: z.enum(["Low", "Medium", "High", "Critical"], {
    required_error: "Please select a priority level.",
  }),
  status: z.enum(["Pending", "In Progress", "Completed", "Overdue"], {
    required_error: "Please select a status.",
  }),
});

interface ActionFormProps {
  activityId: string;
  actionToEdit?: {
    id: string;
    issue: string;
    responsiblePerson: string;
    dueDate: Date;
    priority: "Low" | "Medium" | "High" | "Critical";
    status: "Pending" | "In Progress" | "Completed" | "Overdue";
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function ActionForm({ 
  activityId, 
  actionToEdit, 
  onSuccess, 
  onCancel 
}: ActionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: actionToEdit ? {
      issue: actionToEdit.issue,
      responsiblePerson: actionToEdit.responsiblePerson,
      dueDate: actionToEdit.dueDate,
      priority: actionToEdit.priority,
      status: actionToEdit.status,
    } : {
      issue: "",
      responsiblePerson: "",
      status: "Pending",
      priority: "Medium",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to perform this action.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const actionData: ActionFormData = {
        issue: values.issue,
        responsiblePerson: values.responsiblePerson,
        dueDate: values.dueDate,
        priority: values.priority,
        status: values.status,
      };
      
      if (actionToEdit) {
        await updateAction(actionToEdit.id, actionData);
        toast({
          title: "Action updated",
          description: "The action has been successfully updated.",
        });
      } else {
        await createAction(activityId, actionData, currentUser.uid);
        toast({
          title: "Action created",
          description: "A new action has been successfully created.",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving action:", error);
      toast({
        title: "Error",
        description: "Failed to save the action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="issue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the issue or required action..." {...field} />
              </FormControl>
              <FormDescription>
                Clearly describe what needs to be addressed
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsiblePerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsible Person</FormLabel>
              <FormControl>
                <Input placeholder="Name of responsible person" {...field} />
              </FormControl>
              <FormDescription>
                Who is responsible for completing this action
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  When this action should be completed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The urgency level of this action
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Current status of this action
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : actionToEdit ? "Update Action" : "Create Action"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 
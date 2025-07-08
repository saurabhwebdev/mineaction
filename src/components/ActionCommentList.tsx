import { ActionComment } from "@/lib/types/action";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface ActionCommentListProps {
  comments: ActionComment[];
}

export function ActionCommentList({ comments }: ActionCommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        No comments yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <Card key={comment.id} className="p-3">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {comment.createdBy.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium">User ID: {comment.createdBy.substring(0, 8)}...</p>
                <span className="text-xs text-muted-foreground">
                  {format(comment.createdAt, "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 
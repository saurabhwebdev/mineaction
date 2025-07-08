import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ActionEvidence as IActionEvidence } from "@/lib/types/action";
import { addActionEvidence } from "@/lib/services/action-service";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { FileIcon, ImageIcon, Loader2, PaperclipIcon, PlusIcon, XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActionEvidenceProps {
  actionId: string;
  evidence: IActionEvidence[];
  canUpload?: boolean;
  onEvidenceAdded: (evidence: IActionEvidence) => void;
}

export function ActionEvidence({ 
  actionId, 
  evidence, 
  canUpload = false,
  onEvidenceAdded
}: ActionEvidenceProps) {
  const [uploading, setUploading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState<IActionEvidence | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    try {
      setUploading(true);
      
      // Determine if it's an image or document
      const isImage = file.type.startsWith("image/");
      const type = isImage ? "photo" : "file";
      
      // Add the evidence through the service
      await addActionEvidence(actionId, file, type, currentUser.uid);
      
      // Create a mock evidence for immediate UI update
      // The actual evidence data will be fetched on the next data refresh
      const mockEvidence: IActionEvidence = {
        id: Date.now().toString(),
        type,
        url: URL.createObjectURL(file),
        filename: file.name,
        createdAt: new Date(),
        createdBy: currentUser.uid
      };
      
      // Update local state through parent component
      onEvidenceAdded(mockEvidence);
      
      toast({
        title: "Evidence uploaded",
        description: "Your evidence has been successfully uploaded."
      });
      
      // Reset file input
      e.target.value = "";
      
    } catch (error) {
      console.error("Error uploading evidence:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload evidence. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      {/* Image Preview Dialog */}
      <Dialog open={!!showImagePreview} onOpenChange={(open) => !open && setShowImagePreview(null)}>
        {showImagePreview && (
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{showImagePreview.filename}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <img 
                src={showImagePreview.url} 
                alt={showImagePreview.filename}
                className="w-full h-auto" 
              />
            </ScrollArea>
          </DialogContent>
        )}
      </Dialog>
      
      {canUpload && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Upload photos or documents (PDF, Word, Excel) as evidence
          </p>
        </div>
      )}
      
      {evidence && evidence.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {evidence.map((item) => (
            <Card 
              key={item.id}
              className="p-3 cursor-pointer hover:bg-secondary/40 transition-colors"
              onClick={() => {
                if (item.type === "photo") {
                  setShowImagePreview(item);
                } else {
                  // Open file in new window
                  window.open(item.url, "_blank");
                }
              }}
            >
              <div className="flex items-center space-x-2">
                {item.type === "photo" ? (
                  <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center">
                    <FileIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(item.createdAt, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <PaperclipIcon className="h-4 w-4 mx-auto mb-1" />
          No evidence attached yet.
        </div>
      )}
    </div>
  );
} 
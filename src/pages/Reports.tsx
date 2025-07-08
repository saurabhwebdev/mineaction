import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Activity } from "@/lib/types/activity";
import { Action } from "@/lib/types/action";
import { exportToExcel, exportToPDF } from "@/lib/services/export-service";
import { FileSpreadsheet, FileText } from "lucide-react";

export default function Reports() {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel");
  const [loading, setLoading] = useState<{
    activities: boolean;
    actions: boolean;
  }>({
    activities: false,
    actions: false
  });

  const handleExport = async (type: "activities" | "actions") => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      // Fetch data based on type
      let data: Activity[] | Action[] = [];
      
      // TODO: Add data fetching here when needed
      // For now, we'll just show the export functionality
      
      if (exportFormat === "excel") {
        await exportToExcel(data, type);
      } else {
        await exportToPDF(data, type);
      }
      
      toast({
        title: "Export Complete",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} have been exported successfully.`,
      });
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: `Failed to export ${type}. Please try again.`,
      });
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Exports</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Export Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Export Format</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={exportFormat}
              onValueChange={(value: "excel" | "pdf") => setExportFormat(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <div className="flex items-center">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExport("activities")}
              disabled={loading.activities}
            >
              {loading.activities ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Export Activity Logs
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExport("actions")}
              disabled={loading.actions}
            >
              {loading.actions ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Export Action Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
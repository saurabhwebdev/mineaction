import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { AuditLog } from '@/lib/types/audit';
import { auditService } from '@/lib/services/audit-service';

interface DailySummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DailySummaryModal: React.FC<DailySummaryModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadDailySummary();
    }
  }, [open]);

  const loadDailySummary = async () => {
    try {
      setLoading(true);
      const dailyLogs = await auditService.getDailySummary();
      setLogs(dailyLogs);
    } catch (error) {
      console.error('Error loading daily summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const summarizeChanges = () => {
    const summary = {
      actions: {
        created: 0,
        updated: 0,
        deleted: 0,
      },
      activities: {
        created: 0,
        updated: 0,
        deleted: 0,
      },
      projects: {
        created: 0,
        updated: 0,
        deleted: 0,
      },
    };

    logs.forEach(log => {
      summary[`${log.type}s`][log.action]++;
    });

    return summary;
  };

  const summary = summarizeChanges();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Daily Summary - {format(new Date(), 'MMMM d, yyyy')}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>Loading summary...</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Actions</h3>
                  <ul className="space-y-2">
                    <li className="text-green-600">Created: {summary.actions.created}</li>
                    <li className="text-blue-600">Updated: {summary.actions.updated}</li>
                    <li className="text-red-600">Deleted: {summary.actions.deleted}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Activities</h3>
                  <ul className="space-y-2">
                    <li className="text-green-600">Created: {summary.activities.created}</li>
                    <li className="text-blue-600">Updated: {summary.activities.updated}</li>
                    <li className="text-red-600">Deleted: {summary.activities.deleted}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Projects</h3>
                  <ul className="space-y-2">
                    <li className="text-green-600">Created: {summary.projects.created}</li>
                    <li className="text-blue-600">Updated: {summary.projects.updated}</li>
                    <li className="text-red-600">Deleted: {summary.projects.deleted}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              {logs.slice(0, 10).map((log) => (
                <Card key={log.id}>
                  <CardContent className="py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {log.userName} {log.action} a {log.type}
                        </p>
                        {log.details && <p className="text-gray-600">{log.details}</p>}
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(log.timestamp), 'HH:mm')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DailySummaryModal; 
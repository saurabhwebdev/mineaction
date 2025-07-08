import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuditLog, AuditLogType } from '@/lib/types/audit';
import { auditService } from '@/lib/services/audit-service';

const AuditLogPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '' as AuditLogType | '',
    search: '',
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.type) {
        params.type = filters.type;
      }
      const fetchedLogs = await auditService.getLogs(params);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-600';
      case 'update':
        return 'text-blue-600';
      case 'delete':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        log.userName.toLowerCase().includes(searchLower) ||
        log.details?.toLowerCase().includes(searchLower) ||
        log.entityId.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Audit Log</h1>
      
      <div className="flex gap-4 mb-6">
        <Select
          value={filters.type}
          onValueChange={(value) => {
            setFilters(prev => ({ ...prev, type: value as AuditLogType | '' }));
            loadLogs();
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="action">Actions</SelectItem>
            <SelectItem value="activity">Activities</SelectItem>
            <SelectItem value="project">Projects</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="max-w-xs"
        />

        <Button onClick={loadLogs}>Refresh</Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : filteredLogs.length === 0 ? (
          <p>No audit logs found.</p>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="py-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>
                    <span className={getActionColor(log.action)}>
                      {log.action.toUpperCase()}
                    </span>
                    {' '}{log.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>User:</strong> {log.userName}</p>
                  <p><strong>Entity ID:</strong> {log.entityId}</p>
                  {log.details && <p><strong>Details:</strong> {log.details}</p>}
                  {log.changes && log.changes.length > 0 && (
                    <div>
                      <strong>Changes:</strong>
                      <ul className="list-disc list-inside mt-2">
                        {log.changes.map((change, index) => (
                          <li key={index}>
                            {change.field}: {JSON.stringify(change.oldValue)} →{' '}
                            {JSON.stringify(change.newValue)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditLogPage; 
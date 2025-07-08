export type AuditLogType = 'action' | 'activity' | 'project';

export type AuditLogAction = 'create' | 'update' | 'delete';

export interface AuditLog {
  id: string;
  type: AuditLogType;
  action: AuditLogAction;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: Date;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  details?: string;
} 
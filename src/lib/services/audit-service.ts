import { collection, query, orderBy, limit, getDocs, addDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { AuditLog, AuditLogType, AuditLogAction } from '../types/audit';

const COLLECTION_NAME = 'auditLogs';

export const auditService = {
  async createLog(
    type: AuditLogType,
    action: AuditLogAction,
    entityId: string,
    userId: string,
    userName: string,
    changes?: AuditLog['changes'],
    details?: string
  ) {
    const auditLog: Omit<AuditLog, 'id'> = {
      type,
      action,
      entityId,
      userId,
      userName,
      timestamp: new Date(),
      changes,
      details,
    };

    await addDoc(collection(db, COLLECTION_NAME), auditLog);
  },

  async getLogs(params?: {
    type?: AuditLogType;
    entityId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    let q = query(
      collection(db, COLLECTION_NAME),
      orderBy('timestamp', 'desc')
    );

    if (params?.type) {
      q = query(q, where('type', '==', params.type));
    }
    if (params?.entityId) {
      q = query(q, where('entityId', '==', params.entityId));
    }
    if (params?.userId) {
      q = query(q, where('userId', '==', params.userId));
    }
    if (params?.startDate) {
      q = query(q, where('timestamp', '>=', params.startDate));
    }
    if (params?.endDate) {
      q = query(q, where('timestamp', '<=', params.endDate));
    }
    if (params?.limit) {
      q = query(q, limit(params.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AuditLog[];
  },

  async getDailySummary(date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getLogs({
      startDate: startOfDay,
      endDate: endOfDay
    });
  }
}; 
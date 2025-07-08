import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { Action, ActionFormData, ActionComment, ActionEvidence } from '../types/action';
import { auditService } from './audit-service';

const COLLECTION_NAME = 'actions';

export const actionService = {
  async createAction(
    activityId: string,
    actionData: ActionFormData,
    userId: string,
    userName: string
  ): Promise<Action> {
    try {
      const now = Timestamp.now();
      const newAction = {
        ...actionData,
        activityId,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        comments: [],
        evidence: []
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...newAction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await auditService.createLog(
        'action',
        'create',
        docRef.id,
        userId,
        userName,
        undefined,
        `Created action: ${actionData.issue}`
      );

      return {
        id: docRef.id,
        ...newAction
      };
    } catch (error) {
      console.error('Error creating action:', error);
      throw error;
    }
  },

  async updateAction(
    actionId: string,
    updates: Partial<ActionFormData>,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, actionId);
      const oldDoc = await getDoc(docRef);
      const oldData = oldDoc.data() as Action;
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);

      const changes = Object.entries(updates).map(([field, newValue]) => ({
        field,
        oldValue: oldData[field as keyof Action],
        newValue
      }));

      await auditService.createLog(
        'action',
        'update',
        actionId,
        userId,
        userName,
        changes,
        `Updated action: ${oldData.issue}`
      );
    } catch (error) {
      console.error('Error updating action:', error);
      throw error;
    }
  },

  async deleteAction(
    actionId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, actionId);
      const oldDoc = await getDoc(docRef);
      const oldData = oldDoc.data() as Action;
      
      await deleteDoc(docRef);

      await auditService.createLog(
        'action',
        'delete',
        actionId,
        userId,
        userName,
        undefined,
        `Deleted action: ${oldData.issue}`
      );
    } catch (error) {
      console.error('Error deleting action:', error);
      throw error;
    }
  },

  // Get all actions for an activity
  async getActionsByActivity(activityId: string): Promise<Action[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('activityId', '==', activityId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const actions: Action[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        actions.push({
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Action);
      });
      
      return actions;
    } catch (error) {
      console.error('Error getting actions:', error);
      throw error;
    }
  },

  // Get all actions (filterable)
  async getAllActions(
    filters?: { 
      status?: string[],
      priority?: string[], 
      responsiblePerson?: string,
      dueDate?: { start?: Date, end?: Date }
    }
  ): Promise<Action[]> {
    try {
      let q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      
      // Apply filters if provided
      // Note: Firebase has limitations with complex queries
      // For complex filtering, we may need to fetch all and filter client-side
      
      const querySnapshot = await getDocs(q);
      let actions: Action[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        actions.push({
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Action);
      });
      
      // Client-side filtering for more complex filters
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          actions = actions.filter(action => filters.status?.includes(action.status));
        }
        
        if (filters.priority && filters.priority.length > 0) {
          actions = actions.filter(action => filters.priority?.includes(action.priority));
        }
        
        if (filters.responsiblePerson) {
          actions = actions.filter(action => 
            action.responsiblePerson.toLowerCase().includes(filters.responsiblePerson!.toLowerCase())
          );
        }
        
        if (filters.dueDate) {
          if (filters.dueDate.start) {
            actions = actions.filter(action => action.dueDate >= filters.dueDate.start!);
          }
          if (filters.dueDate.end) {
            actions = actions.filter(action => action.dueDate <= filters.dueDate.end!);
          }
        }
      }
      
      return actions;
    } catch (error) {
      console.error('Error getting all actions:', error);
      throw error;
    }
  },

  // Update action status
  async updateActionStatus(
    actionId: string,
    status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue'
  ): Promise<void> {
    try {
      const actionRef = doc(db, COLLECTION_NAME, actionId);
      await updateDoc(actionRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating action status:', error);
      throw error;
    }
  },

  // Add comment to action
  async addActionComment(
    actionId: string,
    content: string,
    userId: string
  ): Promise<void> {
    try {
      const actionRef = doc(db, COLLECTION_NAME, actionId);
      const actionSnap = await getDoc(actionRef);
      
      if (actionSnap.exists()) {
        const actionData = actionSnap.data();
        const comments = actionData.comments || [];
        
        const newComment: ActionComment = {
          id: uuidv4(),
          content,
          createdAt: new Date(),
          createdBy: userId,
        };
        
        comments.push(newComment);
        
        await updateDoc(actionRef, {
          comments,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Add evidence to action
  async addActionEvidence(
    actionId: string,
    file: File,
    type: 'photo' | 'file',
    userId: string
  ): Promise<void> {
    try {
      // Upload file to Firebase Storage
      const fileId = uuidv4();
      const fileExt = file.name.split('.').pop();
      const storagePath = `actions/${actionId}/evidence/${fileId}.${fileExt}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      // Update action document with evidence
      const actionRef = doc(db, COLLECTION_NAME, actionId);
      const actionSnap = await getDoc(actionRef);
      
      if (actionSnap.exists()) {
        const actionData = actionSnap.data();
        const evidence = actionData.evidence || [];
        
        const newEvidence: ActionEvidence = {
          id: fileId,
          type,
          url: downloadUrl,
          filename: file.name,
          createdAt: new Date(),
          createdBy: userId,
        };
        
        evidence.push(newEvidence);
        
        await updateDoc(actionRef, {
          evidence,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error adding evidence:', error);
      throw error;
    }
  },
};

// Stand-alone wrapper exports for backward compatibility with existing components
export async function createAction(
  activityId: string,
  actionData: ActionFormData,
  userId: string,
  userName?: string
) {
  // If no userName is provided, fall back to an empty string
  return actionService.createAction(activityId, actionData, userId, userName ?? "");
}

export async function updateAction(
  actionId: string,
  updates: Partial<ActionFormData>,
  userId?: string,
  userName?: string
) {
  return actionService.updateAction(actionId, updates, userId ?? "", userName ?? "");
}

export async function deleteAction(
  actionId: string,
  userId?: string,
  userName?: string
) {
  return actionService.deleteAction(actionId, userId ?? "", userName ?? "");
}

export function getActionsByActivity(activityId: string) {
  return actionService.getActionsByActivity(activityId);
}

export function getAllActions(filters?: {
  status?: string[];
  priority?: string[];
  responsiblePerson?: string;
  dueDate?: { start?: Date; end?: Date };
}) {
  return actionService.getAllActions(filters);
}

export function updateActionStatus(
  actionId: string,
  status: "Pending" | "In Progress" | "Completed" | "Overdue"
) {
  return actionService.updateActionStatus(actionId, status);
}

export function addActionComment(
  actionId: string,
  content: string,
  userId: string
) {
  return actionService.addActionComment(actionId, content, userId);
}

export function addActionEvidence(
  actionId: string,
  file: File,
  type: "photo" | "file",
  userId: string
) {
  return actionService.addActionEvidence(actionId, file, type, userId);
} 
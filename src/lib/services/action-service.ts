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

const actionsCollection = 'actions';

// Create a new action
export const createAction = async (
  activityId: string,
  actionData: ActionFormData,
  userId: string
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, actionsCollection), {
      ...actionData,
      activityId,
      comments: [],
      evidence: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating action:', error);
    throw error;
  }
};

// Get all actions for an activity
export const getActionsByActivity = async (activityId: string): Promise<Action[]> => {
  try {
    const q = query(
      collection(db, actionsCollection),
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
};

// Get all actions (filterable)
export const getAllActions = async (
  filters?: { 
    status?: string[],
    priority?: string[], 
    responsiblePerson?: string,
    dueDate?: { start?: Date, end?: Date }
  }
): Promise<Action[]> => {
  try {
    let q = query(collection(db, actionsCollection), orderBy('createdAt', 'desc'));
    
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
};

// Update action status
export const updateActionStatus = async (
  actionId: string,
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue'
): Promise<void> => {
  try {
    const actionRef = doc(db, actionsCollection, actionId);
    await updateDoc(actionRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating action status:', error);
    throw error;
  }
};

// Update action details
export const updateAction = async (
  actionId: string,
  actionData: Partial<ActionFormData>
): Promise<void> => {
  try {
    const actionRef = doc(db, actionsCollection, actionId);
    await updateDoc(actionRef, {
      ...actionData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating action:', error);
    throw error;
  }
};

// Add comment to action
export const addActionComment = async (
  actionId: string,
  content: string,
  userId: string
): Promise<void> => {
  try {
    const actionRef = doc(db, actionsCollection, actionId);
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
};

// Add evidence to action
export const addActionEvidence = async (
  actionId: string,
  file: File,
  type: 'photo' | 'file',
  userId: string
): Promise<void> => {
  try {
    // Upload file to Firebase Storage
    const fileId = uuidv4();
    const fileExt = file.name.split('.').pop();
    const storagePath = `actions/${actionId}/evidence/${fileId}.${fileExt}`;
    const storageRef = ref(storage, storagePath);
    
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    
    // Update action document with evidence
    const actionRef = doc(db, actionsCollection, actionId);
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
};

// Delete action
export const deleteAction = async (actionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, actionsCollection, actionId));
  } catch (error) {
    console.error('Error deleting action:', error);
    throw error;
  }
}; 
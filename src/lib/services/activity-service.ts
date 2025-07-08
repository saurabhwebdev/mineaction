import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { Activity, ActivityFormData } from "@/lib/types/activity";
import { auditService } from './audit-service';

// Collection reference
const activitiesRef = collection(db, "activities");

// Get activities by project
export const getActivitiesByProject = async (projectId: string): Promise<Activity[]> => {
  try {
    const q = query(
      activitiesRef,
      where("projectId", "==", projectId),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      } as Activity;
    });
  } catch (error) {
    console.error("Error getting activities by project:", error);
    throw error;
  }
};

// Get activity by ID
export const getActivityById = async (activityId: string): Promise<Activity | null> => {
  try {
    const activityRef = doc(db, "activities", activityId);
    const activityDoc = await getDoc(activityRef);
    
    if (activityDoc.exists()) {
      const data = activityDoc.data();
      return {
        id: activityDoc.id,
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      } as Activity;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting activity by ID:", error);
    throw error;
  }
};

// Create a new activity
export const createActivity = async (
  projectId: string,
  activityData: ActivityFormData, 
  currentUserId: string,
  userName: string
): Promise<Activity> => {
  try {
    const now = Timestamp.now();
    const activityWithMeta = {
      ...activityData,
      projectId,
      createdBy: currentUserId,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(activitiesRef, {
      ...activityWithMeta,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await auditService.createLog(
      'activity',
      'create',
      docRef.id,
      currentUserId,
      userName,
      undefined,
      `Created activity: ${activityData.name}`
    );
    
    return {
      id: docRef.id,
      ...activityData,
      projectId,
      createdBy: currentUserId,
      createdAt: new Date(),
    } as Activity;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

// Update an existing activity
export const updateActivity = async (
  activityId: string, 
  activityData: Partial<ActivityFormData>,
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const activityRef = doc(db, "activities", activityId);
    const oldDoc = await getDoc(activityRef);
    const oldData = oldDoc.data() as Activity;
    
    const updateData = {
      ...activityData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(activityRef, updateData);
    
    const changes = Object.entries(activityData).map(([field, newValue]) => ({
      field,
      oldValue: oldData[field as keyof Activity],
      newValue
    }));
    
    await auditService.createLog(
      'activity',
      'update',
      activityId,
      userId,
      userName,
      changes,
      `Updated activity: ${oldData.name}`
    );
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
};

// Delete an activity
export const deleteActivity = async (
  activityId: string,
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const activityRef = doc(db, "activities", activityId);
    const oldDoc = await getDoc(activityRef);
    const oldData = oldDoc.data() as Activity;
    
    await deleteDoc(activityRef);
    
    await auditService.createLog(
      'activity',
      'delete',
      activityId,
      userId,
      userName,
      undefined,
      `Deleted activity: ${oldData.name}`
    );
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
}; 
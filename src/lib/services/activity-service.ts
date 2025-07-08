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
  currentUserId: string
): Promise<Activity> => {
  try {
    const activityWithMeta = {
      ...activityData,
      projectId,
      createdBy: currentUserId,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(activitiesRef, activityWithMeta);
    
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
  activityData: Partial<ActivityFormData>
): Promise<void> => {
  try {
    const activityRef = doc(db, "activities", activityId);
    
    await updateDoc(activityRef, {
      ...activityData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
};

// Delete an activity
export const deleteActivity = async (activityId: string): Promise<void> => {
  try {
    const activityRef = doc(db, "activities", activityId);
    await deleteDoc(activityRef);
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
}; 
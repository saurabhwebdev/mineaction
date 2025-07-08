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
import { Project, ProjectFormData, ProjectUser, ProjectRole } from "@/lib/types/project";

// Collection reference
const projectsRef = collection(db, "projects");

// Get all projects
export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const q = query(projectsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate,
        endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      } as Project;
    });
  } catch (error) {
    console.error("Error getting all projects:", error);
    throw error;
  }
};

// Get projects by user
export const getProjectsByUser = async (userId: string): Promise<Project[]> => {
  try {
    // First try to get projects where user is the creator
    const creatorQuery = query(
      projectsRef,
      where("createdBy", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const creatorSnapshot = await getDocs(creatorQuery);
    
    // Then get projects where user is in the users array
    const userQuery = query(
      projectsRef,
      where("users", "array-contains", { id: userId }),
      orderBy("createdAt", "desc")
    );
    
    const userSnapshot = await getDocs(userQuery);
    
    // Combine and deduplicate results
    const projectMap = new Map();
    
    [...creatorSnapshot.docs, ...userSnapshot.docs].forEach(doc => {
      if (!projectMap.has(doc.id)) {
        const data = doc.data();
        projectMap.set(doc.id, {
          id: doc.id,
          ...data,
          startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate,
          endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
        } as Project);
      }
    });
    
    return Array.from(projectMap.values());
  } catch (error) {
    console.error("Error getting projects by user:", error);
    throw error;
  }
};

// Get project by ID
export const getProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const data = projectDoc.data();
      return {
        id: projectDoc.id,
        ...data,
        startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate,
        endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      } as Project;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting project by ID:", error);
    throw error;
  }
};

// Create a new project
export const createProject = async (
  projectData: ProjectFormData, 
  currentUserId: string,
  projectUsers: ProjectUser[] = []
): Promise<Project> => {
  try {
    // Ensure creator is in the users array as Project Manager
    const creatorInUsers = projectUsers.some(user => user.id === currentUserId);
    const finalUsers = creatorInUsers ? projectUsers : [
      {
        id: currentUserId,
        role: "Project Manager" as ProjectRole,
        email: null, // These will be populated from the auth context in the UI
        displayName: null
      },
      ...projectUsers
    ];

    const projectWithMeta = {
      ...projectData,
      createdBy: currentUserId,
      createdAt: serverTimestamp(),
      users: finalUsers,
    };
    
    const docRef = await addDoc(projectsRef, projectWithMeta);
    
    return {
      id: docRef.id,
      ...projectData,
      createdBy: currentUserId,
      createdAt: new Date(),
      users: finalUsers,
    } as Project;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

// Update an existing project
export const updateProject = async (
  projectId: string, 
  projectData: Partial<ProjectFormData>
): Promise<void> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

// Add user to project
export const addUserToProject = async (
  projectId: string, 
  user: ProjectUser
): Promise<void> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      const updatedUsers = [...(projectData.users || []), user];
      
      await updateDoc(projectRef, { 
        users: updatedUsers,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error adding user to project:", error);
    throw error;
  }
};

// Update user role in project
export const updateUserRoleInProject = async (
  projectId: string,
  userId: string,
  newRole: string
): Promise<void> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      const updatedUsers = projectData.users.map((user: ProjectUser) => {
        if (user.id === userId) {
          return { ...user, role: newRole };
        }
        return user;
      });
      
      await updateDoc(projectRef, { 
        users: updatedUsers,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error updating user role in project:", error);
    throw error;
  }
};

// Remove user from project
export const removeUserFromProject = async (
  projectId: string,
  userId: string
): Promise<void> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (projectDoc.exists()) {
      const projectData = projectDoc.data();
      const updatedUsers = projectData.users.filter(
        (user: ProjectUser) => user.id !== userId
      );
      
      await updateDoc(projectRef, { 
        users: updatedUsers,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error removing user from project:", error);
    throw error;
  }
}; 
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { UserRole } from "@/context/AuthContext";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJ1WIK9ookaRLj_Eo9hCaNoBkSdKwrHqw",
  authDomain: "mineaction-f284e.firebaseapp.com",
  projectId: "mineaction-f284e",
  storageBucket: "mineaction-f284e.firebasestorage.app",
  messagingSenderId: "209452722075",
  appId: "1:209452722075:web:f5cb9f0ce406b7c703e33e",
  measurementId: "G-XTV3Q0048G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Authentication Function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Sign out function
export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

// User role management functions
export const setUserRole = async (userId: string, role: UserRole) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role });
    return true;
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
};

export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

// Initialize a new user in Firestore
export const initializeNewUser = async (user: any, defaultRole: UserRole = "Operator") => {
  if (!user) return null;
  
  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    // Only create a new user document if it doesn't exist
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: defaultRole,
        createdAt: new Date()
      });
      return defaultRole;
    } else {
      // If user exists but has no role, assign the default role
      const userData = userDoc.data();
      if (!userData.role) {
        await updateDoc(userRef, { role: defaultRole });
        return defaultRole;
      }
      return userData.role;
    }
  } catch (error) {
    console.error("Error initializing user:", error);
    return null;
  }
};

// Get all users from Firestore
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role
      };
    });
    
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

// Update user role by user ID
export const updateUserRoleById = async (userId: string, role: UserRole) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role });
    return true;
  } catch (error) {
    console.error("Error updating user role by ID:", error);
    throw error;
  }
};

// Get all custom roles
export const getAllRoles = async () => {
  try {
    const rolesRef = collection(db, "roles");
    const querySnapshot = await getDocs(rolesRef);
    
    const roles = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        routes: data.routes || []
      };
    });
    
    return roles;
  } catch (error) {
    console.error("Error getting all roles:", error);
    return [];
  }
};

// Create a new role
export const createNewRole = async (roleData: { name: string; description: string; routes: string[] }) => {
  try {
    const rolesRef = collection(db, "roles");
    
    // Check if role with same name already exists
    const q = query(rolesRef, where("name", "==", roleData.name));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error(`Role with name '${roleData.name}' already exists`);
    }
    
    const docRef = await addDoc(rolesRef, {
      name: roleData.name,
      description: roleData.description,
      routes: roleData.routes || [],
      createdAt: new Date()
    });
    
    return {
      id: docRef.id,
      name: roleData.name,
      description: roleData.description,
      routes: roleData.routes || []
    };
  } catch (error) {
    console.error("Error creating new role:", error);
    throw error;
  }
};

// Update role access routes
export const updateRoleAccess = async (roleId: string, routes: string[]) => {
  try {
    const roleRef = doc(db, "roles", roleId);
    await updateDoc(roleRef, { routes });
    return true;
  } catch (error) {
    console.error("Error updating role access:", error);
    throw error;
  }
};

export default app; 
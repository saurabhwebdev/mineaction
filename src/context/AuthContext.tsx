import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { initializeNewUser, setUserRole as firebaseSetUserRole, getAllRoles } from "@/lib/firebase";

// Default roles
export type DefaultRole = "Admin" | "Supervisor" | "Operator";
export type UserRole = DefaultRole | string | null;

interface UserData {
  uid: string;
  email: string | null;
  role: UserRole;
}

interface RoleWithAccess {
  id: string;
  name: string;
  description: string;
  routes: string[];
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  roles: RoleWithAccess[];
  signIn: () => Promise<User | null>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  hasRouteAccess: (path: string) => boolean;
  setUserRole: (role: UserRole) => Promise<boolean>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [roles, setRoles] = useState<RoleWithAccess[]>([
    { id: "admin", name: "Admin", description: "Full system access", routes: ["/admin", "/profile", "/reports", "/analytics", "/settings"] },
    { id: "supervisor", name: "Supervisor", description: "Supervise operations", routes: ["/profile", "/reports", "/analytics"] },
    { id: "operator", name: "Operator", description: "Basic operations", routes: ["/profile"] },
  ]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch available roles
  const fetchRoles = async () => {
    try {
      const customRoles = await getAllRoles();
      setRoles(prevRoles => {
        // Filter out any custom roles that might be duplicated
        const defaultRoles = prevRoles.filter(role => 
          ["admin", "supervisor", "operator"].includes(role.id)
        );
        return [...defaultRoles, ...customRoles];
      });
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Fetch user data including role from Firestore
  const fetchUserData = async (user: User) => {
    try {
      // Use the initializeNewUser function to ensure the user has a role
      const role = await initializeNewUser(user);
      
      setUserData({
        uid: user.uid,
        email: user.email,
        role: role
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData({
        uid: user.uid,
        email: user.email,
        role: null
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserData(user);
        await fetchRoles();
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        await fetchUserData(user);
        await fetchRoles();
      }
      return user;
    } catch (error) {
      console.error("Error during sign in:", error);
      return null;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUserData(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  // Helper function to check if user has one of the specified roles
  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!userData || !userData.role) return false;
    return allowedRoles.includes(userData.role);
  };
  
  // Helper function to check if user has access to a specific route
  const hasRouteAccess = (path: string): boolean => {
    if (!userData || !userData.role) return false;
    
    // Admin role has access to everything
    if (userData.role === "Admin") return true;
    
    // Find the role object that matches the user's role
    const userRoleObj = roles.find(role => role.name === userData.role);
    if (!userRoleObj) return false;
    
    // Check if the role has access to the specified path
    return userRoleObj.routes.includes(path);
  };
  
  // Function to update user role
  const setUserRole = async (role: UserRole): Promise<boolean> => {
    if (!currentUser || !role) return false;
    
    try {
      await firebaseSetUserRole(currentUser.uid, role);
      
      // Update local state
      setUserData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          role
        };
      });
      
      return true;
    } catch (error) {
      console.error("Error updating role:", error);
      return false;
    }
  };
  
  // Function to refresh roles
  const refreshRoles = async () => {
    await fetchRoles();
  };

  const value = {
    currentUser,
    userData,
    loading,
    roles,
    signIn,
    logout,
    hasRole,
    hasRouteAccess,
    setUserRole,
    refreshRoles,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
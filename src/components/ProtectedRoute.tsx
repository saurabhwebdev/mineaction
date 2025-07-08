import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/context/AuthContext";

interface RouteAccess {
  path: string;
  allowedRoles: UserRole[];
}

const defaultRoutes: RouteAccess[] = [
  {
    path: "/dashboard",
    allowedRoles: ["Admin", "Supervisor"]
  },
  {
    path: "/projects",
    allowedRoles: ["Admin", "Supervisor", "Operator"]
  },
  {
    path: "/activities",
    allowedRoles: ["Admin", "Supervisor", "Operator"]
  },
  {
    path: "/action-tracker",
    allowedRoles: ["Admin", "Supervisor", "Operator"]
  },
  {
    path: "/reports",
    allowedRoles: ["Admin", "Supervisor"]
  },
  {
    path: "/admin",
    allowedRoles: ["Admin"]
  }
];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser: user, userData } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Find the route configuration for the current path
  const currentRoute = defaultRoutes.find(route => {
    // Check if the current path starts with the route path
    // This handles nested routes (e.g., /projects/123 matches /projects)
    return location.pathname.startsWith(route.path);
  });

  if (currentRoute && userData?.role) {
    // Check if user's role is allowed for this route
    if (!currentRoute.allowedRoles.includes(userData.role)) {
      // Redirect to unauthorized page if user doesn't have permission
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If no specific route configuration is found, or user has permission, render the route
  return <>{children}</>;
} 
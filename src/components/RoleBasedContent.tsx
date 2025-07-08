import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/context/AuthContext";

interface RoleBasedContentProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleBasedContent({ children, allowedRoles }: RoleBasedContentProps) {
  const { userData } = useAuth();

  // If no user data or role, don't render anything
  if (!userData?.role) {
    return null;
  }

  // Check if user's role is in the allowed roles
  if (!allowedRoles.includes(userData.role)) {
    return null;
  }

  // User has permission, render the content
  return <>{children}</>;
} 
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/context/AuthContext";
import RoleBasedContent from "./RoleBasedContent";
import DailySummaryModal from './DailySummaryModal';
import { useState } from 'react';

const navLinks = [
  { name: "Home", path: "/" }
];

const roleBasedLinks: Record<UserRole, Array<{ name: string; path: string }>> = {
  "Admin": [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "Activities Log", path: "/activities" },
    { name: "Action Tracker", path: "/action-tracker" },
    { name: "Reports", path: "/reports" },
    { name: "Settings", path: "/admin" },
    { name: "Help", path: "/help" },
  ],
  "Supervisor": [
    { name: "Projects", path: "/projects" },
    { name: "Activities Log", path: "/activities" },
    { name: "Action Tracker", path: "/action-tracker" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Reports", path: "/reports" },
    { name: "Help", path: "/help" },
  ],
  "Operator": [
    { name: "Projects", path: "/projects" },
    { name: "Activities Log", path: "/activities" },
    { name: "Action Tracker", path: "/action-tracker" },
    { name: "Tasks", path: "/tasks" },
    { name: "Help", path: "/help" },
  ],
  null: []
};

export default function Navbar() {
  const location = useLocation();
  const { currentUser, userData, signIn, logout } = useAuth();
  const [showDailySummary, setShowDailySummary] = useState(false);
  
  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="py-4 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          MineAction
        </Link>
        
        <nav>
          <ul className="flex items-center gap-2 p-1 rounded-full bg-gray-100">
            {/* Show navLinks only when not authenticated */}
            {!currentUser && navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-white text-black shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
            
            {/* Role-based navigation links */}
            {userData?.role && roleBasedLinks[userData.role].map((link) => {
              const isActive = location.pathname === link.path || 
                (link.path === '/projects' && location.pathname.startsWith('/projects')) ||
                (link.path === '/activities' && location.pathname.startsWith('/activities')) ||
                (link.path === '/action-tracker' && location.pathname.startsWith('/action-tracker'));
              
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-white text-black shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="flex items-center gap-4">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  {currentUser.photoURL ? (
                    <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || "User"} />
                  ) : (
                    <AvatarFallback>{currentUser.displayName?.charAt(0) || "U"}</AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {currentUser.displayName || currentUser.email}
                  {userData?.role && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Role: {userData.role}
                    </div>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>

                <RoleBasedContent allowedRoles={["Admin", "Supervisor"]}>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                </RoleBasedContent>
                
                {userData?.role && (
                  <DropdownMenuItem asChild>
                    <Link to="/projects">My Projects</Link>
                  </DropdownMenuItem>
                )}
                
                {userData?.role && (
                  <DropdownMenuItem asChild>
                    <Link to="/activities">Activities Log</Link>
                  </DropdownMenuItem>
                )}
                
                {userData?.role && (
                  <DropdownMenuItem asChild>
                    <Link to="/action-tracker">Action Tracker</Link>
                  </DropdownMenuItem>
                )}
                
                <RoleBasedContent allowedRoles={["Admin", "Supervisor"]}>
                  <DropdownMenuItem asChild>
                    <Link to="/reports">Reports & Exports</Link>
                  </DropdownMenuItem>
                </RoleBasedContent>

                <RoleBasedContent allowedRoles={["Admin"]}>
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Settings</Link>
                  </DropdownMenuItem>
                </RoleBasedContent>
                
                <DropdownMenuItem asChild>
                  <Link to="/help">Help & Documentation</Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              className="px-4 py-2 text-sm font-medium rounded-full" 
              variant="outline"
              onClick={handleLogin}
            >
              Sign in with Google
            </Button>
          )}

          {currentUser && (
            <Button
              variant="outline"
              className="mr-4"
              onClick={() => setShowDailySummary(true)}
            >
              Daily Summary
            </Button>
          )}
        </div>
      </div>

      {currentUser && (
        <DailySummaryModal
          open={showDailySummary}
          onOpenChange={setShowDailySummary}
        />
      )}
    </header>
  );
} 
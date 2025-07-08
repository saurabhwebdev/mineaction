import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Unauthorized from "./pages/Unauthorized";
import Projects from "./pages/Projects";
import ProjectForm from "./pages/ProjectForm";
import ProjectDetail from "./pages/ProjectDetail";
import Activities from "./pages/Activities";
import ActionTracker from "./pages/ActionTracker";
import Help from "./pages/Help";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import { AuthProvider } from "./context/AuthContext";

// Import Firebase (no need to use it directly here, just initializing)
import "./lib/firebase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Project Management Routes */}
              <Route
                path="projects"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Supervisor", "Operator"]}>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects/new"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Supervisor"]}>
                    <ProjectForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects/:projectId"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Supervisor", "Operator"]}>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects/:projectId/edit"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Supervisor"]}>
                    <ProjectForm />
                  </ProtectedRoute>
                }
              />
              
              {/* Activities Management Route */}
              <Route
                path="activities"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Supervisor", "Operator"]}>
                    <Activities />
                  </ProtectedRoute>
                }
              />
              
              {/* Action Tracker Route */}
              <Route
                path="action-tracker"
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Supervisor", "Operator"]}>
                    <ActionTracker />
                  </ProtectedRoute>
                }
              />
              
              {/* Role-based routes */}
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Supervisor"]}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="reports" 
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Supervisor"]}>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="settings" 
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <div className="py-12 text-center">
                      <h1 className="text-3xl font-bold">Settings</h1>
                      <p className="mt-4">This page is accessible to Admin role only.</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="tasks" 
                element={
                  <ProtectedRoute allowedRoles={["Admin", "Supervisor", "Operator"]}>
                    <div className="py-12 text-center">
                      <h1 className="text-3xl font-bold">Tasks</h1>
                      <p className="mt-4">This page is accessible to all authenticated users with roles.</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Unauthorized route */}
              <Route path="unauthorized" element={<Unauthorized />} />
              
              {/* Public routes */}
              <Route path="about" element={<div className="py-12 text-center"><h1 className="text-3xl font-bold">About MineAction</h1></div>} />
              <Route path="services" element={<div className="py-12 text-center"><h1 className="text-3xl font-bold">Our Services</h1></div>} />
              <Route path="contact" element={<div className="py-12 text-center"><h1 className="text-3xl font-bold">Contact Us</h1></div>} />
              
              {/* Help route */}
              <Route path="help" element={<Help />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

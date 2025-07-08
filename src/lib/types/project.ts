import { User } from "firebase/auth";
import { UserRole } from "@/context/AuthContext";

export type ProjectType = 
  | "Demining" 
  | "Risk Education" 
  | "Victim Assistance" 
  | "Advocacy"
  | "Survey" 
  | "Other";

export interface ProjectUser {
  id: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role: ProjectRole;
}

export type ProjectRole = 
  | "Project Manager"
  | "Field Supervisor"
  | "Technical Advisor"
  | "Team Member"
  | "Observer";

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  location: string;
  startDate: Date | string;
  endDate?: Date | string;
  status: "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled";
  createdBy: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  users: ProjectUser[];
}

export interface ProjectFormData {
  name: string;
  description?: string;
  type: ProjectType;
  location: string;
  startDate: Date | string;
  endDate?: Date | string;
  status: "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled";
} 
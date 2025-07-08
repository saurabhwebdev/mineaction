import { User } from "firebase/auth";
import { UserRole } from "@/context/AuthContext";
import { Timestamp } from 'firebase/firestore';

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

export type ProjectRole = 'Admin' | 'Supervisor' | 'Operator';

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  users: ProjectUser[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProjectFormData {
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  users: ProjectUser[];
} 
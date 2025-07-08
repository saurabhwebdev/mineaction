import { Timestamp } from 'firebase/firestore';

export interface Activity {
  id: string;
  projectId: string;
  name: string;
  description: string;
  type: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  startDate: Date;
  endDate: Date;
  location: string;
  team: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ActivityFormData {
  name: string;
  description: string;
  type: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  startDate: Date;
  endDate: Date;
  location: string;
  team: string[];
} 
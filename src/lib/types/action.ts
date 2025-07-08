import { Timestamp } from 'firebase/firestore';

export interface Action {
  id: string;
  activityId: string;
  issue: string;
  responsiblePerson: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  comments: ActionComment[];
  evidence: ActionEvidence[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ActionComment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface ActionEvidence {
  id: string;
  type: 'photo' | 'file';
  url: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface ActionFormData {
  issue: string;
  responsiblePerson: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
} 
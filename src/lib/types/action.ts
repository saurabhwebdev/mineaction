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
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ActionComment {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
}

export interface ActionEvidence {
  id: string;
  type: 'photo' | 'file';
  url: string;
  filename: string;
  createdAt: Date;
  createdBy: string;
}

export interface ActionFormData {
  issue: string;
  responsiblePerson: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
} 
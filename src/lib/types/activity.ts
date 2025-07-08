export type ActivityType = 
  | "Drilling"
  | "Blasting"
  | "Hauling" 
  | "Excavation"
  | "Demolition"
  | "Clearance"
  | "Survey"
  | "Training"
  | "Other";

export type ShiftType = "Morning" | "Afternoon" | "Night";

export interface Activity {
  id: string;
  projectId: string;
  projectName?: string;
  date: Date | string;
  type: ActivityType;
  shift: ShiftType;
  crew: string;
  remarks?: string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface ActivityFormData {
  date: Date | string;
  type: ActivityType;
  shift: ShiftType;
  crew: string;
  remarks?: string;
} 
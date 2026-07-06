export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'caregiver' | 'carerecipient';
  relationship?: string;
  photo?: string;
  phone?: string;
  address?: string;
  medicalConditions?: string[];
  bloodGroup?: string;
  allergies?: string[];
  insurance?: string;
  emergencyContacts?: { name: string; relation: string; phone: string }[];
  preferredHospital?: string;
  preferredDoctor?: string;
  notificationPreferences?: { email: boolean; sms: boolean; push: boolean };
}

export interface Medication {
  id: string;
  name: string;
  time: string;
  status: 'taken' | 'missed' | 'pending' | 'paused';
  instructions?: string;
  sideEffects?: string[];
  drugWarnings?: string[];
  doctorInfo?: string;
  remainingTablets?: number;
  refillReminder?: boolean;
  history?: { date: string; status: 'taken' | 'missed' }[];
}

export interface WearableData {
  heartRate: number;
  steps: number;
  sleepHours: number;
  battery: number;
  lastSync: string;
  bloodOxygen?: number;
  location?: string;
  deviceType?: 'Apple Health' | 'Google Fit' | 'Fitbit' | 'Garmin' | 'Samsung Health' | 'None';
  status?: 'connected' | 'disconnected' | 'pairing' | 'unauthorized';
  permissions?: {
    heartRate: boolean;
    bloodOxygen: boolean;
    sleep: boolean;
    steps: boolean;
    calories: boolean;
    walkingActivity: boolean;
    hrv: boolean;
    activitySessions: boolean;
  };
  calories?: number;
  walkingActivity?: number;
  hrv?: number;
  activitySessions?: number;
  syncHistory?: {
    timestamp: string;
    status: 'success' | 'failed';
    recordsSynced: number;
    message: string;
    metrics?: {
      heartRate: number;
      bloodOxygen: number;
      sleepHours: number;
      steps: number;
      calories: number;
      walkingActivity: number;
      hrv: number;
      activitySessions: number;
    };
  }[];
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  primaryConditions: string[];
  medications: Medication[];
  wearableData: WearableData;
  relationship?: string;
  email?: string;
  phone?: string;
  emergencyContacts?: { name: string; relation: string; phone: string }[];
  permissions?: string;
  role?: string;
  profilePicture?: string;
  archived?: boolean;
  userId?: string;
}

export interface CheckIn {
  id: string;
  familyMemberId: string;
  timestamp: string;
  status: 'missed' | 'completed' | 'delayed';
  notes: string;
}

export interface Alert {
  id: string;
  familyMemberId: string;
  type: 'checkin_missed' | 'emergency_sos' | 'health_alert' | 'pill_missed';
  status: 'pending' | 'resolved' | 'escalated';
  level: 'low' | 'medium' | 'high';
  reasoningSummary: string;
  createdAt: string;
  message?: string;
  riskScore?: number;
  evidence?: string;
  alternativesConsidered?: string[];
  reasoning?: string;
  medicationStatus?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  step: 'event_bus' | 'planner' | 'health_agent' | 'safety_agent' | 'reflection' | 'action_engine';
  message: string;
  details?: string;
  logs: string[];
  confidenceScore?: number;
  evidence?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface EventData {
  id: string;
  type: 'DailyCheckInMissed' | 'EmergencyTriggered' | 'MoodUpdated' | 'MedicineMissed';
  timestamp: string;
  familyMemberId: string;
  payload: Record<string, any>;
}

export interface Appointment {
  id: string;
  familyMemberId: string;
  doctor: string;
  hospital: string;
  purpose: string;
  time: string;
  location: string;
  onlineLink?: string;
  prescription?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'rescheduled';
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface PrescriptionDocument {
  id: string;
  familyMemberId: string;
  fileName: string;
  doctor: string;
  hospital: string;
  date: string;
  extractedMeds: { name: string; dosage: string; schedule: string }[];
  notes?: string;
}

export interface MedicalReport {
  id: string;
  familyMemberId: string;
  fileName: string;
  type: 'blood_test' | 'ecg' | 'mri' | 'ct_scan' | 'xray' | 'other';
  date: string;
  summary?: string;
  url?: string;
  searchableText?: string;
}

export interface ChildCareWorkflow {
  id: string;
  timestamp: string;
  schoolCheckIn: boolean;
  reachedHome: boolean;
  homeworkCompleted: boolean;
  locationConfirmation: string;
  safeArrival: boolean;
}

export interface WellnessLog {
  id: string;
  familyMemberId?: string;
  timestamp: string;
  mood: number; // 1 to 5
  stressLevel: number; // 1 to 5
  sleepQuality: number; // 1 to 5
  socialInteraction: string;
  journal: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  fontSize: 'sm' | 'md' | 'lg';
  language: string;
  accessibility: boolean;
  notificationPreferences: { email: boolean; sms: boolean; push: boolean };
  aiBehavior: 'standard' | 'clinical' | 'gentle';
  voicePreferences: { voiceName: string; pitch: number; rate: number };
  connectedDevices: string[];
}

export interface Memory {
  id: string;
  familyMemberId: string;
  timestamp: string;
  type: string;
  description: string;
}

export interface WeeklySummary {
  id: string;
  familyMemberId: string;
  weekStartDate: string;
  weekEndDate: string;
  avgHeartRate: number;
  avgSleepHours: number;
  totalSteps: number;
  medicationAdherenceRate: number;
  moodScoreAvg: number;
  rawEventsCount: number;
  computedAt: string;
  trendDirection: 'improving' | 'stable' | 'declining';
  insights: string[];
  clinicalRecommendation?: string;
}


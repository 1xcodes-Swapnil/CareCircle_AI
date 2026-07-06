import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Database from 'better-sqlite3';
import { 
  User, 
  FamilyMember, 
  CheckIn, 
  Alert, 
  AuditLog, 
  Notification,
  Appointment,
  PrescriptionDocument,
  MedicalReport,
  ChildCareWorkflow,
  WellnessLog,
  Memory,
  Medication,
  WeeklySummary
} from '../src/types.js';

function hashPasswordStandalone(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_FILE = path.resolve(DB_DIR, 'carecircle.db');
const sqlite = new Database(DB_FILE);

// Configure SQLite with production best practices
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Initialize SQLite tables and performance-optimizing indexes
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT,
    password TEXT,
    relationship TEXT,
    photo TEXT,
    phone TEXT,
    address TEXT,
    medicalConditions TEXT,
    bloodGroup TEXT,
    allergies TEXT,
    insurance TEXT,
    emergencyContacts TEXT,
    preferredHospital TEXT,
    preferredDoctor TEXT,
    notificationPreferences TEXT
  );

  CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY,
    name TEXT,
    age INTEGER,
    email TEXT,
    phone TEXT,
    primaryConditions TEXT,
    profilePicture TEXT,
    medications TEXT,
    wearableData TEXT,
    relationship TEXT,
    emergencyContacts TEXT,
    userId TEXT
  );

  CREATE TABLE IF NOT EXISTS check_ins (
    id TEXT PRIMARY KEY,
    familyMemberId TEXT,
    timestamp TEXT,
    status TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    createdAt TEXT,
    familyMemberId TEXT,
    type TEXT,
    status TEXT,
    message TEXT,
    riskScore INTEGER,
    evidence TEXT,
    alternativesConsidered TEXT,
    reasoning TEXT,
    medicationStatus TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    eventType TEXT,
    step TEXT,
    message TEXT,
    logs TEXT
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT,
    message TEXT,
    status TEXT,
    createdAt TEXT,
    priority TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    familyMemberId TEXT,
    doctor TEXT,
    hospital TEXT,
    purpose TEXT,
    time TEXT,
    location TEXT,
    onlineLink TEXT,
    prescription TEXT,
    status TEXT,
    recurring TEXT
  );

  CREATE TABLE IF NOT EXISTS prescription_documents (
    id TEXT PRIMARY KEY,
    familyMemberId TEXT,
    fileName TEXT,
    doctor TEXT,
    hospital TEXT,
    date TEXT,
    extractedMeds TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS medical_reports (
    id TEXT PRIMARY KEY,
    familyMemberId TEXT,
    fileName TEXT,
    type TEXT,
    date TEXT,
    summary TEXT,
    url TEXT,
    searchableText TEXT
  );

  CREATE TABLE IF NOT EXISTS child_care_workflows (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    schoolCheckIn INTEGER,
    reachedHome INTEGER,
    homeworkCompleted INTEGER,
    locationConfirmation TEXT,
    safeArrival INTEGER
  );

  CREATE TABLE IF NOT EXISTS wellness_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    mood INTEGER,
    stressLevel INTEGER,
    sleepQuality INTEGER,
    socialInteraction TEXT,
    journal TEXT
  );

  CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    familyMemberId TEXT,
    timestamp TEXT,
    type TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS weekly_summaries (
    id TEXT PRIMARY KEY,
    familyMemberId TEXT,
    weekStartDate TEXT,
    weekEndDate TEXT,
    avgHeartRate REAL,
    avgSleepHours REAL,
    totalSteps INTEGER,
    medicationAdherenceRate REAL,
    moodScoreAvg REAL,
    rawEventsCount INTEGER,
    computedAt TEXT,
    trendDirection TEXT,
    insights TEXT,
    clinicalRecommendation TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_check_ins_family_member ON check_ins (familyMemberId);
  CREATE INDEX IF NOT EXISTS idx_alerts_family_member ON alerts (familyMemberId);
  CREATE INDEX IF NOT EXISTS idx_appointments_family_member ON appointments (familyMemberId);
  CREATE INDEX IF NOT EXISTS idx_prescription_documents_family_member ON prescription_documents (familyMemberId);
  CREATE INDEX IF NOT EXISTS idx_medical_reports_family_member ON medical_reports (familyMemberId);
  CREATE INDEX IF NOT EXISTS idx_memories_family_member ON memories (familyMemberId);
  CREATE INDEX IF NOT EXISTS idx_weekly_summaries_family_member ON weekly_summaries (familyMemberId);
`);

try {
  sqlite.exec('ALTER TABLE family_members ADD COLUMN userId TEXT');
} catch (e) {
  // Column already exists or table doesn't exist yet
}

try {
  sqlite.prepare("UPDATE family_members SET userId = 'usr_sarah' WHERE userId IS NULL").run();
} catch (e) {
  // Table or column doesn't exist yet
}

// Helpers for JSON string serialization
function safeJsonStringify(obj: any): string {
  return JSON.stringify(obj || null);
}

function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch (err) {
    return fallback;
  }
}

// Generate secure & unique IDs appending random suffixes to prevent millisecond collisions
function generateUniqueId(prefix: string): string {
  const rand = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${Date.now()}_${rand}`;
}

const INITIAL_DB = {
  users: [
    {
      id: 'usr_sarah',
      email: 'sarah.vance@example.com',
      name: 'Sarah Vance',
      role: 'caregiver' as const,
      relationship: 'Daughter',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      phone: '+1 (555) 019-2834',
      address: '456 Oakwood Senior Residency, Apt 4C',
      medicalConditions: [],
      bloodGroup: 'A+',
      allergies: [],
      insurance: 'Blue Cross Shield BC789',
      emergencyContacts: [{ name: 'Emergency Dispatch', relation: 'EMS', phone: '911' }],
      preferredHospital: 'Silver Springs Memorial Hospital',
      preferredDoctor: 'Dr. Robert Chen',
      notificationPreferences: { email: true, sms: true, push: true }
    },
    {
      id: 'usr_eleanor',
      email: 'eleanor.vance@example.com',
      name: 'Eleanor Vance',
      role: 'carerecipient' as const,
      photo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150',
      phone: '+1 (555) 012-4820',
      address: '456 Oakwood Senior Residency, Apt 4B',
      medicalConditions: ['Hypertension', 'Early-stage Dementia'],
      bloodGroup: 'O-',
      allergies: ['Penicillin'],
      insurance: 'Medicare Part A/B MC123',
      emergencyContacts: [{ name: 'Sarah Vance', relation: 'Daughter', phone: '+1 (555) 019-2834' }],
      preferredHospital: 'Silver Springs Memorial Hospital',
      preferredDoctor: 'Dr. Robert Chen',
      notificationPreferences: { email: false, sms: true, push: true }
    }
  ],
  familyMembers: [
    {
      id: 'fm_eleanor',
      name: 'Eleanor Vance',
      age: 78,
      email: 'eleanor.vance@example.com',
      phone: '+1 (555) 012-4820',
      primaryConditions: ['Hypertension', 'Early-stage Cognitive Decline (Dementia)'],
      profilePicture: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150',
      medications: [
        { 
          id: 'med_1', 
          name: 'Lisinopril (Hypertension)', 
          time: '08:00 AM', 
          status: 'taken' as const,
          instructions: 'Take 1 tablet (10mg) with a glass of water every morning.',
          sideEffects: ['Dizziness', 'Dry cough', 'Headache'],
          drugWarnings: ['Do not take with potassium supplements.'],
          doctorInfo: 'Dr. Robert Chen',
          remainingTablets: 24,
          refillReminder: true,
          history: []
        },
        { 
          id: 'med_2', 
          name: 'Donepezil (Cognitive Support)', 
          time: '09:00 PM', 
          status: 'pending' as const,
          instructions: 'Take 1 tablet (5mg) right before bedtime with or without food.',
          sideEffects: ['Nausea', 'Diarrhea', 'Insomnia'],
          drugWarnings: ['Avoid taking with NSAIDs.'],
          doctorInfo: 'Dr. Robert Chen',
          remainingTablets: 12,
          refillReminder: true,
          history: []
        },
        { 
          id: 'med_3', 
          name: 'Multivitamin', 
          time: '12:00 PM', 
          status: 'taken' as const,
          instructions: 'Take 1 capsule daily at lunch.',
          sideEffects: ['Mild stomach upset'],
          drugWarnings: [],
          doctorInfo: 'Self',
          remainingTablets: 45,
          refillReminder: false,
          history: []
        }
      ],
      wearableData: {
        heartRate: 72,
        steps: 420,
        sleepHours: 5.8,
        battery: 88,
        lastSync: new Date().toISOString(),
        bloodOxygen: 98,
        location: '456 Oakwood Senior Residency',
        deviceType: 'Fitbit',
        status: 'connected',
        calories: 1450,
        walkingActivity: 42,
        hrv: 55,
        activitySessions: 1,
        permissions: {
          heartRate: true,
          bloodOxygen: true,
          sleep: true,
          steps: true,
          calories: true,
          walkingActivity: true,
          hrv: true,
          activitySessions: true
        },
        syncHistory: [] as any[]
      },
      relationship: 'Mother',
      emergencyContacts: [{ name: 'Sarah Vance', relation: 'Daughter', phone: '+1 (555) 019-2834' }]
    }
  ],
  checkIns: [
    {
      id: 'ch_1',
      familyMemberId: 'fm_eleanor',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
      notes: 'Eleanor completed her check-in yesterday at 9:02 AM. Reported feeling good and slept fine.'
    },
    {
      id: 'ch_2',
      familyMemberId: 'fm_eleanor',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
      notes: 'Completed evening check-in at 8:55 PM. Sarah confirmed meds taken.'
    }
  ],
  alerts: [] as any[],
  auditLogs: [
    {
      id: 'log_seed_1',
      timestamp: new Date().toISOString(),
      eventType: 'SystemBootstrapped',
      step: 'event_bus',
      message: 'CareCircle AI Event Bus & Specialist Agents initialized.',
      logs: ['Event Bus online', 'Planner Agent registry validated', 'MCP server operational']
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      title: 'CareCircle AI Activated',
      message: 'System loaded with 1 registered care recipient: Eleanor Vance.',
      status: 'unread' as const,
      createdAt: new Date().toISOString(),
      priority: 'low' as const
    }
  ],
  appointments: [
    {
      id: 'apt_1',
      familyMemberId: 'fm_eleanor',
      doctor: 'Dr. Robert Chen',
      hospital: 'Silver Springs Memorial Hospital',
      purpose: 'Hypertension and cognitive decline routine quarterly follow-up.',
      time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Outpatient Clinic Room 302',
      onlineLink: 'https://telehealth.example.com/chen-vance',
      prescription: 'Renew Donepezil and Lisinopril refills.',
      status: 'scheduled' as const,
      recurring: 'monthly' as const
    }
  ],
  prescriptionDocuments: [
    {
      id: 'pres_1',
      familyMemberId: 'fm_eleanor',
      fileName: 'Prescription_Lisinopril_Donepezil.pdf',
      doctor: 'Dr. Robert Chen',
      hospital: 'Silver Springs Memorial Hospital',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      extractedMeds: [
        { name: 'Lisinopril', dosage: '10mg once daily', schedule: 'Morning' },
        { name: 'Donepezil', dosage: '5mg once daily', schedule: 'At bedtime' }
      ],
      notes: 'Please verify the dosage matching our smart dispenser schedule.'
    }
  ],
  medicalReports: [
    {
      id: 'rep_1',
      familyMemberId: 'fm_eleanor',
      fileName: 'Blood_Panel_Comprehensive_June.pdf',
      type: 'blood_test' as const,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Sodium levels are stable. Potassium level is 4.1 mEq/L (Normal). Renal panel values are within acceptable bounds.',
      url: '/mock-storage/blood-panel.pdf',
      searchableText: 'Blood panel comprehensive Eleanor Vance Hemoglobin 12.5 Sodium 138 Potassium 4.1'
    }
  ],
  childCareWorkflows: [
    {
      id: 'cc_1',
      timestamp: new Date().toISOString(),
      schoolCheckIn: true,
      reachedHome: true,
      homeworkCompleted: false,
      locationConfirmation: 'Safe Zone (Home)',
      safeArrival: true
    }
  ],
  wellnessLogs: [
    {
      id: 'wel_1',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      mood: 4,
      stressLevel: 2,
      sleepQuality: 4,
      socialInteraction: 'Spoke with Sarah for 20 minutes',
      journal: 'Felt happy to talk to my daughter. Walked around the Oakwood residency garden.'
    }
  ],
  memories: [
    {
      id: 'mem_1',
      familyMemberId: 'fm_eleanor',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'ClinicalPreference' as const,
      description: 'Prefers telehealth calls in the morning before 11:00 AM as her cognitive sharpness is higher.'
    }
  ],
  weeklySummaries: [] as any[]
};

function seedDatabase() {
  const userCount = (sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  if (userCount > 0) return; // Already seeded

  console.log('[SQLite Database] Seeding database...');

  // 1. Seed Users
  const insertUser = sqlite.prepare(`
    INSERT INTO users (
      id, email, name, role, password, relationship, photo, phone, address,
      medicalConditions, bloodGroup, allergies, insurance, emergencyContacts,
      preferredHospital, preferredDoctor, notificationPreferences
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);
  for (const u of INITIAL_DB.users) {
    const pwd = (u as any).password || hashPasswordStandalone('password123');
    insertUser.run(
      u.id, u.email, u.name, u.role, pwd, u.relationship || null, u.photo || null,
      u.phone || null, u.address || null, safeJsonStringify(u.medicalConditions),
      u.bloodGroup || null, safeJsonStringify(u.allergies), u.insurance || null,
      safeJsonStringify(u.emergencyContacts), u.preferredHospital || null,
      u.preferredDoctor || null, safeJsonStringify(u.notificationPreferences)
    );
  }

  // 2. Seed Family Members with high-fidelity historic sync data for Eleanor Vance
  const insertFamilyMember = sqlite.prepare(`
    INSERT INTO family_members (
      id, name, age, email, phone, primaryConditions, profilePicture,
      medications, wearableData, relationship, emergencyContacts, userId
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const eleanor = INITIAL_DB.familyMembers.find(fm => fm.id === 'fm_eleanor');
  if (eleanor && eleanor.wearableData) {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    eleanor.wearableData.lastSync = new Date().toISOString();
    eleanor.wearableData.syncHistory = [
      {
        timestamp: new Date(now - 7 * oneDayMs).toISOString(),
        status: 'success',
        recordsSynced: 32,
        message: 'Automated health telemetry import.',
        metrics: { heartRate: 74, bloodOxygen: 97, sleepHours: 6.2, steps: 4200, calories: 1510, walkingActivity: 32, hrv: 50, activitySessions: 1 }
      },
      {
        timestamp: new Date(now - 6 * oneDayMs).toISOString(),
        status: 'success',
        recordsSynced: 24,
        message: 'Automated health telemetry import.',
        metrics: { heartRate: 72, bloodOxygen: 98, sleepHours: 7.5, steps: 5800, calories: 1720, walkingActivity: 44, hrv: 55, activitySessions: 2 }
      },
      {
        timestamp: new Date(now - 5 * oneDayMs).toISOString(),
        status: 'success',
        recordsSynced: 18,
        message: 'Manual health telemetry import.',
        metrics: { heartRate: 75, bloodOxygen: 98, sleepHours: 5.8, steps: 6100, calories: 1800, walkingActivity: 48, hrv: 54, activitySessions: 2 }
      },
      {
        timestamp: new Date(now - 4 * oneDayMs).toISOString(),
        status: 'success',
        recordsSynced: 28,
        message: 'Periodic telemetry synchronization.',
        metrics: { heartRate: 71, bloodOxygen: 99, sleepHours: 6.9, steps: 4900, calories: 1610, walkingActivity: 38, hrv: 56, activitySessions: 1 }
      },
      {
        timestamp: new Date(now - 3 * oneDayMs).toISOString(),
        status: 'success',
        recordsSynced: 22,
        message: 'Automated health telemetry import.',
        metrics: { heartRate: 74, bloodOxygen: 97, sleepHours: 7.1, steps: 5200, calories: 1650, walkingActivity: 40, hrv: 58, activitySessions: 1 }
      },
      {
        timestamp: new Date(now - 2 * oneDayMs).toISOString(),
        status: 'success',
        recordsSynced: 30,
        message: 'Automated health telemetry import.',
        metrics: { heartRate: 72, bloodOxygen: 98, sleepHours: 7.4, steps: 6400, calories: 1850, walkingActivity: 52, hrv: 57, activitySessions: 3 }
      },
      {
        timestamp: new Date(now - 1 * oneDayMs).toISOString(),
        status: 'success',
        recordsSynced: 15,
        message: 'Manual health telemetry import.',
        metrics: { heartRate: 73, bloodOxygen: 98, sleepHours: 6.8, steps: 5900, calories: 1790, walkingActivity: 45, hrv: 55, activitySessions: 2 }
      },
      {
        timestamp: new Date(now).toISOString(),
        status: 'success',
        recordsSynced: 28,
        message: 'Periodic telemetry synchronization completed successfully.',
        metrics: { heartRate: 72, bloodOxygen: 98, sleepHours: 6.5, steps: 5400, calories: 1690, walkingActivity: 42, hrv: 55, activitySessions: 1 }
      }
    ];
  }

  for (const fm of INITIAL_DB.familyMembers) {
    insertFamilyMember.run(
      fm.id, fm.name, fm.age, fm.email, fm.phone, safeJsonStringify(fm.primaryConditions),
      fm.profilePicture || null, safeJsonStringify(fm.medications), safeJsonStringify(fm.wearableData),
      fm.relationship || null, safeJsonStringify(fm.emergencyContacts), 'usr_sarah'
    );
  }

  // 3. Seed CheckIns
  const insertCheckIn = sqlite.prepare(`
    INSERT INTO check_ins (id, familyMemberId, timestamp, status, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const ch of INITIAL_DB.checkIns) {
    insertCheckIn.run(ch.id, ch.familyMemberId, ch.timestamp, ch.status, ch.notes || null);
  }

  // 4. Seed Audit Logs
  const insertAuditLog = sqlite.prepare(`
    INSERT INTO audit_logs (id, timestamp, eventType, step, message, logs)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const log of INITIAL_DB.auditLogs) {
    insertAuditLog.run(log.id, log.timestamp, log.eventType, log.step, log.message, safeJsonStringify(log.logs));
  }

  // 5. Seed Notifications
  const insertNotif = sqlite.prepare(`
    INSERT INTO notifications (id, title, message, status, createdAt, priority)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const n of INITIAL_DB.notifications) {
    insertNotif.run(n.id, n.title, n.message, n.status, n.createdAt, n.priority);
  }

  // 6. Seed Appointments
  const insertApt = sqlite.prepare(`
    INSERT INTO appointments (
      id, familyMemberId, doctor, hospital, purpose, time, location,
      onlineLink, prescription, status, recurring
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);
  for (const apt of INITIAL_DB.appointments) {
    insertApt.run(
      apt.id, apt.familyMemberId, apt.doctor, apt.hospital, apt.purpose, apt.time,
      apt.location || null, apt.onlineLink || null, apt.prescription || null,
      apt.status, apt.recurring || null
    );
  }

  // 7. Seed Prescription Documents
  const insertPres = sqlite.prepare(`
    INSERT INTO prescription_documents (id, familyMemberId, fileName, doctor, hospital, date, extractedMeds, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const pres of INITIAL_DB.prescriptionDocuments) {
    insertPres.run(
      pres.id, pres.familyMemberId, pres.fileName, pres.doctor, pres.hospital, pres.date,
      safeJsonStringify(pres.extractedMeds), pres.notes || null
    );
  }

  // 8. Seed Medical Reports
  const insertRep = sqlite.prepare(`
    INSERT INTO medical_reports (id, familyMemberId, fileName, type, date, summary, url, searchableText)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const rep of INITIAL_DB.medicalReports) {
    insertRep.run(
      rep.id, rep.familyMemberId, rep.fileName, rep.type, rep.date, rep.summary || null,
      rep.url || null, rep.searchableText || null
    );
  }

  // 9. Seed Child Care Workflows
  const insertCc = sqlite.prepare(`
    INSERT INTO child_care_workflows (id, timestamp, schoolCheckIn, reachedHome, homeworkCompleted, locationConfirmation, safeArrival)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const cc of INITIAL_DB.childCareWorkflows) {
    insertCc.run(
      cc.id, cc.timestamp, cc.schoolCheckIn ? 1 : 0, cc.reachedHome ? 1 : 0,
      cc.homeworkCompleted ? 1 : 0, cc.locationConfirmation || null, cc.safeArrival ? 1 : 0
    );
  }

  // 10. Seed Wellness Logs
  const insertWel = sqlite.prepare(`
    INSERT INTO wellness_logs (id, timestamp, mood, stressLevel, sleepQuality, socialInteraction, journal)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const wel of INITIAL_DB.wellnessLogs) {
    insertWel.run(
      wel.id, wel.timestamp, wel.mood, wel.stressLevel, wel.sleepQuality,
      wel.socialInteraction || null, wel.journal || null
    );
  }

  // 11. Seed Memories
  const insertMemory = sqlite.prepare(`
    INSERT INTO memories (id, familyMemberId, timestamp, type, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const mem of INITIAL_DB.memories) {
    insertMemory.run(mem.id, mem.familyMemberId, mem.timestamp, mem.type, mem.description);
  }

  // 12. Seed Weekly Summaries
  const insertWeeklySummary = sqlite.prepare(`
    INSERT INTO weekly_summaries (
      id, familyMemberId, weekStartDate, weekEndDate, avgHeartRate, avgSleepHours,
      totalSteps, medicationAdherenceRate, moodScoreAvg, rawEventsCount, computedAt,
      trendDirection, insights, clinicalRecommendation
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);
  const weeklySummariesData = [
    {
      id: 'wsum_1',
      familyMemberId: 'fm_eleanor',
      weekStartDate: '2026-06-22',
      weekEndDate: '2026-06-28',
      avgHeartRate: 73.1,
      avgSleepHours: 6.7,
      totalSteps: 38200,
      medicationAdherenceRate: 88.5,
      moodScoreAvg: 4.1,
      rawEventsCount: 25,
      computedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      trendDirection: 'stable',
      insights: [
        'Heart rate stable around 73 bpm with standard diurnal patterns.',
        'Sleep averaged 6.7 hours, indicating moderate resting depth and standard circadian cycles.',
        'Medication adherence is strong at 88.5%, with minor morning delays.'
      ],
      clinicalRecommendation: 'Maintain lisinopril adherence. Continue cognitive stimulation tasks in the morning.'
    },
    {
      id: 'wsum_2',
      familyMemberId: 'fm_eleanor',
      weekStartDate: '2026-06-29',
      weekEndDate: '2026-07-05',
      avgHeartRate: 72.8,
      avgSleepHours: 6.9,
      totalSteps: 44000,
      medicationAdherenceRate: 92.0,
      moodScoreAvg: 4.3,
      rawEventsCount: 28,
      computedAt: new Date().toISOString(),
      trendDirection: 'improving',
      insights: [
        'Cardiovascular telemetry shows slight recovery in heart rate variability.',
        'Sleep duration improved to 6.9 hours/night.',
        'Medication adherence reached an excellent 92% due to consistent family check-ins.'
      ],
      clinicalRecommendation: 'Monitor evening Donepezil intake as she occasionally gets sleepy before taking it.'
    }
  ];
  for (const s of weeklySummariesData) {
    insertWeeklySummary.run(
      s.id, s.familyMemberId, s.weekStartDate, s.weekEndDate, s.avgHeartRate, s.avgSleepHours,
      s.totalSteps, s.medicationAdherenceRate, s.moodScoreAvg, s.rawEventsCount, s.computedAt,
      s.trendDirection, safeJsonStringify(s.insights), s.clinicalRecommendation
    );
  }

  console.log('[SQLite Database] CareCircle database fully bootstrapped.');
}

// Ensure the SQLite database is bootstrapped on startup
seedDatabase();

// Database mapper utility functions
function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    password: row.password,
    relationship: row.relationship,
    photo: row.photo,
    phone: row.phone,
    address: row.address,
    medicalConditions: safeJsonParse(row.medicalConditions, []),
    bloodGroup: row.bloodGroup,
    allergies: safeJsonParse(row.allergies, []),
    insurance: row.insurance,
    emergencyContacts: safeJsonParse(row.emergencyContacts, []),
    preferredHospital: row.preferredHospital,
    preferredDoctor: row.preferredDoctor,
    notificationPreferences: safeJsonParse(row.notificationPreferences, { email: true, sms: true, push: true })
  };
}

function rowToFamilyMember(row: any): FamilyMember {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    email: row.email,
    phone: row.phone,
    primaryConditions: safeJsonParse(row.primaryConditions, []),
    profilePicture: row.profilePicture,
    medications: safeJsonParse(row.medications, []),
    wearableData: safeJsonParse(row.wearableData, undefined),
    relationship: row.relationship,
    emergencyContacts: safeJsonParse(row.emergencyContacts, []),
    userId: row.userId
  };
}

function rowToCheckIn(row: any): CheckIn {
  return {
    id: row.id,
    familyMemberId: row.familyMemberId,
    timestamp: row.timestamp,
    status: row.status,
    notes: row.notes
  };
}

function rowToAlert(row: any): Alert {
  return {
    id: row.id,
    createdAt: row.createdAt,
    familyMemberId: row.familyMemberId,
    type: row.type,
    status: row.status,
    level: row.level,
    reasoningSummary: row.reasoningSummary,
    message: row.message,
    riskScore: row.riskScore,
    evidence: row.evidence,
    alternativesConsidered: safeJsonParse(row.alternativesConsidered, []),
    reasoning: row.reasoning,
    medicationStatus: row.medicationStatus
  };
}

function rowToAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    timestamp: row.timestamp,
    eventType: row.eventType,
    step: row.step,
    message: row.message,
    logs: safeJsonParse(row.logs, [])
  };
}

function rowToNotification(row: any): Notification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt,
    priority: row.priority
  };
}

function rowToAppointment(row: any): Appointment {
  return {
    id: row.id,
    familyMemberId: row.familyMemberId,
    doctor: row.doctor,
    hospital: row.hospital,
    purpose: row.purpose,
    time: row.time,
    location: row.location,
    onlineLink: row.onlineLink,
    prescription: row.prescription,
    status: row.status,
    recurring: row.recurring
  };
}

function rowToPrescriptionDocument(row: any): PrescriptionDocument {
  return {
    id: row.id,
    familyMemberId: row.familyMemberId,
    fileName: row.fileName,
    doctor: row.doctor,
    hospital: row.hospital,
    date: row.date,
    extractedMeds: safeJsonParse(row.extractedMeds, []),
    notes: row.notes
  };
}

function rowToMedicalReport(row: any): MedicalReport {
  return {
    id: row.id,
    familyMemberId: row.familyMemberId,
    fileName: row.fileName,
    type: row.type,
    date: row.date,
    summary: row.summary,
    url: row.url,
    searchableText: row.searchableText
  };
}

function rowToChildCareWorkflow(row: any): ChildCareWorkflow {
  return {
    id: row.id,
    timestamp: row.timestamp,
    schoolCheckIn: !!row.schoolCheckIn,
    reachedHome: !!row.reachedHome,
    homeworkCompleted: !!row.homeworkCompleted,
    locationConfirmation: row.locationConfirmation,
    safeArrival: !!row.safeArrival
  };
}

function rowToWellnessLog(row: any): WellnessLog {
  return {
    id: row.id,
    timestamp: row.timestamp,
    mood: row.mood,
    stressLevel: row.stressLevel,
    sleepQuality: row.sleepQuality,
    socialInteraction: row.socialInteraction,
    journal: row.journal
  };
}

function rowToMemory(row: any): Memory {
  return {
    id: row.id,
    familyMemberId: row.familyMemberId,
    timestamp: row.timestamp,
    type: row.type,
    description: row.description
  };
}

function rowToWeeklySummary(row: any): WeeklySummary {
  return {
    id: row.id,
    familyMemberId: row.familyMemberId,
    weekStartDate: row.weekStartDate,
    weekEndDate: row.weekEndDate,
    avgHeartRate: row.avgHeartRate,
    avgSleepHours: row.avgSleepHours,
    totalSteps: row.totalSteps,
    medicationAdherenceRate: row.medicationAdherenceRate,
    moodScoreAvg: row.moodScoreAvg,
    rawEventsCount: row.rawEventsCount,
    computedAt: row.computedAt,
    trendDirection: row.trendDirection,
    insights: safeJsonParse(row.insights, []),
    clinicalRecommendation: row.clinicalRecommendation
  };
}

class SQLiteDatabase {
  private changeListeners: (() => void)[] = [];

  constructor() {
    // Already bootstrapped globally
  }

  public save() {
    // No-op for compatibility with JSON database legacy mutate-and-save patterns
  }

  public onChange(listener: () => void) {
    this.changeListeners.push(listener);
  }

  private notifyChange() {
    for (const listener of this.changeListeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error in database change listener:', err);
      }
    }
  }

  // Users
  getUsers(): User[] {
    const rows = sqlite.prepare('SELECT * FROM users').all();
    return rows.map(rowToUser);
  }

  getUser(id: string): User | undefined {
    const row = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ? rowToUser(row) : undefined;
  }

  addUser(user: Omit<User, 'id'>): User {
    const id = generateUniqueId('usr');
    const password = user.password ? (user.password.includes(':') ? user.password : hashPasswordStandalone(user.password)) : hashPasswordStandalone('password123');
    const insert = sqlite.prepare(`
      INSERT INTO users (
        id, email, name, role, password, relationship, photo, phone, address,
        medicalConditions, bloodGroup, allergies, insurance, emergencyContacts,
        preferredHospital, preferredDoctor, notificationPreferences
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    insert.run(
      id, user.email, user.name, user.role, password, user.relationship || null, user.photo || null,
      user.phone || null, user.address || null, safeJsonStringify(user.medicalConditions),
      user.bloodGroup || null, safeJsonStringify(user.allergies), user.insurance || null,
      safeJsonStringify(user.emergencyContacts), user.preferredHospital || null,
      user.preferredDoctor || null, safeJsonStringify(user.notificationPreferences)
    );
    this.notifyChange();
    return this.getUser(id)!;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const u = this.getUser(id);
    if (!u) return undefined;
    
    const merged = { ...u, ...updates };
    const updateStmt = sqlite.prepare(`
      UPDATE users SET
        email = ?, name = ?, role = ?, password = ?, relationship = ?, photo = ?, phone = ?, address = ?,
        medicalConditions = ?, bloodGroup = ?, allergies = ?, insurance = ?, emergencyContacts = ?,
        preferredHospital = ?, preferredDoctor = ?, notificationPreferences = ?
      WHERE id = ?
    `);
    updateStmt.run(
      merged.email, merged.name, merged.role, merged.password, merged.relationship || null, merged.photo || null,
      merged.phone || null, merged.address || null, safeJsonStringify(merged.medicalConditions),
      merged.bloodGroup || null, safeJsonStringify(merged.allergies), merged.insurance || null,
      safeJsonStringify(merged.emergencyContacts), merged.preferredHospital || null,
      merged.preferredDoctor || null, safeJsonStringify(merged.notificationPreferences),
      id
    );
    this.notifyChange();
    return this.getUser(id);
  }

  // Family Members
  getFamilyMembers(userId?: string, userRole?: string, userEmail?: string): FamilyMember[] {
    let rows;
    if (userId) {
      if (userRole === 'carerecipient') {
        rows = sqlite.prepare('SELECT * FROM family_members WHERE email = ? OR userId = ?').all(userEmail || '', userId);
        if (rows.length === 0) {
          rows = sqlite.prepare('SELECT * FROM family_members WHERE userId = ?').all(userId);
        }
      } else {
        rows = sqlite.prepare('SELECT * FROM family_members WHERE userId = ?').all(userId);
      }
    } else {
      rows = sqlite.prepare('SELECT * FROM family_members').all();
    }
    return rows.map(rowToFamilyMember);
  }

  getFamilyMember(id: string): FamilyMember | undefined {
    const row = sqlite.prepare('SELECT * FROM family_members WHERE id = ?').get(id);
    return row ? rowToFamilyMember(row) : undefined;
  }

  addFamilyMember(member: Omit<FamilyMember, 'id'>): FamilyMember {
    const id = generateUniqueId('fm');
    const insert = sqlite.prepare(`
      INSERT INTO family_members (
        id, name, age, email, phone, primaryConditions, profilePicture,
        medications, wearableData, relationship, emergencyContacts, userId
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    insert.run(
      id, member.name, member.age, member.email, member.phone, safeJsonStringify(member.primaryConditions),
      member.profilePicture || null, safeJsonStringify(member.medications), safeJsonStringify(member.wearableData),
      member.relationship || null, safeJsonStringify(member.emergencyContacts), member.userId || null
    );
    this.notifyChange();
    return this.getFamilyMember(id)!;
  }

  removeFamilyMember(id: string): void {
    sqlite.prepare('DELETE FROM family_members WHERE id = ?').run(id);
    this.notifyChange();
  }

  updateFamilyMember(id: string, updates: Partial<FamilyMember>): FamilyMember | undefined {
    const fm = this.getFamilyMember(id);
    if (!fm) return undefined;

    const merged = { ...fm, ...updates };
    const updateStmt = sqlite.prepare(`
      UPDATE family_members SET
        name = ?, age = ?, email = ?, phone = ?, primaryConditions = ?, profilePicture = ?,
        medications = ?, wearableData = ?, relationship = ?, emergencyContacts = ?
      WHERE id = ?
    `);
    updateStmt.run(
      merged.name, merged.age, merged.email, merged.phone, safeJsonStringify(merged.primaryConditions),
      merged.profilePicture || null, safeJsonStringify(merged.medications), safeJsonStringify(merged.wearableData),
      merged.relationship || null, safeJsonStringify(merged.emergencyContacts),
      id
    );
    this.notifyChange();
    return this.getFamilyMember(id);
  }

  // Checkins
  getCheckIns(): CheckIn[] {
    const rows = sqlite.prepare('SELECT * FROM check_ins ORDER BY timestamp DESC').all();
    return rows.map(rowToCheckIn);
  }

  addCheckIn(checkIn: Omit<CheckIn, 'id'>): CheckIn {
    const id = generateUniqueId('ch');
    const insert = sqlite.prepare(`
      INSERT INTO check_ins (id, familyMemberId, timestamp, status, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    insert.run(id, checkIn.familyMemberId, checkIn.timestamp, checkIn.status, checkIn.notes || null);
    this.notifyChange();
    return { id, ...checkIn };
  }

  // Alerts
  getAlerts(): Alert[] {
    const rows = sqlite.prepare('SELECT * FROM alerts ORDER BY createdAt DESC').all();
    return rows.map(rowToAlert);
  }

  getAlert(id: string): Alert | undefined {
    const row = sqlite.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
    return row ? rowToAlert(row) : undefined;
  }

  addAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Alert {
    const id = generateUniqueId('alt');
    const createdAt = new Date().toISOString();
    const insert = sqlite.prepare(`
      INSERT INTO alerts (
        id, createdAt, familyMemberId, type, status, message, riskScore,
        evidence, alternativesConsidered, reasoning, medicationStatus
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    insert.run(
      id, createdAt, alert.familyMemberId, alert.type, alert.status, alert.message,
      alert.riskScore || null, alert.evidence || null, safeJsonStringify(alert.alternativesConsidered),
      alert.reasoning || null, alert.medicationStatus || null
    );
    this.notifyChange();
    return { id, createdAt, ...alert };
  }

  updateAlertStatus(id: string, status: Alert['status']): Alert | undefined {
    const alert = this.getAlert(id);
    if (!alert) return undefined;
    sqlite.prepare('UPDATE alerts SET status = ? WHERE id = ?').run(status, id);
    this.notifyChange();
    return this.getAlert(id);
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    const rows = sqlite.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC').all();
    return rows.map(rowToAuditLog);
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const id = generateUniqueId('log');
    const timestamp = new Date().toISOString();
    const insert = sqlite.prepare(`
      INSERT INTO audit_logs (id, timestamp, eventType, step, message, logs)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, timestamp, log.eventType, log.step, log.message, safeJsonStringify(log.logs));
    this.notifyChange();
    return { id, timestamp, ...log };
  }

  // Notifications
  getNotifications(): Notification[] {
    const rows = sqlite.prepare('SELECT * FROM notifications ORDER BY createdAt DESC').all();
    return rows.map(rowToNotification);
  }

  addNotification(notif: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const id = generateUniqueId('notif');
    const createdAt = new Date().toISOString();
    const insert = sqlite.prepare(`
      INSERT INTO notifications (id, title, message, status, createdAt, priority)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, notif.title, notif.message, notif.status, createdAt, notif.priority);
    this.notifyChange();
    return { id, createdAt, ...notif };
  }

  markNotificationAsRead(id: string): void {
    sqlite.prepare('UPDATE notifications SET status = "read" WHERE id = ?').run(id);
    this.notifyChange();
  }

  archiveNotification(id: string): void {
    sqlite.prepare('UPDATE notifications SET status = "archived" WHERE id = ?').run(id);
    this.notifyChange();
  }

  deleteNotification(id: string): void {
    sqlite.prepare('DELETE FROM notifications WHERE id = ?').run(id);
    this.notifyChange();
  }

  markAllNotificationsAsRead(): void {
    sqlite.prepare('UPDATE notifications SET status = "read"').run();
    this.notifyChange();
  }

  // Appointments
  getAppointments(): Appointment[] {
    const rows = sqlite.prepare('SELECT * FROM appointments ORDER BY time ASC').all();
    return rows.map(rowToAppointment);
  }

  getAppointment(id: string): Appointment | undefined {
    const row = sqlite.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    return row ? rowToAppointment(row) : undefined;
  }

  addAppointment(appointment: Omit<Appointment, 'id'>): Appointment {
    const id = generateUniqueId('apt');
    const insert = sqlite.prepare(`
      INSERT INTO appointments (
        id, familyMemberId, doctor, hospital, purpose, time, location,
        onlineLink, prescription, status, recurring
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    insert.run(
      id, appointment.familyMemberId, appointment.doctor, appointment.hospital, appointment.purpose,
      appointment.time, appointment.location || null, appointment.onlineLink || null,
      appointment.prescription || null, appointment.status, appointment.recurring || null
    );
    this.notifyChange();
    return this.getAppointment(id)!;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | undefined {
    const apt = this.getAppointment(id);
    if (!apt) return undefined;

    const merged = { ...apt, ...updates };
    const updateStmt = sqlite.prepare(`
      UPDATE appointments SET
        doctor = ?, hospital = ?, purpose = ?, time = ?, location = ?,
        onlineLink = ?, prescription = ?, status = ?, recurring = ?
      WHERE id = ?
    `);
    updateStmt.run(
      merged.doctor, merged.hospital, merged.purpose, merged.time, merged.location || null,
      merged.onlineLink || null, merged.prescription || null, merged.status, merged.recurring || null,
      id
    );
    this.notifyChange();
    return this.getAppointment(id);
  }

  deleteAppointment(id: string): void {
    sqlite.prepare('DELETE FROM appointments WHERE id = ?').run(id);
    this.notifyChange();
  }

  // Prescription Documents
  getPrescriptionDocuments(): PrescriptionDocument[] {
    const rows = sqlite.prepare('SELECT * FROM prescription_documents ORDER BY date DESC').all();
    return rows.map(rowToPrescriptionDocument);
  }

  addPrescriptionDocument(doc: Omit<PrescriptionDocument, 'id'>): PrescriptionDocument {
    const id = generateUniqueId('pres');
    const insert = sqlite.prepare(`
      INSERT INTO prescription_documents (id, familyMemberId, fileName, doctor, hospital, date, extractedMeds, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      id, doc.familyMemberId, doc.fileName, doc.doctor, doc.hospital, doc.date,
      safeJsonStringify(doc.extractedMeds), doc.notes || null
    );
    this.notifyChange();
    return this.getPrescriptionDocuments().find(d => d.id === id)!;
  }

  deletePrescriptionDocument(id: string): void {
    sqlite.prepare('DELETE FROM prescription_documents WHERE id = ?').run(id);
    this.notifyChange();
  }

  // Medical Reports
  getMedicalReports(): MedicalReport[] {
    const rows = sqlite.prepare('SELECT * FROM medical_reports ORDER BY date DESC').all();
    return rows.map(rowToMedicalReport);
  }

  addMedicalReport(report: Omit<MedicalReport, 'id'>): MedicalReport {
    const id = generateUniqueId('rep');
    const insert = sqlite.prepare(`
      INSERT INTO medical_reports (id, familyMemberId, fileName, type, date, summary, url, searchableText)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      id, report.familyMemberId, report.fileName, report.type, report.date,
      report.summary || null, report.url || null, report.searchableText || null
    );
    this.notifyChange();
    return this.getMedicalReports().find(r => r.id === id)!;
  }

  deleteMedicalReport(id: string): void {
    sqlite.prepare('DELETE FROM medical_reports WHERE id = ?').run(id);
    this.notifyChange();
  }

  // Child Care Workflows
  getChildCareWorkflows(): ChildCareWorkflow[] {
    const rows = sqlite.prepare('SELECT * FROM child_care_workflows ORDER BY timestamp DESC').all();
    return rows.map(rowToChildCareWorkflow);
  }

  addChildCareWorkflow(workflow: Omit<ChildCareWorkflow, 'id'>): ChildCareWorkflow {
    const id = generateUniqueId('cc');
    const insert = sqlite.prepare(`
      INSERT INTO child_care_workflows (id, timestamp, schoolCheckIn, reachedHome, homeworkCompleted, locationConfirmation, safeArrival)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      id, workflow.timestamp, workflow.schoolCheckIn ? 1 : 0, workflow.reachedHome ? 1 : 0,
      workflow.homeworkCompleted ? 1 : 0, workflow.locationConfirmation || null, workflow.safeArrival ? 1 : 0
    );
    this.notifyChange();
    return { id, ...workflow };
  }

  // Wellness Logs
  getWellnessLogs(): WellnessLog[] {
    const rows = sqlite.prepare('SELECT * FROM wellness_logs ORDER BY timestamp DESC').all();
    return rows.map(rowToWellnessLog);
  }

  addWellnessLog(log: Omit<WellnessLog, 'id'>): WellnessLog {
    const id = generateUniqueId('wel');
    const insert = sqlite.prepare(`
      INSERT INTO wellness_logs (id, timestamp, mood, stressLevel, sleepQuality, socialInteraction, journal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      id, log.timestamp, log.mood, log.stressLevel, log.sleepQuality,
      log.socialInteraction || null, log.journal || null
    );
    this.notifyChange();
    return { id, ...log };
  }

  // Memories
  getMemories(): Memory[] {
    const rows = sqlite.prepare('SELECT * FROM memories ORDER BY timestamp DESC').all();
    return rows.map(rowToMemory);
  }

  addMemory(memory: Omit<Memory, 'id'>): Memory {
    const id = generateUniqueId('mem');
    const insert = sqlite.prepare(`
      INSERT INTO memories (id, familyMemberId, timestamp, type, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    insert.run(id, memory.familyMemberId, memory.timestamp, memory.type, memory.description);
    this.notifyChange();
    return { id, ...memory };
  }

  // Weekly Summaries
  getWeeklySummaries(): WeeklySummary[] {
    const rows = sqlite.prepare('SELECT * FROM weekly_summaries ORDER BY weekStartDate DESC').all();
    return rows.map(rowToWeeklySummary);
  }

  addWeeklySummary(summary: Omit<WeeklySummary, 'id' | 'computedAt'>): WeeklySummary {
    const id = generateUniqueId('wsum');
    const computedAt = new Date().toISOString();
    
    sqlite.prepare('DELETE FROM weekly_summaries WHERE familyMemberId = ? AND weekStartDate = ?').run(summary.familyMemberId, summary.weekStartDate);
    
    const insert = sqlite.prepare(`
      INSERT INTO weekly_summaries (
        id, familyMemberId, weekStartDate, weekEndDate, avgHeartRate, avgSleepHours,
        totalSteps, medicationAdherenceRate, moodScoreAvg, rawEventsCount, computedAt,
        trendDirection, insights, clinicalRecommendation
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    insert.run(
      id, summary.familyMemberId, summary.weekStartDate, summary.weekEndDate, summary.avgHeartRate,
      summary.avgSleepHours, summary.totalSteps, summary.medicationAdherenceRate, summary.moodScoreAvg,
      summary.rawEventsCount, computedAt, summary.trendDirection, safeJsonStringify(summary.insights),
      summary.clinicalRecommendation || null
    );
    this.notifyChange();
    return this.getWeeklySummaries().find(s => s.id === id)!;
  }

  // Clean / reset DB (for easy demo restarts)
  reset() {
    console.log('[SQLite Database] Reset requested. Dropping and re-seeding all tables...');
    sqlite.exec(`
      DELETE FROM users;
      DELETE FROM family_members;
      DELETE FROM check_ins;
      DELETE FROM alerts;
      DELETE FROM audit_logs;
      DELETE FROM notifications;
      DELETE FROM appointments;
      DELETE FROM prescription_documents;
      DELETE FROM medical_reports;
      DELETE FROM child_care_workflows;
      DELETE FROM wellness_logs;
      DELETE FROM memories;
      DELETE FROM weekly_summaries;
    `);
    seedDatabase();
    this.notifyChange();
  }
}

export const db = new SQLiteDatabase();
export default db;

/**
 * @file purpose: Définit les types TypeScript pour le système de détection de somnolence
 * Types pour la détection faciale, les métriques EAR/MAR, et les alertes
 */

// ===== DÉTECTION FACIALE =====
export interface FaceLandmarks {
  leftEye: Point[];
  rightEye: Point[];
  mouth: Point[];
  nose: Point[];
  jawline: Point[];
}

export interface Point {
  x: number;
  y: number;
  z?: number;
}

// ===== MÉTRIQUES DE SOMNOLENCE =====
export interface DrowsinessMetrics {
  ear: number;           // Eye Aspect Ratio
  mar: number;           // Mouth Aspect Ratio
  headPose: HeadPose;
  blinkRate: number;
  yawnCount: number;
  timestamp: number;
}

export interface HeadPose {
  pitch: number;         // Inclinaison avant/arrière
  yaw: number;           // Rotation gauche/droite
  roll: number;          // Inclinaison latérale
}

// ===== ÉTATS DE VIGILANCE =====
export enum AlertLevel {
  NORMAL = 'normal',
  DROWSY = 'drowsy',
  VERY_DROWSY = 'very_drowsy',
  CRITICAL = 'critical'
}

export interface VigilanceState {
  level: AlertLevel;
  score: number;         // 0-100 (100 = parfaitement éveillé)
  confidence: number;    // 0-1 (confiance du modèle)
  duration: number;      // Durée dans cet état (ms)
}

// ===== SESSIONS & DONNÉES =====
export interface DrivingSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  totalDuration: number; // en minutes
  alertCount: {
    [key in AlertLevel]: number;
  };
  averageVigilance: number;
  metrics: DrowsinessMetrics[];
  incidents: DrowsinessIncident[];
}

export interface DrowsinessIncident {
  id: string;
  timestamp: Date;
  level: AlertLevel;
  duration: number;      // Durée de l'incident (ms)
  metrics: DrowsinessMetrics;
  actionTaken: string;   // Action prise par l'utilisateur
}

// ===== CONFIGURATION =====
export interface DetectionConfig {
  earThreshold: number;      // Seuil EAR pour détection yeux fermés
  marThreshold: number;      // Seuil MAR pour détection bâillements
  closedEyeDuration: number; // Durée yeux fermés avant alerte (ms)
  yawnDuration: number;      // Durée bâillement pour comptage (ms)
  alertCooldown: number;     // Délai entre alertes (ms)
  sensitivity: 'low' | 'medium' | 'high';
}

// ===== CAMÉRA & STREAM =====
export interface CameraConfig {
  width: number;
  height: number;
  fps: number;
  facingMode: 'user' | 'environment';
}

export interface StreamStatus {
  isActive: boolean;
  hasPermission: boolean;
  error?: string;
  deviceId?: string;
}

// ===== ALERTES =====
export interface AlertConfig {
  sound: boolean;
  vibration: boolean;
  visual: boolean;
  voice: boolean;
  volume: number;        // 0-1
}

export interface Alert {
  id: string;
  type: AlertLevel;
  message: string;
  timestamp: Date;
  dismissed: boolean;
  audioPlayed: boolean;
}

// ===== ANALYTICS =====
export interface DayStatistics {
  date: string;
  sessionsCount: number;
  totalDriveTime: number;
  averageVigilance: number;
  incidentsCount: number;
  mostDrowsyHour: number;
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  dailyStats: DayStatistics[];
  trends: {
    vigilanceImprovement: number;    // Pourcentage d'amélioration
    safestDay: string;
    riskiestHour: number;
  };
} 
/**
 * @file purpose: Store Zustand pour la gestion d'état global du système de détection
 * Gère l'état de la caméra, détection, alertes et sessions de conduite
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  DrowsinessMetrics, 
  VigilanceState, 
  AlertLevel, 
  DrivingSession, 
  Alert, 
  StreamStatus, 
  DetectionConfig,
  AlertConfig 
} from '@/types/detection';

interface DetectionState {
  // État caméra
  streamStatus: StreamStatus;
  videoElement: HTMLVideoElement | null;
  
  // Détection en cours
  isDetectionActive: boolean;
  currentMetrics: DrowsinessMetrics | null;
  vigilanceState: VigilanceState;
  lastFrameProcessed: number;
  
  // Session actuelle
  currentSession: DrivingSession | null;
  sessionStartTime: number | null;
  sessionHistory: DrivingSession[];
  
  // Alertes
  activeAlerts: Alert[];
  lastAlertTime: number;
  
  // Configuration
  detectionConfig: DetectionConfig;
  alertConfig: AlertConfig;
  
  // Caméra état
  isCameraActive: boolean;
  cameraError: string | null;
  
  // Statistiques temps réel
  stats: {
    frameCount: number;
    fps: number;
    sessionDuration: number;
    alertsTriggered: number;
  };
}

interface DetectionActions {
  // Actions stream/caméra
  setStreamStatus: (status: Partial<StreamStatus>) => void;
  setVideoElement: (element: HTMLVideoElement | null) => void;
  startCamera: () => void;
  stopCamera: () => void;
  setCameraError: (error: string | null) => void;
  
  // Actions détection
  startDetection: () => void;
  stopDetection: () => void;
  updateMetrics: (metrics: DrowsinessMetrics) => void;
  incrementFrameCount: () => void;
  updateFPS: (fps: number) => void;
  
  // Actions vigilance
  updateVigilanceState: (state: Partial<VigilanceState>) => void;
  
  // Actions alertes
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
  
  // Actions session
  startSession: () => void;
  endSession: () => void;
  updateSession: (updates: Partial<DrivingSession>) => void;
  
  // Actions configuration
  updateDetectionConfig: (config: Partial<DetectionConfig>) => void;
  updateAlertConfig: (config: Partial<AlertConfig>) => void;
  resetConfig: () => void;
  
  // Actions statistiques
  resetStats: () => void;
}

const initialState: DetectionState = {
  streamStatus: {
    isActive: false,
    hasPermission: false
  },
  videoElement: null,
  isDetectionActive: false,
  currentMetrics: null,
  vigilanceState: {
    level: AlertLevel.NORMAL,
    score: 100,
    confidence: 0,
    duration: 0
  },
  lastFrameProcessed: 0,
  currentSession: null,
  sessionStartTime: null,
  activeAlerts: [],
  lastAlertTime: 0,
  detectionConfig: {
    earThreshold: 0.25,
    marThreshold: 0.6,
    closedEyeDuration: 2000,
    yawnDuration: 1000,
    alertCooldown: 5000,
    sensitivity: 'medium'
  },
  alertConfig: {
    sound: true,
    vibration: true,
    visual: true,
    voice: false,
    volume: 0.8
  },
  stats: {
    frameCount: 0,
    fps: 0,
    sessionDuration: 0,
    alertsTriggered: 0
  },
  sessionHistory: [],
  isCameraActive: false,
  cameraError: null
};

export const useDetectionStore = create<DetectionState & DetectionActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Actions stream/caméra
      setStreamStatus: (status) => 
        set(
          (state) => ({
            streamStatus: { ...state.streamStatus, ...status }
          }),
          false,
          'setStreamStatus'
        ),

      setVideoElement: (element) => 
        set(
          { videoElement: element },
          false,
          'setVideoElement'
        ),

      startCamera: () => {
        set(
          {
            isCameraActive: true,
            cameraError: null
          },
          false,
          'startCamera'
        );
      },
      
      stopCamera: () => {
        set(
          {
            isCameraActive: false,
            cameraError: null,
            videoElement: null,
            isDetectionActive: false
          },
          false,
          'stopCamera'
        );
      },
      
      setCameraError: (error: string | null) => {
        set(
          {
            cameraError: error,
            isCameraActive: false
          },
          false,
          'setCameraError'
        );
      },

      // Actions détection
      startDetection: () => 
        set(
          { isDetectionActive: true },
          false,
          'startDetection'
        ),

      stopDetection: () => 
        set(
          { isDetectionActive: false },
          false,
          'stopDetection'
        ),

      updateMetrics: (metrics) => 
        set(
          { currentMetrics: metrics },
          false,
          'updateMetrics'
        ),

      // Actions vigilance
      updateVigilanceState: (state) => 
        set(
          (prevState) => ({
            vigilanceState: { ...prevState.vigilanceState, ...state }
          }),
          false,
          'updateVigilanceState'
        ),

      // Actions alertes
      addAlert: (alertData) => {
        const alert: Alert = {
          ...alertData,
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date()
        };
        
        set(
          (state) => ({
            activeAlerts: [...state.activeAlerts, alert],
            lastAlertTime: Date.now(),
            stats: {
              ...state.stats,
              alertsTriggered: state.stats.alertsTriggered + 1
            }
          }),
          false,
          'addAlert'
        );
      },

      dismissAlert: (alertId) => 
        set(
          (state) => ({
            activeAlerts: state.activeAlerts.filter(alert => alert.id !== alertId)
          }),
          false,
          'dismissAlert'
        ),

      clearAlerts: () => 
        set(
          { activeAlerts: [] },
          false,
          'clearAlerts'
        ),

      // Actions session
      startSession: () => {
        const sessionId = `session_${Date.now()}`;
        const newSession: DrivingSession = {
          id: sessionId,
          userId: 'local_user',
          startTime: new Date(),
          endTime: new Date(),
          totalDuration: 0,
          alertCount: {
            normal: 0,
            drowsy: 0,
            very_drowsy: 0,
            critical: 0
          },
          averageVigilance: 100,
          metrics: [],
          incidents: []
        };

        set(
          {
            currentSession: newSession,
            sessionStartTime: Date.now()
          },
          false,
          'startSession'
        );
      },

      endSession: () => {
        const { currentSession, sessionStartTime } = get();
        if (currentSession && sessionStartTime) {
          const endTime = Date.now();
          const duration = Math.floor((endTime - sessionStartTime) / 1000);
          
          const finalSession: DrivingSession = {
            ...currentSession,
            endTime: new Date(),
            totalDuration: duration
          };

          set(
            (state) => ({
              sessionHistory: [...state.sessionHistory, finalSession],
              currentSession: null,
              sessionStartTime: null,
              isDetectionActive: false
            }),
            false,
            'endSession'
          );
        }
      },

      updateSession: (updates) => {
        const { currentSession } = get();
        if (currentSession) {
          set(
            (state) => ({
              currentSession: state.currentSession ? {
                ...state.currentSession,
                ...updates
              } : null
            }),
            false,
            'updateSession'
          );
        }
      },

      // Actions configuration
      updateDetectionConfig: (config) => 
        set(
          (state) => ({
            detectionConfig: { ...state.detectionConfig, ...config }
          }),
          false,
          'updateDetectionConfig'
        ),

      updateAlertConfig: (config) => 
        set(
          (state) => ({
            alertConfig: { ...state.alertConfig, ...config }
          }),
          false,
          'updateAlertConfig'
        ),

      resetConfig: () => 
        set(
          () => ({
            detectionConfig: {
              earThreshold: 0.25,
              marThreshold: 0.6,
              closedEyeDuration: 2000,
              yawnDuration: 1000,
              alertCooldown: 5000,
              sensitivity: 'medium'
            }
          }),
          false,
          'resetConfig'
        ),

      // Actions statistiques
      incrementFrameCount: () => 
        set(
          (state) => ({
            stats: { ...state.stats, frameCount: state.stats.frameCount + 1 }
          }),
          false,
          'incrementFrameCount'
        ),

      updateFPS: (fps) => 
        set(
          (state) => ({
            stats: { ...state.stats, fps }
          }),
          false,
          'updateFPS'
        ),

      resetStats: () => 
        set(
          {
            stats: {
              frameCount: 0,
              fps: 0,
              sessionDuration: 0,
              alertsTriggered: 0
            }
          },
          false,
          'resetStats'
        )
    }),
    {
      name: 'detection-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Sélecteurs utiles
export const useStreamStatus = () => useDetectionStore(state => state.streamStatus);
export const useVigilanceState = () => useDetectionStore(state => state.vigilanceState);
export const useCurrentMetrics = () => useDetectionStore(state => state.currentMetrics);
export const useActiveAlerts = () => useDetectionStore(state => state.activeAlerts);
export const useDetectionConfig = () => useDetectionStore(state => state.detectionConfig); 
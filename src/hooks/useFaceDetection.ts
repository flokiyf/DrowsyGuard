/**
 * @file purpose: Hook de détection faciale robuste avec MediaPipe
 * Version complète avec calculs précis EAR/MAR et détection temporelle
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDetectionStore } from '@/stores/detectionStore';
import { DrowsinessMetrics, AlertLevel } from '@/types/detection';

interface FaceLandmark {
  x: number;
  y: number;
  z?: number;
}

interface DetectionState {
  eyesClosedStartTime: number | null;
  eyesClosedDuration: number;
  yawnStartTime: number | null;
  yawnDuration: number;
  blinkCount: number;
  lastBlinkTime: number;
  earHistory: number[];
  marHistory: number[];
}

export function useFaceDetection() {
  // HOOK DÉSACTIVÉ - Remplacé par useImprovedDetection
  console.warn('useFaceDetection est désactivé - utilisez useImprovedDetection');
  
  return {
    isInitialized: false,
    debugInfo: 'Hook désactivé',
    detectionState: {
      eyesClosedStartTime: null,
      eyesClosedDuration: 0,
      yawnStartTime: null,
      yawnDuration: 0,
      blinkCount: 0,
      lastBlinkTime: 0,
      earHistory: [],
      marHistory: []
    }
  };
  
  // Code original commenté pour éviter conflits
  /*
  const faceMeshRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const detectionStateRef = useRef<DetectionState>({
    eyesClosedStartTime: null,
    eyesClosedDuration: 0,
    yawnStartTime: null,
    yawnDuration: 0,
    blinkCount: 0,
    lastBlinkTime: 0,
    earHistory: [],
    marHistory: []
  });
  
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const { 
    isDetectionActive, 
    videoElement, 
    detectionConfig
  } = useDetectionStore();

  // Indices corrects MediaPipe FaceMesh v0.4
  const EYE_LANDMARKS = {
    LEFT_EYE: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
    RIGHT_EYE: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
    LEFT_EYE_CORNERS: [33, 133], // coin gauche, coin droit
    RIGHT_EYE_CORNERS: [362, 263], // coin gauche, coin droit
    LEFT_EYE_VERTICAL: [159, 145], // haut, bas
    RIGHT_EYE_VERTICAL: [386, 374] // haut, bas
  };

  const MOUTH_LANDMARKS = {
    OUTER: [61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318],
    INNER: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],
    CORNERS: [61, 291], // gauche, droite
    TOP_BOTTOM: [13, 14, 15, 16, 17, 18] // points centraux haut/bas
  };

  // Calculer distance euclidienne entre deux points
  const getDistance = useCallback((p1: FaceLandmark, p2: FaceLandmark): number => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }, []);

  // Calculer EAR pour un oeil
  const calculateSingleEyeEAR = useCallback((landmarks: FaceLandmark[], eyePoints: number[]): number => {
    if (!landmarks || landmarks.length < 468) return 0;
    
    try {
      // Points pour un oeil (6 points : 2 coins, 4 points verticaux)
      const [p1, p2, p3, p4, p5, p6] = eyePoints.map(i => landmarks[i]);
      
      // Distances verticales
      const vertical1 = getDistance(p2, p6);
      const vertical2 = getDistance(p3, p5);
      
      // Distance horizontale
      const horizontal = getDistance(p1, p4);
      
      // EAR = (vertical1 + vertical2) / (2.0 * horizontal)
      return horizontal > 0 ? (vertical1 + vertical2) / (2.0 * horizontal) : 0;
    } catch (error) {
      console.warn('Erreur calcul EAR:', error);
      return 0;
    }
  }, [getDistance]);

  // Calculer EAR moyen des deux yeux
  const calculateEAR = useCallback((landmarks: FaceLandmark[]): number => {
    if (!landmarks || landmarks.length < 468) return 0;

    // Points spécifiques pour EAR (format MediaPipe)
    const leftEyePoints = [33, 160, 158, 133, 153, 144]; // P1, P2, P3, P4, P5, P6
    const rightEyePoints = [362, 385, 387, 263, 373, 380];

    const leftEAR = calculateSingleEyeEAR(landmarks, leftEyePoints);
    const rightEAR = calculateSingleEyeEAR(landmarks, rightEyePoints);

    const avgEAR = (leftEAR + rightEAR) / 2.0;
    
    // Lisser avec historique
    const state = detectionStateRef.current;
    state.earHistory.push(avgEAR);
    if (state.earHistory.length > 5) {
      state.earHistory.shift();
    }
    
    // Moyenne mobile
    return state.earHistory.reduce((a, b) => a + b, 0) / state.earHistory.length;
  }, [calculateSingleEyeEAR]);

  // Calculer MAR (Mouth Aspect Ratio)
  const calculateMAR = useCallback((landmarks: FaceLandmark[]): number => {
    if (!landmarks || landmarks.length < 468) return 0;

    try {
      // Points bouche : coins et points centraux haut/bas
      const [leftCorner, rightCorner] = [landmarks[61], landmarks[291]];
      const [topCenter1, topCenter2] = [landmarks[13], landmarks[14]];
      const [bottomCenter1, bottomCenter2] = [landmarks[17], landmarks[18]];

      // Distance horizontale (largeur bouche)
      const width = getDistance(leftCorner, rightCorner);
      
      // Distance verticale (hauteur bouche) - moyenne de plusieurs points
      const height1 = getDistance(topCenter1, bottomCenter1);
      const height2 = getDistance(topCenter2, bottomCenter2);
      const avgHeight = (height1 + height2) / 2.0;

      const mar = width > 0 ? avgHeight / width : 0;
      
      // Lisser avec historique
      const state = detectionStateRef.current;
      state.marHistory.push(mar);
      if (state.marHistory.length > 5) {
        state.marHistory.shift();
      }
      
      return state.marHistory.reduce((a, b) => a + b, 0) / state.marHistory.length;
    } catch (error) {
      console.warn('Erreur calcul MAR:', error);
      return 0;
    }
  }, [getDistance]);

  // Analyser état de vigilance avec logique temporelle
  const analyzeVigilance = useCallback((ear: number, mar: number, timestamp: number) => {
    const state = detectionStateRef.current;
    const config = detectionConfig;
    
    // === DÉTECTION YEUX FERMÉS ===
    const eyesClosed = ear < config.earThreshold;
    
    if (eyesClosed) {
      if (!state.eyesClosedStartTime) {
        state.eyesClosedStartTime = timestamp;
      }
      state.eyesClosedDuration = timestamp - state.eyesClosedStartTime;
    } else {
      // Détecter clignement si c'était fermé brièvement
      if (state.eyesClosedStartTime && state.eyesClosedDuration < 500) {
        state.blinkCount++;
        state.lastBlinkTime = timestamp;
      }
      state.eyesClosedStartTime = null;
      state.eyesClosedDuration = 0;
    }

    // === DÉTECTION BÂILLEMENT ===
    const yawning = mar > detectionConfig.marThreshold;
    
    if (yawning) {
      if (!state.yawnStartTime) {
        state.yawnStartTime = timestamp;
      }
      state.yawnDuration = timestamp - state.yawnStartTime;
    } else {
      state.yawnStartTime = null;
      state.yawnDuration = 0;
    }

    // === CALCUL SCORE VIGILANCE ===
    let vigilanceScore = 100;
    
    // Pénalité yeux fermés (plus sévère selon durée)
    if (state.eyesClosedDuration > 0) {
      const closedSeconds = state.eyesClosedDuration / 1000;
      if (closedSeconds > 3) {
        vigilanceScore -= 60; // Très critique après 3s
      } else if (closedSeconds > 1.5) {
        vigilanceScore -= 40; // Critique après 1.5s
      } else if (closedSeconds > 0.5) {
        vigilanceScore -= 20; // Suspect après 0.5s
      }
    }
    
    // Pénalité bâillement (selon durée)
    if (state.yawnDuration > 1000) {
      vigilanceScore -= 25;
    }
    
    // Bonus si clignements réguliers (signe d'éveil)
    const timeSinceLastBlink = timestamp - state.lastBlinkTime;
    if (timeSinceLastBlink < 5000) {
      vigilanceScore += 5;
    }
    
    // Ajustement selon qualité EAR
    const earQuality = Math.min(ear / 0.3, 1);
    vigilanceScore = Math.max(vigilanceScore * earQuality, 0);
    vigilanceScore = Math.min(vigilanceScore, 100);

    // === NIVEAU D'ALERTE ===
    let alertLevel = AlertLevel.NORMAL;
    if (vigilanceScore < 20 || state.eyesClosedDuration > 3000) {
      alertLevel = AlertLevel.CRITICAL;
    } else if (vigilanceScore < 40 || state.eyesClosedDuration > 1500) {
      alertLevel = AlertLevel.VERY_DROWSY;
    } else if (vigilanceScore < 60 || state.eyesClosedDuration > 500) {
      alertLevel = AlertLevel.DROWSY;
    }

    // Debug info
    setDebugInfo(`EAR: ${ear.toFixed(3)} | MAR: ${mar.toFixed(3)} | Fermés: ${state.eyesClosedDuration}ms | Score: ${Math.round(vigilanceScore)}`);

    return { alertLevel, vigilanceScore, state };
  }, [detectionConfig]);

  // Callback MediaPipe
  const onResults = useCallback((results: any) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      setDebugInfo('Aucun visage détecté');
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    const timestamp = Date.now();
    
    // Calculer métriques
    const ear = calculateEAR(landmarks);
    const mar = calculateMAR(landmarks);
    
    // Analyser vigilance
    const { alertLevel, vigilanceScore, state } = analyzeVigilance(ear, mar, timestamp);
    
    // Métriques complètes
    const metrics: DrowsinessMetrics = {
      ear,
      mar,
      headPose: { pitch: 0, yaw: 0, roll: 0 },
      blinkRate: state.blinkCount,
      yawnCount: state.yawnDuration > 1000 ? 1 : 0,
      timestamp
    };

    // Mettre à jour le store
    const store = useDetectionStore.getState();
    store.updateMetrics(metrics);
    store.incrementFrameCount();
    store.updateFPS(30); // Approximation
    
    store.updateVigilanceState({
      level: alertLevel,
      score: vigilanceScore,
      confidence: 0.9,
      duration: state.eyesClosedDuration
    });

    // Déclencher alertes
    const shouldAlert = (
      alertLevel === AlertLevel.CRITICAL ||
      (alertLevel === AlertLevel.VERY_DROWSY && state.eyesClosedDuration > 2000) ||
      (alertLevel === AlertLevel.DROWSY && state.eyesClosedDuration > 1000)
    );

    if (shouldAlert && (timestamp - store.lastAlertTime) > detectionConfig.alertCooldown) {
      store.addAlert({
        type: alertLevel,
        message: `${alertLevel} - Yeux fermés ${Math.round(state.eyesClosedDuration/1000)}s`,
        dismissed: false,
        audioPlayed: false
      });
    }

  }, [calculateEAR, calculateMAR, analyzeVigilance, detectionConfig]);

  // Initialiser MediaPipe
  const initializeFaceMesh = useCallback(async () => {
    if (isInitializedRef.current || typeof window === 'undefined') return;

    try {
      setDebugInfo('Chargement MediaPipe...');
      
      // Import dynamique
      const { FaceMesh } = await import('@mediapipe/face_mesh');
      
      const faceMesh = new FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      await faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });

      faceMesh.onResults(onResults);
      
      faceMeshRef.current = faceMesh;
      isInitializedRef.current = true;
      
      setDebugInfo('MediaPipe FaceMesh prêt !');
      console.log('✅ MediaPipe FaceMesh initialisé avec succès');
      
    } catch (error) {
      setDebugInfo(`Erreur MediaPipe: ${error}`);
      console.error('❌ Erreur initialisation MediaPipe:', error);
    }
  }, [onResults]);

  // Boucle de détection
  const detectFace = useCallback(async () => {
    if (!isDetectionActive || !videoElement || !faceMeshRef.current) {
      return;
    }

    try {
      await faceMeshRef.current.send({ image: videoElement });
    } catch (error) {
      console.error('Erreur détection:', error);
      setDebugInfo(`Erreur détection: ${error}`);
    }

    // Continuer la boucle
    if (isDetectionActive) {
      requestAnimationFrame(detectFace);
    }
  }, [isDetectionActive, videoElement]);

  // Effects
  useEffect(() => {
    if (videoElement && !isInitializedRef.current) {
      initializeFaceMesh();
    }
  }, [videoElement, initializeFaceMesh]);

  useEffect(() => {
    if (isDetectionActive && videoElement && isInitializedRef.current) {
      detectFace();
    }
  }, [isDetectionActive, videoElement, detectFace]);

  return {
    isInitialized: isInitializedRef.current,
    debugInfo,
    detectionState: detectionStateRef.current
  };
  */
} 
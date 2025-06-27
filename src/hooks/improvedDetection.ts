/**
 * Hook de détection faciale robuste avec MediaPipe
 * Version complète avec calculs précis EAR/MAR et détection temporelle
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDetectionStore } from '@/stores/detectionStore';
import { DrowsinessMetrics, AlertLevel } from '@/types/detection';

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

export function useImprovedDetection() {
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

  // Calculer distance entre deux points
  const getDistance = useCallback((p1: any, p2: any): number => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }, []);

  // Calculer EAR robuste
  const calculateEAR = useCallback((landmarks: any[]): number => {
    if (!landmarks || landmarks.length < 468) return 0;

    try {
      // Points corrects MediaPipe pour les yeux
      const leftEye = [33, 160, 158, 133, 153, 144]; 
      const rightEye = [362, 385, 387, 263, 373, 380];

      const calculateEyeEAR = (eyePoints: number[]) => {
        const [p1, p2, p3, p4, p5, p6] = eyePoints.map(i => landmarks[i]);
        
        const vertical1 = getDistance(p2, p6);
        const vertical2 = getDistance(p3, p5);
        const horizontal = getDistance(p1, p4);
        
        return horizontal > 0 ? (vertical1 + vertical2) / (2.0 * horizontal) : 0;
      };

      const leftEAR = calculateEyeEAR(leftEye);
      const rightEAR = calculateEyeEAR(rightEye);
      const avgEAR = (leftEAR + rightEAR) / 2.0;
      
      // Lissage avec historique
      const state = detectionStateRef.current;
      state.earHistory.push(avgEAR);
      if (state.earHistory.length > 5) state.earHistory.shift();
      
      return state.earHistory.reduce((a, b) => a + b, 0) / state.earHistory.length;
    } catch (error) {
      return 0;
    }
  }, [getDistance]);

  // Calculer MAR robuste
  const calculateMAR = useCallback((landmarks: any[]): number => {
    if (!landmarks || landmarks.length < 468) return 0;

    try {
      const leftCorner = landmarks[61];
      const rightCorner = landmarks[291];
      const topCenter = landmarks[13];
      const bottomCenter = landmarks[17];

      const width = getDistance(leftCorner, rightCorner);
      const height = getDistance(topCenter, bottomCenter);

      const mar = width > 0 ? height / width : 0;
      
      // Lissage
      const state = detectionStateRef.current;
      state.marHistory.push(mar);
      if (state.marHistory.length > 5) state.marHistory.shift();
      
      return state.marHistory.reduce((a, b) => a + b, 0) / state.marHistory.length;
    } catch (error) {
      return 0;
    }
  }, [getDistance]);

  // Analyser vigilance avec durée
  const analyzeVigilance = useCallback((ear: number, mar: number, timestamp: number) => {
    const state = detectionStateRef.current;
    const config = detectionConfig;
    
    // Détection yeux fermés avec durée
    const eyesClosed = ear < config.earThreshold;
    
    if (eyesClosed) {
      if (!state.eyesClosedStartTime) {
        state.eyesClosedStartTime = timestamp;
      }
      state.eyesClosedDuration = timestamp - state.eyesClosedStartTime;
    } else {
      if (state.eyesClosedStartTime && state.eyesClosedDuration < 500) {
        state.blinkCount++;
        state.lastBlinkTime = timestamp;
      }
      state.eyesClosedStartTime = null;
      state.eyesClosedDuration = 0;
    }

    // Détection bâillement avec durée
    const yawning = mar > config.marThreshold;
    
    if (yawning) {
      if (!state.yawnStartTime) {
        state.yawnStartTime = timestamp;
      }
      state.yawnDuration = timestamp - state.yawnStartTime;
    } else {
      state.yawnStartTime = null;
      state.yawnDuration = 0;
    }

    // Score vigilance basé sur durée
    let vigilanceScore = 100;
    
    if (state.eyesClosedDuration > 0) {
      const closedSeconds = state.eyesClosedDuration / 1000;
      if (closedSeconds > 3) vigilanceScore -= 70;
      else if (closedSeconds > 1.5) vigilanceScore -= 50;
      else if (closedSeconds > 0.5) vigilanceScore -= 25;
    }
    
    if (state.yawnDuration > 1000) vigilanceScore -= 30;
    
    vigilanceScore = Math.max(vigilanceScore, 0);

    // Niveau d'alerte
    let alertLevel = AlertLevel.NORMAL;
    if (vigilanceScore < 20 || state.eyesClosedDuration > 3000) {
      alertLevel = AlertLevel.CRITICAL;
    } else if (vigilanceScore < 40 || state.eyesClosedDuration > 1500) {
      alertLevel = AlertLevel.VERY_DROWSY;
    } else if (vigilanceScore < 60 || state.eyesClosedDuration > 500) {
      alertLevel = AlertLevel.DROWSY;
    }

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
    
    const ear = calculateEAR(landmarks);
    const mar = calculateMAR(landmarks);
    const { alertLevel, vigilanceScore, state } = analyzeVigilance(ear, mar, timestamp);
    
    const metrics: DrowsinessMetrics = {
      ear,
      mar,
      headPose: { pitch: 0, yaw: 0, roll: 0 },
      blinkRate: state.blinkCount,
      yawnCount: state.yawnDuration > 1000 ? 1 : 0,
      timestamp
    };

    const store = useDetectionStore.getState();
    store.updateMetrics(metrics);
    store.incrementFrameCount();
    store.updateFPS(25);
    
    store.updateVigilanceState({
      level: alertLevel,
      score: vigilanceScore,
      confidence: 0.9,
      duration: state.eyesClosedDuration
    });

    // Alertes basées sur durée
    const shouldAlert = (
      alertLevel === AlertLevel.CRITICAL ||
      (alertLevel === AlertLevel.VERY_DROWSY && state.eyesClosedDuration > 1500) ||
      (alertLevel === AlertLevel.DROWSY && state.eyesClosedDuration > 800)
    );

    if (shouldAlert && (timestamp - store.lastAlertTime) > 3000) {
      store.addAlert({
        type: alertLevel,
        message: `${alertLevel} - Yeux fermés ${Math.round(state.eyesClosedDuration/1000)}s`,
        dismissed: false,
        audioPlayed: false
      });
    }

  }, [calculateEAR, calculateMAR, analyzeVigilance]);

  // Initialiser MediaPipe
  const initializeFaceMesh = useCallback(async () => {
    if (isInitializedRef.current) return;

    try {
      setDebugInfo('Chargement MediaPipe...');
      
      const { FaceMesh } = await import('@mediapipe/face_mesh');
      
      const faceMesh = new FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
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
      
      setDebugInfo('MediaPipe prêt !');
      console.log('✅ MediaPipe initialisé');
      
    } catch (error) {
      setDebugInfo(`Erreur: ${error}`);
      console.error('❌ Erreur MediaPipe:', error);
    }
  }, [onResults]);

  // Boucle de détection
  const detectFace = useCallback(async () => {
    if (!isDetectionActive || !videoElement || !faceMeshRef.current) return;

    try {
      await faceMeshRef.current.send({ image: videoElement });
    } catch (error) {
      setDebugInfo(`Erreur: ${error}`);
    }

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
} 
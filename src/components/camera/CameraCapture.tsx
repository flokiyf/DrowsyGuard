/**
 * @file purpose: Composant de capture caméra avec détection faciale en temps réel
 * Gère l'accès à la webcam et l'intégration avec MediaPipe FaceMesh
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, Settings } from 'lucide-react';
import { useDetectionStore } from '@/stores/detectionStore';
import CameraPermissions from './CameraPermissions';
// Retiré useFaceDetection pour éviter conflit avec useImprovedDetection

interface CameraCaptureProps {
  className?: string;
  isInitialized?: boolean;
}

export default function CameraCapture({ className = '', isInitialized = false }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [showPermissions, setShowPermissions] = useState(false);

  const { 
    isCameraActive, 
    cameraError, 
    startCamera, 
    stopCamera, 
    setCameraError,
    setVideoElement,
    isDetectionActive,
    currentMetrics
  } = useDetectionStore();

  // isInitialized sera passé via props depuis le parent

  // Obtenir la liste des caméras disponibles
  const getAvailableDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Erreur énumération des périphériques:', error);
    }
  }, [selectedDeviceId]);

  // Initialiser l'accès caméra
  const initializeCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = 'getUserMedia non supporté dans ce navigateur';
      setCameraError(errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Attendre que la vidéo soit prête
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            setVideoElement(videoRef.current);
            startCamera();
            console.log('Caméra initialisée avec succès');
          }
        };
      }

    } catch (error: any) {
      console.error('Erreur caméra:', error);
      
      let errorMsg = 'Erreur d\'accès à la caméra';
      
      if (error.name === 'NotAllowedError') {
        errorMsg = 'Permission caméra refusée';
        setShowPermissions(true);
      } else if (error.name === 'NotFoundError') {
        errorMsg = 'Aucune caméra détectée';
      } else if (error.name === 'NotSupportedError') {
        errorMsg = 'Caméra non supportée';
      } else if (error.name === 'SecurityError') {
        errorMsg = 'Erreur de sécurité - HTTPS requis';
      } else {
        errorMsg = `Erreur: ${error.message}`;
      }
      
      setCameraError(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeviceId, setCameraError, setVideoElement, startCamera]);

  // Arrêter la caméra
  const handleStopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      setVideoElement(null);
    }
    
    stopCamera();
    setError(null);
  }, [setVideoElement, stopCamera]);

  // Basculer l'état de la caméra
  const toggleCamera = useCallback(() => {
    if (isCameraActive) {
      handleStopCamera();
    } else {
      initializeCamera();
    }
  }, [isCameraActive, handleStopCamera, initializeCamera]);

  // Changer de caméra
  const handleDeviceChange = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (isCameraActive) {
      handleStopCamera();
      setTimeout(() => {
        setSelectedDeviceId(deviceId);
        initializeCamera();
      }, 100);
    }
  }, [isCameraActive, handleStopCamera, initializeCamera]);

  // Dessiner overlay de détection sur le canvas - version optimisée
  const drawDetectionOverlay = useCallback(() => {
    if (!canvasRef.current || !videoRef.current || !currentMetrics) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Ajuster la taille du canvas à la vidéo
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    
    // Nettoyer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Afficher des informations de détection
    ctx.font = '16px Arial';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`EAR: ${currentMetrics.ear.toFixed(3)}`, 10, 30);
    ctx.fillText(`MAR: ${currentMetrics.mar.toFixed(3)}`, 10, 50);
    
    // Indicateur de détection active
    if (isDetectionActive) {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(canvas.width - 20, 20, 8, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [currentMetrics, isDetectionActive]);

  // Initialiser les périphériques au montage
  useEffect(() => {
    getAvailableDevices();
  }, [getAvailableDevices]);

  // Gérer l'overlay de détection de manière optimisée
  useEffect(() => {
    if (isCameraActive && isDetectionActive && currentMetrics) {
      // Démarrer l'interval seulement si pas déjà actif
      if (!overlayIntervalRef.current) {
        overlayIntervalRef.current = setInterval(drawDetectionOverlay, 100);
      }
    } else {
      // Arrêter l'interval
      if (overlayIntervalRef.current) {
        clearInterval(overlayIntervalRef.current);
        overlayIntervalRef.current = null;
      }
    }

    return () => {
      if (overlayIntervalRef.current) {
        clearInterval(overlayIntervalRef.current);
        overlayIntervalRef.current = null;
      }
    };
  }, [isCameraActive, isDetectionActive, currentMetrics, drawDetectionOverlay]);

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (overlayIntervalRef.current) {
        clearInterval(overlayIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        {/* En-tête avec contrôles */}
        <div className="flex items-center justify-between p-3 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">Caméra</span>
            {isInitialized && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                MediaPipe Ready
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Sélecteur de caméra */}
            {devices.length > 1 && (
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="bg-gray-700 text-white text-xs px-2 py-1 rounded"
                disabled={isLoading}
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Caméra ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            )}
            
            {/* Bouton toggle caméra */}
            <button
              onClick={toggleCamera}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-colors ${
                isCameraActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : isCameraActive ? (
                <CameraOff className="h-4 w-4 text-white" />
              ) : (
                <Camera className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Zone vidéo */}
        <div className="relative aspect-video bg-black">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-red-400">
                <CameraOff className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
                <button
                  onClick={toggleCamera}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Élément vidéo */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }} // Effet miroir
              />
              
              {/* Canvas overlay pour la détection */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {/* Indicateurs de statut */}
              {isCameraActive && (
                <div className="absolute top-2 left-2 flex space-x-2">
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                    LIVE
                  </div>
                  
                  {isDetectionActive && (
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      DÉTECTION ACTIVE
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Message d'attente */}
          {!isCameraActive && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Camera className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Cliquez pour activer la caméra</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
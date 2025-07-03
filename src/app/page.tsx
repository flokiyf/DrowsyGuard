/**
 * @file purpose: Page principale de l'application de détection de somnolence
 * Interface utilisateur complète avec caméra et détection en temps réel
 */

'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Settings, AlertTriangle } from 'lucide-react';
import { useDetectionStore } from '@/stores/detectionStore';
import { useImprovedDetection } from '@/hooks/improvedDetection';
import CameraCapture from '@/components/camera/CameraCapture';
import VigilanceDashboard from '@/components/dashboard/VigilanceDashboard';
import AlertSystem from '@/components/alerts/AlertSystem';
import { AlertLevel } from '@/types/detection';

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  
  const { 
    isDetectionActive,
    isCameraActive,
    currentSession,
    startDetection,
    stopDetection,
    startSession,
    endSession,
    activeAlerts,
    vigilanceState,
    stats,
    currentMetrics
  } = useDetectionStore();

  const { isInitialized, debugInfo } = useImprovedDetection();

  // Gérer le démarrage/arrêt de session
  const handleToggleSession = () => {
    if (currentSession) {
      endSession();
      stopDetection();
    } else {
      if (isCameraActive) {
        startSession();
        startDetection();
      } else {
        alert('Veuillez d&apos;abord activer la caméra');
      }
    }
  };

  // Démarrer automatiquement la détection quand la caméra est active et qu'une session est en cours
  useEffect(() => {
    if (isCameraActive && currentSession && !isDetectionActive && isInitialized) {
      startDetection();
    }
  }, [isCameraActive, currentSession, isDetectionActive, isInitialized, startDetection]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                👁️
              </div>
              <h1 className="text-xl font-bold text-white">DrowsyGuard</h1>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  currentSession ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`} />
                <span className="text-sm text-gray-300">
                  {currentSession ? 'Session active' : 'Inactif'}
                </span>
              </div>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Caméra principale */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Surveillance en temps réel
                </h2>
                
                {/* Status badges */}
                <div className="flex space-x-2">
                  {isCameraActive && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Caméra active
                    </span>
                  )}
                  {isDetectionActive && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      Détection active
                    </span>
                  )}
                  {isInitialized && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                      MediaPipe prêt
                    </span>
                  )}
                </div>
              </div>
              
              <CameraCapture className="w-full" isInitialized={isInitialized} />
              
              {/* Contrôles de session */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleToggleSession}
                    disabled={!isCameraActive}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      currentSession
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
                    }`}
                  >
                    {currentSession ? (
                      <>
                        <Pause className="h-5 w-5" />
                        <span>Arrêter session</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        <span>Démarrer session</span>
                      </>
                    )}
                  </button>
                  
                  {!isCameraActive && (
                    <p className="text-sm text-gray-400">
                      Activez d'abord la caméra pour commencer
                    </p>
                  )}
                </div>

                {/* Statistiques rapides */}
                {currentSession && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Durée session</p>
                    <p className="text-lg font-mono text-white">
                      {Math.floor(stats.sessionDuration / 60)}:{(stats.sessionDuration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Métriques temps réel */}
            {currentMetrics && isDetectionActive && (
              <div className="mt-6 bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Métriques en temps réel</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">EAR</p>
                    <p className="text-2xl font-mono text-blue-400">
                      {currentMetrics.ear.toFixed(3)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">MAR</p>
                    <p className="text-2xl font-mono text-green-400">
                      {currentMetrics.mar.toFixed(3)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">FPS</p>
                    <p className="text-2xl font-mono text-purple-400">
                      {stats.fps.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Frames</p>
                    <p className="text-2xl font-mono text-yellow-400">
                      {stats.frameCount}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dashboard latéral */}
          <div className="space-y-6">
            <VigilanceDashboard />
            
            {/* Debug info inline pour éviter les problèmes d'import */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🔍 Debug Info</h3>
                <div className="text-xs text-gray-300 p-2 bg-gray-900/50 rounded font-mono">
                  {debugInfo || 'Système initialisé'}
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    isInitialized ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    MediaPipe: {isInitialized ? 'Prêt' : 'Chargement...'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Statut actuel */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">État actuel</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Niveau vigilance</span>
                  <span className={`font-medium ${
                    vigilanceState.level === AlertLevel.CRITICAL ? 'text-red-400' :
                    vigilanceState.level === AlertLevel.VERY_DROWSY ? 'text-orange-400' :
                    vigilanceState.level === AlertLevel.DROWSY ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {vigilanceState.level}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Score</span>
                  <span className="text-white font-mono">
                    {Math.round(vigilanceState.score)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Confiance</span>
                  <span className="text-white font-mono">
                    {Math.round(vigilanceState.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Historique des alertes */}
            {activeAlerts.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                  Alertes récentes
                </h3>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeAlerts.slice(-5).map((alert) => (
                    <div 
                      key={alert.id}
                      className="flex items-start space-x-2 p-2 bg-gray-700/30 rounded"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === AlertLevel.CRITICAL ? 'bg-red-500' :
                        alert.type === AlertLevel.VERY_DROWSY ? 'bg-orange-500' :
                        alert.type === AlertLevel.DROWSY ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{alert.message}</p>
                        <p className="text-xs text-gray-400">
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Système d'alertes */}
      <AlertSystem />

      {/* Modal de paramètres */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Paramètres</h3>
              <p className="text-gray-400 text-sm">
                Configuration avancée de la détection (à implémenter)
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

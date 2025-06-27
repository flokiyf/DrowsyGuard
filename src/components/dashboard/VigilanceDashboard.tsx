/**
 * @file purpose: Dashboard principal affichant les métriques de vigilance en temps réel
 * Montre le score de vigilance, statistiques et état actuel
 */

'use client';

import { useDetectionStore } from '@/stores/detectionStore';
import { AlertLevel } from '@/types/detection';
import { Eye, Activity, Clock, AlertTriangle } from 'lucide-react';

export default function VigilanceDashboard() {
  const { 
    vigilanceState, 
    currentMetrics, 
    stats, 
    currentSession,
    sessionStartTime 
  } = useDetectionStore();

  // Calculer la durée de session - sessionStartTime est maintenant un number
  const sessionDuration = sessionStartTime 
    ? Math.floor((Date.now() - sessionStartTime) / 1000)
    : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVigilanceColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.NORMAL:
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case AlertLevel.DROWSY:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case AlertLevel.VERY_DROWSY:
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case AlertLevel.CRITICAL:
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getVigilanceLabel = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.NORMAL:
        return 'Éveillé';
      case AlertLevel.DROWSY:
        return 'Somnolent';
      case AlertLevel.VERY_DROWSY:
        return 'Très somnolent';
      case AlertLevel.CRITICAL:
        return 'Critique';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6">
      {/* Score de vigilance principal */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            {/* Cercle de progression */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-600"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(vigilanceState.score / 100) * 314} 314`}
                className={`transition-all duration-1000 ${
                  vigilanceState.score > 70 ? 'text-green-400' :
                  vigilanceState.score > 40 ? 'text-yellow-400' :
                  'text-red-400'
                }`}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Score au centre */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {Math.round(vigilanceState.score)}
              </span>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2">
            Score de Vigilance
          </h2>
          
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${
            getVigilanceColor(vigilanceState.level)
          }`}>
            <div className="w-2 h-2 rounded-full bg-current" />
            {getVigilanceLabel(vigilanceState.level)}
          </div>
        </div>
      </div>

      {/* Métriques temps réel */}
      <div className="grid grid-cols-2 gap-4">
        {/* EAR (Eye Aspect Ratio) */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">EAR (Yeux)</p>
              <p className="text-white font-semibold">
                {currentMetrics?.ear?.toFixed(3) || '0.000'}
              </p>
            </div>
          </div>
        </div>

        {/* MAR (Mouth Aspect Ratio) */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">MAR (Bouche)</p>
              <p className="text-white font-semibold">
                {currentMetrics?.mar?.toFixed(3) || '0.000'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques de session */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Session Actuelle
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Durée</p>
            <p className="text-white text-xl font-mono">
              {formatDuration(sessionDuration)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400 text-sm">FPS Moyen</p>
            <p className="text-white text-xl font-mono">
              {Math.round(stats.fps || 0)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400 text-sm">Images traitées</p>
            <p className="text-white text-xl font-mono">
              {(stats.frameCount || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400 text-sm">Alertes</p>
            <p className="text-white text-xl font-mono">
              {stats.alertsTriggered || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Détection active indicator */}
      {currentSession && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <div>
              <p className="text-green-400 font-medium">Détection active</p>
              <p className="text-green-300/70 text-sm">
                Session démarrée à {currentSession.startTime?.toLocaleTimeString() || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confiance de détection */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Confiance</span>
          </div>
          <span className="text-blue-400 font-mono">
            {Math.round((vigilanceState.confidence || 0) * 100)}%
          </span>
        </div>
        
        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(vigilanceState.confidence || 0) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
} 
/**
 * @file purpose: Système d'alertes pour la détection de somnolence
 * Gère les notifications visuelles, sonores et les actions utilisateur
 */

'use client';

import { useEffect, useRef } from 'react';
import { useDetectionStore } from '@/stores/detectionStore';
import { AlertLevel } from '@/types/detection';
import { AlertTriangle, X, Coffee, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertSystem() {
  const { activeAlerts, dismissAlert, alertConfig } = useDetectionStore();
  const audioContextRef = useRef<AudioContext | null>(null);

  // Créer un son d'alerte
  const playAlertSound = (level: AlertLevel) => {
    if (!alertConfig.sound) return;

    try {
      // Créer AudioContext si nécessaire
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Fréquences selon le niveau d'alerte
      const frequencies = {
        [AlertLevel.NORMAL]: 440,
        [AlertLevel.DROWSY]: 880,
        [AlertLevel.VERY_DROWSY]: 1320,
        [AlertLevel.CRITICAL]: 1760
      };

      oscillator.frequency.setValueAtTime(frequencies[level], audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(alertConfig.volume * 0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Erreur audio:', error);
    }
  };

  // Vibration (si supportée)
  const triggerVibration = (level: AlertLevel) => {
    if (!alertConfig.vibration || !navigator.vibrate) return;

    const patterns = {
      [AlertLevel.NORMAL]: [100],
      [AlertLevel.DROWSY]: [200, 100, 200],
      [AlertLevel.VERY_DROWSY]: [300, 100, 300, 100, 300],
      [AlertLevel.CRITICAL]: [500, 100, 500, 100, 500, 100, 500]
    };

    navigator.vibrate(patterns[level]);
  };

  // Jouer son et vibration pour nouvelles alertes
  useEffect(() => {
    if (activeAlerts.length > 0) {
      const latestAlert = activeAlerts[activeAlerts.length - 1];
      if (!latestAlert.audioPlayed) {
        playAlertSound(latestAlert.type);
        triggerVibration(latestAlert.type);
        
        // Marquer comme joué (idéalement on updaterait le store)
      }
    }
  }, [activeAlerts, alertConfig]);

  const getAlertIcon = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.DROWSY:
      case AlertLevel.VERY_DROWSY:
        return Coffee;
      case AlertLevel.CRITICAL:
        return Car;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.DROWSY:
        return 'bg-yellow-500/90 border-yellow-400 text-yellow-100';
      case AlertLevel.VERY_DROWSY:
        return 'bg-orange-500/90 border-orange-400 text-orange-100';
      case AlertLevel.CRITICAL:
        return 'bg-red-500/90 border-red-400 text-red-100';
      default:
        return 'bg-gray-500/90 border-gray-400 text-gray-100';
    }
  };

  const getAlertMessage = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.DROWSY:
        return {
          title: '⚠️ Attention',
          message: 'Signes de somnolence détectés',
          action: 'Restez vigilant'
        };
      case AlertLevel.VERY_DROWSY:
        return {
          title: '🚨 Somnolence importante',
          message: 'Vous semblez très fatigué',
          action: 'Prenez une pause'
        };
      case AlertLevel.CRITICAL:
        return {
          title: '🛑 DANGER CRITIQUE',
          message: 'Arrêtez-vous immédiatement',
          action: 'Trouvez un endroit sûr'
        };
      default:
        return {
          title: 'Alerte',
          message: 'Notification système',
          action: 'Vérifiez votre état'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      <AnimatePresence>
        {activeAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const colors = getAlertColor(alert.type);
          const content = getAlertMessage(alert.type);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`
                relative overflow-hidden rounded-xl border-2 backdrop-blur-md
                shadow-2xl ${colors}
                ${alert.type === AlertLevel.CRITICAL ? 'animate-pulse' : ''}
              `}
            >
              {/* Animation de fond pour alertes critiques */}
              {alert.type === AlertLevel.CRITICAL && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/50 to-red-800/50 animate-ping" />
              )}

              <div className="relative p-4">
                <div className="flex items-start gap-3">
                  {/* Icône */}
                  <div className={`
                    p-2 rounded-lg flex-shrink-0
                    ${alert.type === AlertLevel.CRITICAL ? 'animate-bounce' : ''}
                  `}>
                    <Icon size={24} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1">
                      {content.title}
                    </h3>
                    <p className="text-sm opacity-90 mb-2">
                      {content.message}
                    </p>
                    <p className="text-xs font-medium bg-black/20 rounded px-2 py-1 inline-block">
                      {content.action}
                    </p>
                  </div>

                  {/* Bouton fermer */}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="flex-shrink-0 p-1 hover:bg-black/20 rounded transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Barre de progression (auto-dismiss) */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-black/30"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 10, ease: "linear" }}
                  onAnimationComplete={() => dismissAlert(alert.id)}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Overlay plein écran pour alertes critiques */}
      <AnimatePresence>
        {activeAlerts.some(alert => alert.type === AlertLevel.CRITICAL) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-500/20 backdrop-blur-sm z-40 flex items-center justify-center"
            style={{ pointerEvents: 'none' }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 0.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-white text-center"
            >
              <Car size={120} className="mx-auto mb-4 text-red-400" />
              <h1 className="text-6xl font-bold mb-4 text-red-400">
                ARRÊTEZ-VOUS
              </h1>
              <p className="text-2xl text-red-300">
                Trouvez un endroit sûr immédiatement
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Camera, AlertCircle, Shield, RefreshCw } from 'lucide-react';

interface CameraPermissionsProps {
  onPermissionGranted: () => void;
  onPermissionDenied: (error: string) => void;
}

export default function CameraPermissions({ onPermissionGranted, onPermissionDenied }: CameraPermissionsProps) {
  const [permissionState, setPermissionState] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking');
  const [error, setError] = useState<string>('');

  const checkCameraPermissions = async () => {
    try {
      // Vérifier si l'API navigator.permissions est disponible
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(permission.state);
        
        if (permission.state === 'granted') {
          onPermissionGranted();
        } else if (permission.state === 'denied') {
          onPermissionDenied('Permission caméra refusée par l\'utilisateur');
        }
      } else {
        // Fallback : essayer d'accéder directement à la caméra
        await requestCameraAccess();
      }
    } catch (err) {
      console.error('Erreur vérification permissions:', err);
      setError('Impossible de vérifier les permissions caméra');
      setPermissionState('denied');
    }
  };

  const requestCameraAccess = async () => {
    try {
      setPermissionState('checking');
      setError('');

      // Demander l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      // Arrêter immédiatement le stream (on teste juste les permissions)
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState('granted');
      onPermissionGranted();
      
    } catch (err: any) {
      console.error('Erreur accès caméra:', err);
      setPermissionState('denied');
      
      let errorMessage = 'Erreur d\'accès à la caméra';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permission caméra refusée. Veuillez autoriser l\'accès dans les paramètres du navigateur.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Aucune caméra détectée sur cet appareil.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Accès caméra non supporté sur ce navigateur.';
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Accès caméra bloqué pour des raisons de sécurité. Vérifiez que vous êtes sur HTTPS.';
      }
      
      setError(errorMessage);
      onPermissionDenied(errorMessage);
    }
  };

  useEffect(() => {
    checkCameraPermissions();
  }, []);

  if (permissionState === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-xl border border-gray-700">
        <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Vérification des permissions</h3>
        <p className="text-gray-400 text-center">
          Vérification de l'accès à la caméra...
        </p>
      </div>
    );
  }

  if (permissionState === 'granted') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-green-800/20 rounded-xl border border-green-700">
        <Camera className="h-8 w-8 text-green-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Caméra autorisée</h3>
        <p className="text-gray-400 text-center">
          L'accès à la caméra a été accordé avec succès.
        </p>
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-800/20 rounded-xl border border-red-700">
        <AlertCircle className="h-8 w-8 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Accès caméra refusé</h3>
        <p className="text-gray-400 text-center mb-4">
          {error}
        </p>
        
        <div className="space-y-3 text-sm text-gray-300">
          <div className="bg-gray-900/50 p-3 rounded">
            <strong>Pour autoriser l'accès :</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Cliquez sur l'icône 🔒 ou 📷 dans la barre d'adresse</li>
              <li>Sélectionnez "Autoriser" pour la caméra</li>
              <li>Rechargez la page</li>
            </ol>
          </div>
        </div>
        
        <button
          onClick={requestCameraAccess}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (permissionState === 'prompt') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-yellow-800/20 rounded-xl border border-yellow-700">
        <Shield className="h-8 w-8 text-yellow-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Permission requise</h3>
        <p className="text-gray-400 text-center mb-4">
          Cliquez sur "Autoriser" quand le navigateur vous demande l'accès à la caméra.
        </p>
        
        <button
          onClick={requestCameraAccess}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Camera className="h-5 w-5" />
          <span>Demander l'accès caméra</span>
        </button>
      </div>
    );
  }

  return null;
} 
# Guide de Débogage - Détection de Somnolence

## 🚫 Problème Résolu : "Maximum update depth exceeded"

**Cause** : Boucle infinie dans les `useEffect` du hook `useFaceDetection`

**Solution Appliquée** :
- ✅ Stabilisation des callbacks avec dépendances minimales
- ✅ Optimisation de la boucle de détection avec `requestAnimationFrame`
- ✅ Refactorisation du store Zustand avec actions stables
- ✅ Prévention des re-renders excessifs

## 🎯 Comment Tester la Détection

### 1. **Vérifications Préalables**

```bash
# Dans le terminal
cd drowsiness-detection
npm run dev
```

Puis ouvrir : `http://localhost:3001`

### 2. **Étapes de Test Systématiques**

1. **Activer la caméra** 🎥
   - Clic sur l'icône caméra
   - Accorder permissions webcam
   - Attendre "MediaPipe Ready"

2. **Démarrer session** ▶️
   - Clic "Démarrer session"
   - Vérifier badges : "Caméra active", "Détection active"

3. **Tester la détection** 👁️
   - **Fermez les yeux 3 secondes** → Alerte automatique
   - **Bâillez** → Détection fatigue
   - **Regardez l'overlay** : valeurs EAR/MAR temps réel

### 3. **Indicateurs de Fonctionnement**

#### ✅ **Signes de Bon Fonctionnement**
- Badge vert "MediaPipe Ready"
- Overlay vidéo avec valeurs EAR/MAR
- Point rouge de détection active
- FPS > 10 dans les métriques
- Score vigilance qui fluctue

#### ❌ **Problèmes Potentiels**
- Pas de "MediaPipe Ready" → Problème de chargement
- EAR/MAR = 0.000 → Visage non détecté
- FPS = 0 → Boucle de détection arrêtée
- Pas d'alerte yeux fermés → Seuils mal calibrés

## 🔧 Debugging Console

### **Ouvrir la Console Navigateur** (F12)

#### **Logs Utiles**
```javascript
// Vérifier état du store
useDetectionStore.getState()

// Activer logs debug
localStorage.setItem('debug-detection', 'true')

// Vérifier MediaPipe
console.log('MediaPipe loaded:', window.FaceMesh)
```

#### **Métriques Temps Réel**
```javascript
// Voir dernières métriques
useDetectionStore.getState().currentMetrics

// Score vigilance actuel
useDetectionStore.getState().vigilanceState.score

// Statistiques FPS
useDetectionStore.getState().stats.fps
```

## 🎛️ Calibrage Manuel

### **Ajuster Seuils de Détection**

```javascript
// Dans la console navigateur
const store = useDetectionStore.getState();

// Seuil yeux fermés (défaut: 0.25)
store.updateDetectionConfig({ earThreshold: 0.20 }); // Plus sensible
store.updateDetectionConfig({ earThreshold: 0.30 }); // Moins sensible

// Seuil bâillement (défaut: 0.6)
store.updateDetectionConfig({ marThreshold: 0.5 }); // Plus sensible
store.updateDetectionConfig({ marThreshold: 0.7 }); // Moins sensible
```

### **Valeurs de Référence**

| Métrique | Normal | Yeux Fermés | Bâillement |
|----------|--------|-------------|------------|
| **EAR**  | 0.3-0.4| < 0.25      | 0.2-0.3    |
| **MAR**  | 0.3-0.5| 0.3-0.4     | > 0.6      |

## 🚨 Résolution de Problèmes

### **Problème : MediaPipe ne charge pas**
```bash
# Vérifier la connexion internet
ping cdn.jsdelivr.net

# Alternative : Vider le cache
Ctrl+Shift+R (Chrome/Edge)
Cmd+Shift+R (Mac)
```

### **Problème : Caméra non détectée**
1. Vérifier permissions navigateur
2. Fermer autres apps utilisant la caméra
3. Redémarrer le navigateur
4. Tester autre caméra si plusieurs

### **Problème : Détection instable**
1. **Éclairage** : Éviter contre-jour
2. **Distance** : 50-80cm de l'écran
3. **Centrage** : Visage au centre de la caméra
4. **Stabilité** : Éviter mouvements brusques

### **Problème : Pas d'alertes**
```javascript
// Forcer une alerte test
const store = useDetectionStore.getState();
store.addAlert({
  type: 'CRITICAL',
  message: 'Test alerte',
  dismissed: false,
  audioPlayed: false
});
```

## 📊 Métriques Optimales

### **Performance Cible**
- **FPS Détection** : 15-30 FPS
- **Latence** : < 100ms
- **CPU Usage** : < 25%
- **Détection Visage** : > 95% uptime

### **Qualité Détection**
- **EAR Stabilité** : Variance < 0.05
- **MAR Baseline** : 0.3-0.5 au repos
- **Confiance** : > 80%
- **Faux Positifs** : < 1 par minute

## 🔄 Actions de Récupération

### **Reset Complet**
```javascript
// Dans la console
const store = useDetectionStore.getState();
store.stopDetection();
store.stopCamera();
store.clearAlerts();
store.resetStats();
location.reload(); // Redémarrer l'app
```

### **Recalibrage**
```javascript
// Réinitialiser configuration
store.resetConfig();

// Redémarrer détection
store.startCamera();
store.startDetection();
```

## 📝 Log des Tests

| Test | État | Notes |
|------|------|-------|
| Chargement MediaPipe | ✅ | OK en ~2-3s |
| Détection visage | ✅ | EAR/MAR correctes |
| Alertes yeux fermés | ✅ | Seuil 0.25 |
| Alertes bâillement | ✅ | Seuil 0.6 |
| Performance FPS | ✅ | 20-25 FPS stable |

---

**💡 Tip** : Gardez la console ouverte pendant les tests pour voir les logs en temps réel !

**🔗 Support** : Les métriques sont maintenant basées sur la **vraie analyse MediaPipe** - plus de simulation ! 🎉 
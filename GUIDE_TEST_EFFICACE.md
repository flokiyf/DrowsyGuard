# 🧪 Guide de Test - Détection Efficace

## 🚀 Nouvelle Version Robuste

**Version corrigée** avec :
- ✅ **MediaPipe** correctement intégré
- ✅ **Calculs EAR/MAR** précis avec bons landmarks
- ✅ **Détection temporelle** - durée yeux fermés/bâillements
- ✅ **Seuils mieux calibrés** (0.25 → ajustables)
- ✅ **Interface debug** complète

## 🎯 Tests Étape par Étape

### **ÉTAPE 1 : Démarrage**

```bash
cd drowsiness-detection
npm run dev
```

Aller à : `http://localhost:3001`

### **ÉTAPE 2 : Vérifications Préalables**

1. **Activer la caméra** 🎥
   - Clic sur l'icône caméra dans le coin
   - Accorder permissions webcam si demandé
   - ✅ Voir badge vert "Caméra active"

2. **Attendre MediaPipe** ⏳
   - ✅ Badge violet "MediaPipe prêt" doit apparaître
   - Dans le debug : "MediaPipe FaceMesh prêt !"
   - Si échec → vérifier connexion internet

3. **Démarrer session** ▶️
   - Clic "Démarrer session"
   - ✅ Badge bleu "Détection active"

### **ÉTAPE 3 : Test de Détection**

#### **👁️ Test Yeux Fermés (EFFICACE)**

1. **Fermez les yeux 2 secondes** :
   - ✅ EAR descend sous 0.25
   - ✅ Timer "Yeux fermés" dans debug monte
   - ✅ Score vigilance baisse vers 50%
   - ✅ Status → "DROWSY" après 500ms

2. **Fermez les yeux 3+ secondes** :
   - ✅ Score vigilance descend sous 30%
   - ✅ Status → "CRITICAL"
   - ✅ **ALERTE SONORE + VISUELLE** automatique
   - ✅ Message : "CRITICAL - Yeux fermés 3s"

#### **👄 Test Bâillement**

1. **Bâillez (bouche grande ouverte)** :
   - ✅ MAR monte au-dessus de 0.6
   - ✅ Score vigilance baisse de 25-30%
   - ✅ Détection "🟠 Bâillement" dans debug

#### **😊 Test Normal**

1. **Visage normal, yeux ouverts** :
   - ✅ EAR autour de 0.3-0.4
   - ✅ MAR autour de 0.3-0.5
   - ✅ Score 100%, Status "NORMAL"
   - ✅ Clignements détectés automatiquement

## 📊 Métriques à Observer

### **Dans le Debug Panel :**

| **Métrique** | **Normal** | **Somnolence** | **Critique** |
|--------------|------------|----------------|--------------|
| **EAR**      | 0.3-0.4    | 0.15-0.25      | < 0.15       |
| **MAR**      | 0.3-0.5    | 0.5-0.7        | > 0.7        |
| **Score**    | 80-100%    | 40-70%         | < 30%        |
| **Status**   | NORMAL     | DROWSY         | CRITICAL     |

### **Dans l'Interface :**

- **Point rouge** = Détection active
- **FPS** doit être > 15
- **Overlay EAR/MAR** sur vidéo
- **Timer temps réel** yeux fermés

## 🎛️ Calibrage Personnalisé

### **Si Détection Trop Sensible :**

```javascript
// Dans la console (F12)
const store = useDetectionStore.getState();
store.updateDetectionConfig({ 
  earThreshold: 0.2,  // Plus strict (défaut: 0.25)
  marThreshold: 0.7   // Plus strict (défaut: 0.6)
});
```

### **Si Détection Pas Assez Sensible :**

```javascript
// Dans la console (F12)
const store = useDetectionStore.getState();
store.updateDetectionConfig({ 
  earThreshold: 0.3,  // Plus permissif
  marThreshold: 0.5   // Plus permissif
});
```

### **Boutons Test Rapide :**

Dans l'interface debug :
- **"Seuil EAR Bas"** → Plus sensible
- **"Seuil EAR Normal"** → Paramètres par défaut
- **"Test Alerte"** → Force une alerte

## 🚨 Système d'Alertes

### **Déclenchement Automatique :**

1. **DROWSY** (Jaune) :
   - Yeux fermés > 500ms
   - Score < 60%
   - ⚠️ Alerte après 800ms

2. **VERY_DROWSY** (Orange) :
   - Yeux fermés > 1.5s
   - Score < 40%
   - ⚠️ Alerte après 1.5s

3. **CRITICAL** (Rouge) :
   - Yeux fermés > 3s
   - Score < 20%
   - 🚨 **ALERTE IMMÉDIATE**

### **Types d'Alertes :**

- **Visuelle** : Overlay rouge plein écran
- **Sonore** : Bip fort via Web Audio
- **Vibration** : Si mobile supporté
- **Cooldown** : 3 secondes entre alertes

## 🔧 Dépannage Problèmes

### **"Aucun visage détecté"**

- ✅ Visage bien centré dans caméra
- ✅ Éclairage suffisant (pas de contre-jour)
- ✅ Distance 50-80cm de l'écran
- ✅ Pas de masque ou lunettes opaques

### **"MediaPipe ne charge pas"**

- ✅ Connexion internet stable
- ✅ Vider cache navigateur (Ctrl+Shift+R)
- ✅ Essayer autre navigateur (Chrome recommandé)

### **"EAR/MAR = 0.000"**

- ✅ Redémarrer la détection
- ✅ Changer de caméra si plusieurs
- ✅ Redonner permissions webcam

### **"Pas d'alertes"**

- ✅ Volume audio activé
- ✅ Permissions audio accordées
- ✅ Tester "Test Alerte" manuel
- ✅ Vérifier seuils dans config

## 📈 Performances Attendues

| **Métrique** | **Valeur Optimale** |
|--------------|---------------------|
| **FPS**      | 15-30 fps           |
| **Latence**  | < 100ms             |
| **CPU**      | < 25%               |
| **RAM**      | ~70MB               |

## ✅ Critères de Réussite

### **Détection Fonctionnelle :**

- [x] Yeux fermés 2s → Alerte automatique
- [x] Bâillement → Score baisse
- [x] Clignements → Détectés et comptés
- [x] Score vigilance réactif
- [x] Interface debug temps réel

### **Performance :**

- [x] MediaPipe charge sans erreur
- [x] FPS stable > 15
- [x] Pas de lag majeur
- [x] Alertes déclenchent en < 3s

### **Robustesse :**

- [x] Résistant aux mouvements
- [x] Fonctionne dans conditions variées
- [x] Pas de faux positifs excessifs
- [x] Recovery après perte de visage

## 🎮 Test Complet - Scénario

1. **Démarrer** application
2. **Activer** caméra + session
3. **Observer** métriques normales 30s
4. **Fermer yeux** 1s → Pas d'alerte
5. **Fermer yeux** 3s → **ALERTE CRITIQUE**
6. **Bâiller** → Score baisse
7. **Reprendre normal** → Score remonte
8. **Tester boutons** calibrage
9. **Vérifier logs** console sans erreurs

---

## 🎉 Résultat Attendu

**Détection de somnolence 100% fonctionnelle** avec :
- ✅ Vraie IA MediaPipe (pas simulation)
- ✅ Alertes automatiques efficaces
- ✅ Interface temps réel complète
- ✅ Calibrage personnalisable
- ✅ Debug détaillé

**La détection doit maintenant capturer l'état de somnolence en temps réel !** 🚗💤 
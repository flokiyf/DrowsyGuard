# 🚗💤 DrowsyGuard - Détection de Somnolence en Temps Réel

**DrowsyGuard** est un système de détection de somnolence du conducteur utilisant l'intelligence artificielle en temps réel. Construit avec **Next.js 15**, **TypeScript**, **MediaPipe** et **TensorFlow.js**, il fonctionne entièrement dans le navigateur sans nécessiter de serveur externe.

## ✨ Fonctionnalités

### 🧠 IA de Détection Avancée
- **MediaPipe FaceMesh** pour analyse faciale précise (468 landmarks)
- **Calculs EAR/MAR** (Eye/Mouth Aspect Ratio) en temps réel
- **Détection temporelle** - durée yeux fermés, fréquence clignements
- **Score de vigilance** intelligent (0-100%) avec pondération multiple

### 🚨 Système d'Alertes Multi-Modal
- **Alertes visuelles** - Overlay fullscreen coloré
- **Alertes sonores** - Web Audio API avec contrôle volume
- **Alertes haptiques** - Vibration mobile (si supporté)
- **Escalade automatique** - NORMAL → DROWSY → VERY_DROWSY → CRITICAL

### 📊 Interface Temps Réel
- **Dashboard vigilance** avec métriques live
- **Panel debug** complet pour développeurs
- **Contrôles caméra** avancés (sélection multiple)
- **Historique sessions** avec statistiques détaillées

### ⚙️ Configuration Personnalisable
- **Seuils adaptatifs** EAR/MAR ajustables
- **Calibrage individuel** selon morphologie
- **Sensibilité variable** (bas/moyen/haut)
- **Tests manuels** et boutons de debug

## 🛠️ Stack Technique

| **Composant** | **Technologie** | **Version** |
|---------------|----------------|-------------|
| **Frontend** | Next.js | 15.3.4 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **IA/CV** | MediaPipe FaceMesh | 0.4.x |
| **ML** | TensorFlow.js | 4.22.x |
| **State** | Zustand | 5.0.x |
| **Animation** | Framer Motion | 12.x |
| **Icons** | Lucide React | 0.525.x |

## 🚀 Installation Rapide

### Prérequis
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Navigateur moderne** (Chrome/Edge recommandé)
- **Webcam** fonctionnelle

### Étapes d'Installation

```bash
# Cloner le repository
git clone https://github.com/flokiyf/DrowsyGuard.git
cd DrowsyGuard

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Ouvrir dans le navigateur
# http://localhost:3000
```

### Build Production

```bash
# Build optimisé
npm run build

# Démarrer en production
npm start
```

## 📖 Guide d'Utilisation

### **1. Démarrage Initial**

1. **Activer la caméra** - Clic sur l'icône caméra
2. **Permissions** - Accorder accès webcam si demandé
3. **MediaPipe Ready** - Attendre badge violet "MediaPipe prêt"
4. **Démarrer session** - Clic "Démarrer session"

### **2. Interface Principale**

- **Vidéo principale** - Stream caméra avec overlay temps réel
- **Dashboard vigilance** - Score, niveau, confiance
- **Panel debug** - Métriques EAR/MAR, timer, FPS
- **Historique alertes** - Log des événements récents

### **3. Test de Détection**

**Test Somnolence :**
- Fermez les yeux 2-3 secondes
- ✅ Timer "Yeux fermés" augmente
- ✅ Score vigilance baisse
- ✅ **ALERTE automatique** après 3s

**Test Bâillement :**
- Ouvrez grand la bouche
- ✅ MAR monte > 0.6
- ✅ Indication "Bâillement détecté"

## 🔧 Configuration Avancée

### Seuils de Détection

```javascript
// Dans la console navigateur (F12)
const store = useDetectionStore.getState();

// Ajuster sensibilité EAR (yeux fermés)
store.updateDetectionConfig({ 
  earThreshold: 0.25,  // Défaut: 0.25
  marThreshold: 0.6,   // Défaut: 0.6
  alertCooldown: 3000  // Défaut: 3000ms
});
```

### Calibrage Personnel

| **Métrique** | **Valeur Normale** | **Somnolence** | **Critique** |
|--------------|-------------------|----------------|--------------|
| **EAR** | 0.3-0.4 | 0.15-0.25 | < 0.15 |
| **MAR** | 0.3-0.5 | 0.5-0.7 | > 0.7 |
| **Score Vigilance** | 80-100% | 40-70% | < 30% |

## 📊 Architecture du Projet

```
drowsiness-detection/
├── src/
│   ├── app/                 # Pages Next.js
│   ├── components/
│   │   ├── alerts/         # Système d'alertes
│   │   ├── camera/         # Capture caméra
│   │   ├── dashboard/      # Métriques vigilance
│   │   └── debug/          # Panel développeur
│   ├── hooks/
│   │   └── improvedDetection.ts  # Hook IA principal
│   ├── stores/
│   │   └── detectionStore.ts     # État global Zustand
│   └── types/
│       └── detection.ts          # Types TypeScript
├── docs/                   # Documentation
└── public/                 # Assets statiques
```

## 🧪 Tests et Debug

### Tests Automatisés
```bash
npm run test
```

### Debug Mode
```javascript
// Activer logs détaillés
localStorage.setItem('debug-detection', 'true');
```

### Métriques Performance
- **FPS Détection** : 15-30 fps
- **Latence** : < 100ms
- **CPU Usage** : 10-25%
- **RAM** : ~70MB

## 🤝 Contribution

### Développement Local

```bash
# Fork du repository
git clone https://github.com/YOUR_USERNAME/DrowsyGuard.git

# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Faire vos modifications
git add .
git commit -m "feat: description de la fonctionnalité"

# Pousser et créer PR
git push origin feature/nouvelle-fonctionnalite
```

### Guidelines

- **ESLint** : Code linting automatique
- **TypeScript** : Typage strict obligatoire
- **Conventional Commits** : Format de commits standardisé
- **Tests** : Couverture minimum 80%

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🔗 Liens Utiles

- **Demo Live** : [https://drowsyguard.vercel.app](https://drowsyguard.vercel.app)
- **Documentation** : [docs/](docs/)
- **Issues** : [GitHub Issues](https://github.com/flokiyf/DrowsyGuard/issues)
- **Discussions** : [GitHub Discussions](https://github.com/flokiyf/DrowsyGuard/discussions)

## 👥 Équipe

- **[@flokiyf](https://github.com/flokiyf)** - Développeur Principal
- **[Contributors](https://github.com/flokiyf/DrowsyGuard/contributors)** - Contributeurs

## 🎯 Roadmap

### Version 1.1
- [ ] Détection posture tête (pitch/yaw/roll)
- [ ] Machine Learning personnalisé
- [ ] Export données CSV/JSON
- [ ] Mode conduite optimisé

### Version 1.2
- [ ] Support mobile natif
- [ ] Intégration Cloud Analytics
- [ ] Alertes push notifications
- [ ] Multi-utilisateurs

---

**⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile !**

**🚗💤 DrowsyGuard - Votre copilote IA pour une conduite sécurisée**

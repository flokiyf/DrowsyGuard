# Guide de Déploiement Vercel

## Configuration Requise

### Variables d'environnement
```bash
NODE_ENV=production
NEXT_PUBLIC_DEBUG_MODE=false
```

### Commandes de Build
```bash
npm install
npm run build
```

### Optimisations Vercel

1. **next.config.ts** - Configuration webpack pour MediaPipe
2. **vercel.json** - Configuration spécifique Vercel
3. **Composants optimisés** - Imports dynamiques pour les modules lourds

## Résolution des Problèmes

### Erreur "Module not found"
- Vérifier les imports relatifs vs absolus
- S'assurer que tous les composants sont correctement exportés
- Vérifier la configuration des alias TypeScript

### Erreurs MediaPipe
- Les modules MediaPipe sont exclus du build serveur
- Chargement côté client uniquement
- Fallbacks configurés dans webpack

### Performance
- Images optimisées
- Lazy loading des composants
- Bundle splitting automatique

## Commandes Utiles

```bash
# Test local
npm run dev

# Build production
npm run build

# Démarrage production
npm start

# Lint
npm run lint
``` 
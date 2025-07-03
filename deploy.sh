#!/bin/bash

# Script de déploiement automatique pour Vercel
echo "🚀 Déploiement DrowsyGuard sur Vercel"

# Vérifier si nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Exécutez ce script depuis le dossier racine du projet."
    exit 1
fi

# Nettoyer les fichiers de build précédents
echo "🧹 Nettoyage des fichiers de build..."
rm -rf .next
rm -rf node_modules/.cache

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm ci --production=false

# Construire le projet
echo "🔨 Construction du projet..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi ! Le projet est prêt pour le déploiement."
    echo "📋 Étapes suivantes :"
    echo "   1. Connectez votre repo GitHub à Vercel"
    echo "   2. Configurez les variables d'environnement si nécessaire"
    echo "   3. Déployez avec 'vercel --prod'"
else
    echo "❌ Erreur lors du build. Vérifiez les logs ci-dessus."
    exit 1
fi 
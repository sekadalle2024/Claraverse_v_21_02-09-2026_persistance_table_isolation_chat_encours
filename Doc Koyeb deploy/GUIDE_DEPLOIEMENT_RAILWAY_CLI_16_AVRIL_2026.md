╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║              🚂 GUIDE COMPLET - DÉPLOIEMENT RAILWAY VIA CLI                  ║
║                           Date: 16 Avril 2026                                 ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📋 TABLE DES MATIÈRES
═══════════════════════════════════════════════════════════════════════════════

1. Pourquoi Railway Hobby à $5/mois ?
2. Installation de Railway CLI sur Windows
3. Configuration initiale
4. Déploiement du backend
5. Configuration des variables d'environnement
6. Vérification critique: Désactiver "App Sleeping"
7. Mise à jour du frontend
8. Tests post-déploiement
9. Commandes utiles
10. Dépannage


═══════════════════════════════════════════════════════════════════════════════
1️⃣ POURQUOI RAILWAY HOBBY À $5/MOIS ?
═══════════════════════════════════════════════════════════════════════════════

✅ AVANTAGES RAILWAY HOBBY
   • Prix fixe: $5/mois (prévisible)
   • Crédit inclus: $5 de ressources
   • Pas de cold start en production
   • Facturation à la seconde (CPU + RAM)
   • Votre backend (61 MB RAM) rentre dans le crédit

⚠️ PROBLÈME KOYEB STARTER
   • Sleep mode après 65 minutes d'inactivité
   • Inacceptable pour la production
   • Premier appel: 30-60 secondes de latence

💰 COÛT ESTIMÉ
   Backend actuel: ~256 MB RAM actif
   → Rentre parfaitement dans le crédit de $5
   → Pas de surcoût prévu


═══════════════════════════════════════════════════════════════════════════════
2️⃣ INSTALLATION DE RAILWAY CLI SUR WINDOWS
═══════════════════════════════════════════════════════════════════════════════

MÉTHODE 1: Installation via npm (Recommandée)

   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Vérifier que Node.js est installé                                    │
   │ node --version                                                          │
   │                                                                         │
   │ # Installer Railway CLI globalement                                    │
   │ npm install -g @railway/cli                                            │
   │                                                                         │
   │ # Vérifier l'installation                                              │
   │ railway --version                                                       │
   └─────────────────────────────────────────────────────────────────────────┘

MÉTHODE 2: Installation via Scoop (Alternative)
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Installer Scoop si pas déjà installé                                 │
   │ Set-ExecutionPolicy RemoteSigned -Scope CurrentUser                     │
   │ irm get.scoop.sh | iex                                                  │
   │                                                                         │
   │ # Installer Railway CLI                                                │
   │ scoop install railway                                                   │
   │                                                                         │
   │ # Vérifier l'installation                                              │
   │ railway --version                                                       │
   └─────────────────────────────────────────────────────────────────────────┘

MÉTHODE 3: Téléchargement direct (Windows)
   1. Aller sur: https://github.com/railwayapp/cli/releases
   2. Télécharger: railway-windows-amd64.exe
   3. Renommer en: railway.exe
   4. Placer dans: C:\Program Files\Railway\
   5. Ajouter au PATH Windows


═══════════════════════════════════════════════════════════════════════════════
3️⃣ CONFIGURATION INITIALE
═══════════════════════════════════════════════════════════════════════════════

ÉTAPE 1: Connexion à Railway
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Se connecter à Railway (ouvre le navigateur)                         │
   │ railway login                                                           │
   │                                                                         │
   │ # Vérifier la connexion                                                │
   │ railway whoami                                                          │
   └─────────────────────────────────────────────────────────────────────────┘

ÉTAPE 2: Créer un nouveau projet Railway
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Naviguer vers le dossier du backend                                  │
   │ cd py_backend                                                           │
   │                                                                         │
   │ # Initialiser un nouveau projet Railway                                │
   │ railway init                                                            │
   │                                                                         │
   │ # Suivre les instructions:                                             │
   │ # - Nom du projet: clara-backend-production                            │
   │ # - Créer un nouveau projet: Oui                                       │
   └─────────────────────────────────────────────────────────────────────────┘

   Résultat attendu:
   ✅ Project created: clara-backend-production
   ✅ Environment: production
   ✅ Service: clara-backend


═══════════════════════════════════════════════════════════════════════════════
4️⃣ DÉPLOIEMENT DU BACKEND
═══════════════════════════════════════════════════════════════════════════════

ÉTAPE 1: Vérifier les fichiers nécessaires
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Vérifier que ces fichiers existent:                                  │
   │ ls Dockerfile                                                           │
   │ ls requirements.txt                                                     │
   │ ls main.py                                                              │
   └─────────────────────────────────────────────────────────────────────────┘

ÉTAPE 2: Premier déploiement
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Déployer le backend                                                  │
   │ railway up                                                              │
   │                                                                         │
   │ # Railway va:                                                          │
   │ # 1. Détecter le Dockerfile                                            │
   │ # 2. Build l'image Docker                                              │
   │ # 3. Déployer le service                                               │
   │ # 4. Générer une URL publique                                          │
   └─────────────────────────────────────────────────────────────────────────┘

   Temps estimé: 3-5 minutes

ÉTAPE 3: Récupérer l'URL publique
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Obtenir l'URL du service                                             │
   │ railway domain                                                          │
   │                                                                         │
   │ # Exemple de sortie:                                                   │
   │ # clara-backend-production.up.railway.app                              │
   └─────────────────────────────────────────────────────────────────────────┘

   ⚠️ IMPORTANT: Notez cette URL, vous en aurez besoin pour le frontend


═══════════════════════════════════════════════════════════════════════════════
5️⃣ CONFIGURATION DES VARIABLES D'ENVIRONNEMENT
═══════════════════════════════════════════════════════════════════════════════

MÉTHODE 1: Via CLI (Recommandée)
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Définir les variables d'environnement                                │
   │ railway variables set HOST=0.0.0.0                                     │
   │ railway variables set PORT=5000                                        │
   │ railway variables set PYTHONDONTWRITEBYTECODE=1                        │
   │ railway variables set PYTHONUNBUFFERED=1                               │
   │                                                                         │
   │ # Vérifier les variables                                               │
   │ railway variables                                                       │
   └─────────────────────────────────────────────────────────────────────────┘

MÉTHODE 2: Via Dashboard Railway
   1. Aller sur: https://railway.app/dashboard
   2. Sélectionner: clara-backend-production
   3. Onglet: Variables
   4. Ajouter les variables:
      - HOST = 0.0.0.0
      - PORT = 5000
      - PYTHONDONTWRITEBYTECODE = 1
      - PYTHONUNBUFFERED = 1

MÉTHODE 3: Via fichier .env (Optionnel)
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Créer un fichier .env dans py_backend/                               │
   │ HOST=0.0.0.0                                                            │
   │ PORT=5000                                                               │
   │ PYTHONDONTWRITEBYTECODE=1                                               │
   │ PYTHONUNBUFFERED=1                                                      │
   │                                                                         │
   │ # Railway détectera automatiquement le fichier .env                    │
   └─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
6️⃣ ⚠️ VÉRIFICATION CRITIQUE: DÉSACTIVER "APP SLEEPING"
═══════════════════════════════════════════════════════════════════════════════

🚨 ÉTAPE OBLIGATOIRE POUR LA PRODUCTION 🚨

Cette étape est CRITIQUE pour garantir que votre backend reste actif 24/7
sans cold start. C'est le seul réglage à vérifier après le déploiement.

MÉTHODE 1: Via Dashboard Railway (Recommandée)
   1. Aller sur: https://railway.app/dashboard
   2. Sélectionner: clara-backend-production
   3. Onglet: Settings
   4. Section: Sleep Settings
   5. ⚠️ VÉRIFIER: "App Sleeping" est DÉSACTIVÉ (OFF)
   
   ✅ Si désactivé: Votre backend reste actif 24/7
   ❌ Si activé: Cold start après inactivité (à éviter en production)

MÉTHODE 2: Via CLI
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Vérifier les paramètres du service                                   │
   │ railway status                                                          │
   │                                                                         │
   │ # Chercher la ligne "Sleep Settings"                                   │
   │ # Doit afficher: Sleep: Disabled                                       │
   └─────────────────────────────────────────────────────────────────────────┘

📝 NOTES IMPORTANTES:
   • Par défaut, Railway Hobby désactive le sleep pour les services actifs
   • Vérifiez quand même pour être sûr
   • Si activé, désactivez-le immédiatement via le dashboard
   • Cette configuration garantit zéro cold start en production


═══════════════════════════════════════════════════════════════════════════════
7️⃣ MISE À JOUR DU FRONTEND
═══════════════════════════════════════════════════════════════════════════════

Après le déploiement, vous devez mettre à jour l'URL du backend dans le frontend.

FICHIER À MODIFIER: src/services/claraApiService.ts

AVANT (Koyeb):
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ private readonly n8nDefaultEndpoint =                                   │
   │   "https://hkj0631c.rpcl.app/webhook/template";                        │
   └─────────────────────────────────────────────────────────────────────────┘

APRÈS (Railway):
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ private readonly n8nDefaultEndpoint =                                   │
   │   "https://clara-backend-production.up.railway.app/webhook/template";  │
   └─────────────────────────────────────────────────────────────────────────┘

⚠️ IMPORTANT: Remplacez "clara-backend-production.up.railway.app" par votre URL Railway réelle

AUTRES ENDPOINTS À VÉRIFIER:
   Cherchez toutes les occurrences de "hkj0631c.rpcl.app" dans le fichier
   et remplacez-les par votre nouvelle URL Railway.

   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Rechercher toutes les occurrences                                    │
   │ grep -r "hkj0631c.rpcl.app" src/                                       │
   │                                                                         │
   │ # Remplacer automatiquement (PowerShell)                               │
   │ $oldUrl = "hkj0631c.rpcl.app"                                          │
   │ $newUrl = "clara-backend-production.up.railway.app"                    │
   │ (Get-Content src/services/claraApiService.ts) -replace $oldUrl, $newUrl │
   │   | Set-Content src/services/claraApiService.ts                        │
   └─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
8️⃣ TESTS POST-DÉPLOIEMENT
═══════════════════════════════════════════════════════════════════════════════

TEST 1: Vérifier que le service est actif
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Vérifier le statut                                                   │
   │ railway status                                                          │
   │                                                                         │
   │ # Doit afficher:                                                       │
   │ # Status: Running                                                      │
   │ # Health: Healthy                                                      │
   └─────────────────────────────────────────────────────────────────────────┘

TEST 2: Tester l'endpoint /health
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Via curl                                                             │
   │ curl https://clara-backend-production.up.railway.app/health            │
   │                                                                         │
   │ # Via PowerShell                                                       │
   │ Invoke-WebRequest -Uri "https://clara-backend-production.up.railway.app/health" │
   │                                                                         │
   │ # Réponse attendue:                                                    │
   │ # {"status": "healthy"}                                                │
   └─────────────────────────────────────────────────────────────────────────┘

TEST 3: Voir les logs en temps réel
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Suivre les logs                                                      │
   │ railway logs --follow                                                   │
   │                                                                         │
   │ # Logs de déploiement uniquement                                       │
   │ railway logs --deployment                                               │
   └─────────────────────────────────────────────────────────────────────────┘

TEST 4: Tester un endpoint API
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Tester l'endpoint principal                                          │
   │ curl -X POST https://clara-backend-production.up.railway.app/webhook/template \
   │   -H "Content-Type: application/json" \                                │
   │   -d '{"question": "Test de connexion"}'                               │
   └─────────────────────────────────────────────────────────────────────────┘

TEST 5: Vérifier les métriques
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Via Dashboard Railway                                                │
   │ # 1. Aller sur: https://railway.app/dashboard                          │
   │ # 2. Sélectionner: clara-backend-production                            │
   │ # 3. Onglet: Metrics                                                   │
   │ #                                                                       │
   │ # Vérifier:                                                            │
   │ # - CPU Usage: < 50%                                                   │
   │ # - Memory Usage: ~256 MB                                              │
   │ # - Response Time: < 1s                                                │
   └─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
9️⃣ COMMANDES UTILES
═══════════════════════════════════════════════════════════════════════════════

GESTION DU SERVICE
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Voir le statut                                                       │
   │ railway status                                                          │
   │                                                                         │
   │ # Redéployer                                                           │
   │ railway up                                                              │
   │                                                                         │
   │ # Redéployer avec force rebuild                                        │
   │ railway up --detach                                                     │
   │                                                                         │
   │ # Ouvrir le dashboard                                                  │
   │ railway open                                                            │
   └─────────────────────────────────────────────────────────────────────────┘

LOGS ET DEBUGGING
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Voir les logs en temps réel                                          │
   │ railway logs --follow                                                   │
   │                                                                         │
   │ # Voir les 100 dernières lignes                                        │
   │ railway logs --tail 100                                                 │
   │                                                                         │
   │ # Logs de build uniquement                                             │
   │ railway logs --deployment                                               │
   └─────────────────────────────────────────────────────────────────────────┘

VARIABLES D'ENVIRONNEMENT
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Lister toutes les variables                                          │
   │ railway variables                                                       │
   │                                                                         │
   │ # Définir une variable                                                 │
   │ railway variables set KEY=VALUE                                         │
   │                                                                         │
   │ # Supprimer une variable                                               │
   │ railway variables delete KEY                                            │
   └─────────────────────────────────────────────────────────────────────────┘

DOMAINE ET URL
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Voir l'URL actuelle                                                  │
   │ railway domain                                                          │
   │                                                                         │
   │ # Ajouter un domaine personnalisé                                      │
   │ railway domain add mon-domaine.com                                      │
   └─────────────────────────────────────────────────────────────────────────┘

INFORMATIONS PROJET
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Voir les infos du projet                                             │
   │ railway status                                                          │
   │                                                                         │
   │ # Voir qui est connecté                                                │
   │ railway whoami                                                          │
   │                                                                         │
   │ # Lister tous les projets                                              │
   │ railway list                                                            │
   └─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
🔟 DÉPANNAGE
═══════════════════════════════════════════════════════════════════════════════

PROBLÈME 1: Le déploiement échoue
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Vérifier les logs de build                                           │
   │ railway logs --deployment                                               │
   │                                                                         │
   │ # Vérifier le Dockerfile localement                                    │
   │ docker build -t test-backend .                                          │
   │ docker run -p 5000:5000 test-backend                                    │
   └─────────────────────────────────────────────────────────────────────────┘

PROBLÈME 2: Le service ne démarre pas
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Vérifier les logs d'exécution                                        │
   │ railway logs --follow                                                   │
   │                                                                         │
   │ # Vérifier les variables d'environnement                               │
   │ railway variables                                                       │
   │                                                                         │
   │ # Vérifier que PORT=5000 est bien défini                               │
   └─────────────────────────────────────────────────────────────────────────┘

PROBLÈME 3: Erreur 502 Bad Gateway
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Le service n'écoute pas sur le bon port                              │
   │ # Vérifier que HOST=0.0.0.0 et PORT=5000                               │
   │ railway variables set HOST=0.0.0.0                                     │
   │ railway variables set PORT=5000                                        │
   │                                                                         │
   │ # Redéployer                                                           │
   │ railway up                                                              │
   └─────────────────────────────────────────────────────────────────────────┘

PROBLÈME 4: Dépassement du crédit $5
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Vérifier l'utilisation des ressources                                │
   │ # Dashboard → Metrics                                                  │
   │                                                                         │
   │ # Si dépassement:                                                      │
   │ # 1. Vérifier les logs pour des boucles infinies                       │
   │ # 2. Optimiser le code                                                 │
   │ # 3. Réduire la taille de l'instance si possible                       │
   └─────────────────────────────────────────────────────────────────────────┘

PROBLÈME 5: Cold start malgré Railway
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ # Vérifier que "App Sleeping" est désactivé                            │
   │ # Dashboard → Settings → Sleep Settings                                │
   │                                                                         │
   │ # Doit être: OFF (désactivé)                                           │
   └─────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
📞 SUPPORT ET RESSOURCES
═══════════════════════════════════════════════════════════════════════════════

Documentation Railway:
   https://docs.railway.app/

Railway CLI Reference:
   https://docs.railway.app/develop/cli

Dashboard Railway:
   https://railway.app/dashboard

Support Railway:
   https://railway.app/help

Community Discord:
   https://discord.gg/railway


═══════════════════════════════════════════════════════════════════════════════
✅ CHECKLIST FINALE
═══════════════════════════════════════════════════════════════════════════════

Avant de considérer le déploiement comme terminé, vérifiez:

□ Railway CLI installé et fonctionnel
□ Connexion à Railway réussie (railway whoami)
□ Projet créé (railway init)
□ Backend déployé (railway up)
□ URL publique récupérée (railway domain)
□ Variables d'environnement configurées
□ ⚠️ "App Sleeping" DÉSACTIVÉ (CRITIQUE)
□ Frontend mis à jour avec la nouvelle URL
□ Endpoint /health répond correctement
□ Logs montrent un démarrage réussi
□ Métriques dans les limites du crédit $5
□ Tests API fonctionnels

🎉 Si tous les points sont cochés, votre backend est en production sur Railway !


═══════════════════════════════════════════════════════════════════════════════
📝 NOTES FINALES
═══════════════════════════════════════════════════════════════════════════════

• Railway Hobby est parfait pour votre backend (~256 MB RAM)
• Le crédit de $5/mois devrait suffire largement
• Pas de cold start = expérience utilisateur optimale
• Facturation à la seconde = coût optimisé
• Monitoring en temps réel via le dashboard

Bon déploiement ! 🚀

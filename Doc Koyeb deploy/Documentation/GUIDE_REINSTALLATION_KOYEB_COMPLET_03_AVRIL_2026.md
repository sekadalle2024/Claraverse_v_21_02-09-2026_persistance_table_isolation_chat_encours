# Guide Complet : Réinstallation CLI Koyeb et Mise à Jour Backend

**Date:** 3 Avril 2026  
**Contexte:** Restauration après dommages système

---

## 📋 Table des Matières

1. [Situation Actuelle](#situation-actuelle)
2. [Étape 1 : Réinstallation CLI Koyeb](#étape-1--réinstallation-cli-koyeb)
3. [Étape 2 : Configuration et Authentification](#étape-2--configuration-et-authentification)
4. [Étape 3 : Vérification du Déploiement Existant](#étape-3--vérification-du-déploiement-existant)
5. [Étape 4 : Mise à Jour du Backend](#étape-4--mise-à-jour-du-backend)
6. [Vérification Finale](#vérification-finale)
7. [Dépannage](#dépannage)

---

## Situation Actuelle

Suite aux dommages système, nous avons :
- ✅ Projet restauré depuis Github
- ✅ Configuration Koyeb existante (paramètres conservés)
- ❌ CLI Koyeb non installée
- ❌ Backend Python nécessite mise à jour

---

## Étape 1 : Réinstallation CLI Koyeb

### Option A : Installation via Script PowerShell (Recommandé)

```powershell
# Exécuter le script d'installation
.\install-koyeb-cli.ps1
```

### Option B : Installation Manuelle

```bash
# Télécharger et installer
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh
```

### Ajouter au PATH

Ajouter à votre profil shell (`.bashrc` ou `.zshrc`) :

```bash
export PATH=$HOME/.koyeb/bin:$PATH
```

Puis recharger :

```bash
source ~/.bashrc
# ou
source ~/.zshrc
```

### Vérification de l'Installation

```bash
koyeb version
```

**Résultat attendu :**
```
koyeb version X.X.X
```

---

## Étape 2 : Configuration et Authentification

### Se Connecter à Koyeb

```bash
koyeb login
```

Cela ouvrira votre navigateur pour l'authentification.

### Vérifier la Connexion

```bash
koyeb app list
```

Vous devriez voir vos applications existantes, notamment `clara-backend`.

---

## Étape 3 : Vérification du Déploiement Existant

### Lister les Services

```bash
koyeb service list
```

### Vérifier le Service Backend

```bash
koyeb service get clara-backend/clara-service
```

### Voir les Logs Actuels

```bash
# Logs de déploiement
koyeb service logs clara-backend/clara-service

# Logs de build
koyeb service logs clara-backend/clara-service --type build
```

---

## Étape 4 : Mise à Jour du Backend

### Méthode 1 : Déploiement Direct (Recommandé)

```bash
# Se positionner dans le dossier backend
cd py_backend

# Déployer avec Docker
koyeb deploy . clara-backend/clara-service \
  --archive-builder docker \
  --archive-docker-dockerfile Dockerfile \
  --type WEB \
  --ports 5000:http \
  --routes /:5000 \
  --regions fra \
  --instance-type small \
  --min-scale 1 \
  --max-scale 2
```

### Méthode 2 : Utiliser le Script Automatisé

```powershell
# Depuis la racine du projet
.\deploy-koyeb.ps1 dev
```

### Avec Variables d'Environnement (Si Nécessaire)

```bash
cd py_backend

koyeb deploy . clara-backend/clara-service \
  --archive-builder docker \
  --env HOST=0.0.0.0 \
  --env PORT=5000 \
  --env PYTHONUNBUFFERED=1
```

---

## Vérification Finale

### 1. Vérifier le Statut du Service

```bash
koyeb service get clara-backend/clara-service
```

**Vérifier :**
- Status: `HEALTHY`
- Replicas: Running

### 2. Tester le Health Check

```bash
# Récupérer l'URL du service
koyeb service get clara-backend/clara-service

# Tester (remplacer par votre URL)
curl https://clara-backend-[your-org].koyeb.app/health
```

**Réponse attendue :**
```json
{
  "status": "healthy",
  "port": 5000,
  "uptime": "..."
}
```

### 3. Tester l'API Documentation

Ouvrir dans le navigateur :
```
https://clara-backend-[your-org].koyeb.app/docs
```

### 4. Vérifier les Logs

```bash
# Logs en temps réel
koyeb service logs clara-backend/clara-service --follow

# Dernières 100 lignes
koyeb service logs clara-backend/clara-service --lines 100
```

---

## Dépannage

### Problème : CLI Non Trouvée Après Installation

**Solution :**
```bash
# Vérifier l'emplacement
ls -la ~/.koyeb/bin/

# Ajouter manuellement au PATH
export PATH=$HOME/.koyeb/bin:$PATH

# Rendre permanent
echo 'export PATH=$HOME/.koyeb/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Problème : Erreur d'Authentification

**Solution :**
```bash
# Se déconnecter
koyeb logout

# Se reconnecter
koyeb login
```

### Problème : Service Ne Démarre Pas

**Solution :**
```bash
# Vérifier les logs de build
koyeb service logs clara-backend/clara-service --type build

# Vérifier les logs d'exécution
koyeb service logs clara-backend/clara-service

# Redéployer si nécessaire
koyeb service redeploy clara-backend/clara-service
```

### Problème : Build Timeout

**Solution :**
Le build peut prendre 5-10 minutes (installation de spaCy, etc.). Attendre patiemment.

### Problème : Port Incorrect

**Solution :**
```bash
koyeb service update clara-backend/clara-service \
  --ports 5000:http \
  --routes /:5000
```

### Problème : Mémoire Insuffisante

**Solution :**
```bash
# Augmenter la taille de l'instance
koyeb service update clara-backend/clara-service \
  --instance-type medium
```

---

## Commandes Utiles

### Gestion du Service

```bash
# Statut
koyeb service get clara-backend/clara-service

# Logs
koyeb service logs clara-backend/clara-service

# Redémarrer
koyeb service redeploy clara-backend/clara-service

# Mettre à jour
cd py_backend
koyeb deploy . clara-backend/clara-service

# Supprimer (ATTENTION!)
koyeb service delete clara-backend/clara-service
```

### Gestion des Variables d'Environnement

```bash
# Ajouter/Modifier une variable
koyeb service update clara-backend/clara-service \
  --env NEW_VAR=value

# Lister les variables
koyeb service get clara-backend/clara-service
```

### Scaling

```bash
# Ajuster le scaling
koyeb service update clara-backend/clara-service \
  --min-scale 2 \
  --max-scale 4
```

---

## Checklist de Validation

- [ ] CLI Koyeb installée et dans le PATH
- [ ] Authentification réussie (`koyeb app list` fonctionne)
- [ ] Service backend visible (`koyeb service get clara-backend/clara-service`)
- [ ] Déploiement mis à jour avec succès
- [ ] Health check répond correctement
- [ ] API docs accessible (`/docs`)
- [ ] Logs ne montrent pas d'erreurs critiques
- [ ] Tous les endpoints fonctionnent

---

## Prochaines Étapes

Une fois le backend déployé avec succès :

1. Tester les endpoints principaux
2. Vérifier l'intégration avec le frontend
3. Monitorer les performances
4. Configurer les alertes si nécessaire

---

## Ressources

- [Documentation Koyeb CLI](https://www.koyeb.com/docs/build-and-deploy/cli/reference)
- [Guide de déploiement](https://www.koyeb.com/docs/build-and-deploy/deploy-with-git)
- [Dashboard Koyeb](https://app.koyeb.com)
- Fichier local : `py_backend/README_KOYEB.md`
- Fichier local : `GUIDE_DEPLOIEMENT_KOYEB.md`

---

## Notes Importantes

- Le Dockerfile est déjà optimisé pour Koyeb
- Les dépendances Python sont installées automatiquement
- Le modèle spaCy est téléchargé pendant le build
- Le port 5000 est exposé par défaut
- L'instance `nano` est gratuite mais limitée
- Pour la production, utiliser au minimum `small`

---

**Dernière mise à jour :** 3 Avril 2026

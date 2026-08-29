# Guide Rapide - Sauvegarde Backend Python

## 🚀 Sauvegarde en 2 Étapes

### Étape 1: Vérifier
```powershell
.\verifier-backend-rapide.ps1
```

### Étape 2: Sauvegarder
```powershell
.\push-backend-github-v10.ps1
```

C'est tout ! 🎉

---

## 📦 Repository Backend

**URL**: https://github.com/sekadalle2024/Back-end-python-V0_03_03_2026.git

**Contenu**: Dossier `py_backend/` uniquement

---

## ✅ Ce Qui Est Automatique

- ✓ Ajout des fichiers du backend
- ✓ Création du commit avec date/heure
- ✓ Changement temporaire du remote
- ✓ Push vers GitHub
- ✓ Restauration du remote original

---

## ⚠️ Points d'Attention

1. **Confirmation requise**: Le script demande confirmation avant le push --force
2. **Remote restauré**: Le remote est automatiquement restauré après le push
3. **Seul py_backend/**: Seul le dossier backend est sauvegardé

---

## 🔍 Vérifications Automatiques

Le script vérifie:
- ✓ Existence du dossier py_backend
- ✓ Nombre de fichiers
- ✓ Taille du dossier
- ✓ État Git
- ✓ Remote actuel
- ✓ Branche active

---

## 📊 Informations Affichées

- Nombre de fichiers: ~348
- Taille: ~61 MB
- Branche: master
- Remote: Automatiquement géré

---

## 🛡️ Sécurité

- Sauvegarde du remote avant modification
- Confirmation utilisateur avant push --force
- Restauration automatique du remote
- Messages de progression à chaque étape

---

## 📝 Format du Commit

```
Sauvegarde Backend Python - V10 - JJ_MM_AAAA_HH_MM
```

Exemple: `Sauvegarde Backend Python - V10 - 19_04_2026_21_17`

---

## 🔄 Fréquence Recommandée

- Après modifications importantes
- Avant déploiement
- Fin de journée de travail
- Avant tests majeurs

---

## 📚 Documentation Complète

Pour plus de détails, consultez:
- `Doc backend github/Documentation/PRECAUTIONS_IMPORTANTES.md`
- `Doc backend github/Documentation/GUIDE_UTILISATION_QUOTIDIENNE.md`
- `Doc backend github/Documentation/TROUBLESHOOTING.md`

---

## 🆘 En Cas de Problème

### Remote non restauré
```powershell
git remote set-url origin https://github.com/sekadalle2024/Claverse_windows__v_9_19-04-2026_V5-Export_CAC-V0-Public.git
```

### Vérifier le remote
```powershell
git remote -v
```

### Script de restauration
```powershell
.\Doc backend github\Scripts\restaurer-remote-original.ps1
```

---

## ✨ Avantages

- ✅ Rapide (2 commandes)
- ✅ Sûr (confirmations et restaurations)
- ✅ Automatique (pas de manipulation Git manuelle)
- ✅ Traçable (commits avec date/heure)
- ✅ Séparé (backend indépendant du projet principal)

---

**Dernière mise à jour**: 19 avril 2026
**Version**: V10

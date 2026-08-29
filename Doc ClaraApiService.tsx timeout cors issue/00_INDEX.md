# 📑 Index - Documentation Timeout et CORS ClaraAPI

**Date:** 15 avril 2026

---

## 🎯 Vue d'ensemble

Cette documentation analyse et résout les problèmes de timeout et CORS rencontrés lors des requêtes vers n8n depuis le frontend Claraverse.

---

## 📚 Fichiers de Documentation

### 1. 00_LIRE_EN_PREMIER.txt
**Type:** Introduction  
**Contenu:**
- Résumé exécutif du problème
- Analyse des timeouts multiples
- Pourquoi l'erreur après 3 minutes
- Solutions recommandées
- Diagnostic recommandé

**Lire en premier:** ✅ Oui

---

### 2. ANALYSE_TIMEOUTS_MULTIPLES.md
**Type:** Analyse technique  
**Contenu:**
- Timeout principal (10 minutes)
- Timeouts secondaires (30 secondes)
- Timeouts externes (navigateur, n8n, proxy)
- Tableau récapitulatif
- Conclusion

**Pour qui:** Développeurs

---

### 3. DIAGNOSTIC_ERREUR_3_MINUTES.md
**Type:** Guide de diagnostic  
**Contenu:**
- Étape 1: Tester avec curl
- Étape 2: Vérifier les logs n8n
- Étape 3: Vérifier les headers CORS
- Étape 4: Vérifier le timeout du navigateur
- Étape 5: Vérifier les proxies/load balancers
- Script de diagnostic automatique

**Pour qui:** DevOps, Développeurs

---

### 4. SOLUTIONS_RECOMMANDEES.md
**Type:** Guide de solutions  
**Contenu:**
- Solution 1: Augmenter le timeout dans n8n
- Solution 2: Système de polling (recommandé)
- Solution 3: Webhooks asynchrones avec WebSocket
- Comparaison des solutions
- Recommandation finale

**Pour qui:** Développeurs, Architectes

---

### 5. CONFIGURATION_N8N_CORS.md
**Type:** Guide de configuration  
**Contenu:**
- Problème CORS
- Configuration des headers CORS
- Gestion des requêtes OPTIONS
- Tests de configuration
- Configuration sécurisée
- Erreurs courantes
- Script de test automatique

**Pour qui:** DevOps, Développeurs

---

### 6. 00_INDEX.md
**Type:** Navigation  
**Contenu:** Ce fichier (index de la documentation)

---

### 7. README.md
**Type:** Introduction  
**Contenu:** Vue d'ensemble et guide de démarrage rapide

---

## 🚀 Parcours de Lecture Recommandé

### Pour une compréhension rapide (10 minutes)

1. **00_LIRE_EN_PREMIER.txt**
   - Comprendre le problème
   - Identifier les causes possibles

2. **SOLUTIONS_RECOMMANDEES.md** (section "Recommandation Finale")
   - Voir la solution recommandée

---

### Pour un diagnostic complet (30 minutes)

1. **00_LIRE_EN_PREMIER.txt**
   - Vue d'ensemble

2. **ANALYSE_TIMEOUTS_MULTIPLES.md**
   - Comprendre tous les timeouts

3. **DIAGNOSTIC_ERREUR_3_MINUTES.md**
   - Suivre le guide de diagnostic étape par étape

4. **CONFIGURATION_N8N_CORS.md**
   - Vérifier la configuration CORS

---

### Pour implémenter la solution (1-2 heures)

1. **SOLUTIONS_RECOMMANDEES.md**
   - Lire toutes les solutions
   - Choisir la solution adaptée

2. **CONFIGURATION_N8N_CORS.md**
   - Configurer CORS correctement

3. **Implémenter la solution choisie**
   - Suivre les exemples de code

---

## 🎯 Problème et Solution

### Problème

```
❌ Timeout configuré: 10 minutes
❌ Erreur observée: après ~3 minutes
❌ Message: "Failed to fetch" ou "Network error"
```

### Causes Possibles

1. ⚠️ Timeout du navigateur (60-300 secondes)
2. ⚠️ Timeout du serveur n8n
3. ⚠️ Timeout d'un proxy/load balancer
4. ⚠️ Problème de configuration CORS

### Solution Recommandée

**Système de Polling** (voir SOLUTIONS_RECOMMANDEES.md)

```
Frontend → POST /start → n8n (retourne taskId)
Frontend → GET /task/:id → n8n (toutes les 5 secondes)
Frontend ← Résultat ← n8n (quand terminé)
```

**Avantages:**
- ✅ Pas de timeout
- ✅ Barre de progression
- ✅ Meilleure UX
- ✅ Robuste

---

## 📊 Fichiers par Objectif

### Comprendre le problème
- 00_LIRE_EN_PREMIER.txt
- ANALYSE_TIMEOUTS_MULTIPLES.md

### Diagnostiquer
- DIAGNOSTIC_ERREUR_3_MINUTES.md
- CONFIGURATION_N8N_CORS.md (section "Tester")

### Résoudre
- SOLUTIONS_RECOMMANDEES.md
- CONFIGURATION_N8N_CORS.md

---

## 🔧 Scripts Utiles

### Test CORS
```powershell
./test-cors-n8n.ps1
```
Voir: CONFIGURATION_N8N_CORS.md

### Diagnostic Timeout
```powershell
./test-timeout-diagnostic.ps1
```
Voir: DIAGNOSTIC_ERREUR_3_MINUTES.md

---

## 📞 Support

**En cas de problème:**
1. Lire 00_LIRE_EN_PREMIER.txt
2. Suivre DIAGNOSTIC_ERREUR_3_MINUTES.md
3. Vérifier CONFIGURATION_N8N_CORS.md
4. Contacter l'éditeur: +225 05 44 13 07 98

---

## ✅ Checklist de Résolution

- [ ] Lire 00_LIRE_EN_PREMIER.txt
- [ ] Identifier la cause (diagnostic)
- [ ] Vérifier la configuration CORS
- [ ] Tester avec curl
- [ ] Vérifier les logs n8n
- [ ] Implémenter la solution choisie
- [ ] Tester la solution
- [ ] Documenter les changements

---

## 📝 Historique

| Date | Action | Fichier |
|------|--------|---------|
| 15/04/2026 | Création de la documentation | Tous |
| 15/04/2026 | Timeout maintenu à 10 minutes | claraApiService.ts |
| 15/04/2026 | Message de notification ajouté | claraApiService.ts |

---

**Dernière mise à jour:** 15 avril 2026

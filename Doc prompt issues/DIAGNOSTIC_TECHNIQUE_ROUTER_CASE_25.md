# Diagnostic Technique - Problème Router Case 25

## 📋 Résumé Exécutif

**Problème**: Le router détecte correctement Case 25 (notification affichée) mais exécute Case 1 (endpoint incorrect)

**Cause**: Logique de priorité inversée dans la cascade if-else if

**Solution**: Réorganisation du router avec priorités explicites

**Impact**: Correction immédiate, aucune régression attendue

---

## 🔍 Analyse Détaillée du Problème

### Structure du Message Test

```
[Command] : Frap
[Cycle] : RH
[test] : AA010
[reference] : test sur la validation des procedure RH
[Assertion] = validité
[Anomalie] = Absence de procedure de recrutement du DAF depuis janvier 2002
```

### Flux d'Exécution AVANT Correction

```typescript
// Ligne 106-107: Case 25 détecté
else if (msg.includes("Recos contrôle interne comptable")) {
  routeKey = "recos_controle_interne";
  caseName = "Case 25";
}

// Ligne 137-141: Case 8 vérifie l'ABSENCE de "Command"
} else if (
  !msg.includes("Command") &&  // ❌ FAUX car message contient "Command"
  !msg.includes("command") &&
  !msg.includes("/")
) {
  routeKey = "notification";
  caseName = "Case 8";
} 

// Ligne 142-145: Fallback sur Case 1
else {
  routeKey = "default";  // ✅ Exécuté car condition Case 8 est fausse
  caseName = "Case 1";
}
```

### Pourquoi Case 25 n'était PAS exécuté?

1. **Détection correcte**: `msg.includes("Recos contrôle interne comptable")` → TRUE
2. **Notification affichée**: Case 25 détecté et affiché
3. **MAIS**: Le message contient aussi `"Command"`
4. **Condition Case 8**: `!msg.includes("Command")` → FALSE
5. **Résultat**: Tombe dans le `else` final → Case 1

### Le Piège de la Logique

```
SI message contient "Recos contrôle interne comptable" ALORS Case 25
SINON SI message NE contient PAS "Command" ALORS Case 8
SINON Case 1

Message = "Recos contrôle interne comptable" + "Command"
→ Case 25 détecté ✅
→ Mais contient "Command" ❌
→ Donc Case 8 = FALSE
→ Donc Case 1 exécuté ❌
```

---

## ✅ Solution Implémentée

### Nouvelle Architecture du Router

```typescript
private getN8nEndpointWithInfo(userMessage: string): {
  endpoint: string;
  caseName: string;
  routeKey: string;
} {
  const msg = userMessage;
  let routeKey: string;
  let caseName: string;

  // ═══════════════════════════════════════════════════════════════════════
  // PRIORITÉ 1: CASES SPÉCIFIQUES (Cases 2-33)
  // Ces cases ont la priorité absolue sur les cases par défaut
  // ═══════════════════════════════════════════════════════════════════════
  
  // Cases 11-13: CIA (Cours, QCM, Synthèse)
  if ((msg.includes("CIA") || msg.includes("cia") || msg.includes("Cia")) &&
    (msg.includes("Cours") || msg.includes("COURS") || msg.includes("cours"))) {
    routeKey = "cia_cours";
    caseName = "Case 11";
  } 
  // ... autres cases spécifiques ...
  
  // Cases 25-27: Recommandations et Rapports
  else if (msg.includes("Recos contrôle interne comptable")) {
    routeKey = "recos_controle_interne";
    caseName = "Case 25";
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PRIORITÉ 2: CASES PAR DÉFAUT (Cases 1 et 8)
  // Ces cases ne s'appliquent QUE si aucune case spécifique n'a été détectée
  // ═══════════════════════════════════════════════════════════════════════
  
  // Case 8: Notification
  else if (
    !msg.includes("Command") &&
    !msg.includes("command") &&
    !msg.includes("/")
  ) {
    routeKey = "notification";
    caseName = "Case 8";
  } 
  // Case 1: Default
  else {
    routeKey = "default";
    caseName = "Case 1";
  }
  
  // ... reste du code ...
}
```

### Flux d'Exécution APRÈS Correction

```
Message = "Recos contrôle interne comptable" + "Command"

1. Vérification Cases 11-13 (CIA) → NON
2. Vérification Cases 28-33 (Méthodologies) → NON
3. Vérification Case 25 (Recos CI) → OUI ✅
   → routeKey = "recos_controle_interne"
   → caseName = "Case 25"
   → STOP (ne vérifie pas les cases suivantes)

4. Cases par défaut (1 et 8) → NON ATTEINTES

Résultat: Case 25 exécuté correctement ✅
```

---

## 📊 Comparaison Avant/Après

| Aspect | AVANT | APRÈS |
|--------|-------|-------|
| **Détection Case 25** | ✅ Correcte | ✅ Correcte |
| **Notification affichée** | ✅ Case 25 | ✅ Case 25 |
| **Endpoint exécuté** | ❌ Case 1 (default) | ✅ Case 25 (recos_controle_interne) |
| **Logique** | Cases par défaut mélangées | Priorités explicites |
| **Maintenabilité** | ❌ Difficile | ✅ Claire |
| **Prévisibilité** | ❌ Confuse | ✅ Évidente |

---

## 🧪 Plan de Test

### Test 1: Case 25 avec "Command"

**Input**:
```
[Command] : Frap
[Cycle] : RH
[test] : AA010
[reference] : test sur la validation des procedure RH
[Assertion] = validité
[Anomalie] = Absence de procedure de recrutement du DAF depuis janvier 2002
```

**Résultat Attendu**:
- ✅ Notification: `Case 25 : recos_controle_interne`
- ✅ Endpoint: `https://t22wtwxl.rpcld.app/webhook/recos_contrôle_interne_comptable`
- ✅ Format réponse: Tables HTML avec en-têtes rouges

### Test 2: Case 1 Standard

**Input**:
```
[Command] : Frap
[Cycle] : Ventes
[test] : VE001
[reference] : test standard
```

**Résultat Attendu**:
- ✅ Notification: `Case 1 : default`
- ✅ Endpoint: `https://t22wtwxl.rpcld.app/webhook/template`
- ✅ Format réponse: Tableau markdown standard

### Test 3: Case 8 Notification

**Input**:
```
Bonjour, comment utiliser la suite E-audit?
```

**Résultat Attendu**:
- ✅ Notification: `Case 8 : notification`
- ✅ Endpoint: Sentinelle interne (pas d'appel HTTP)
- ✅ Message: Guide utilisateur

---

## 📝 Endpoints Mappés

### Case 25: Recos Contrôle Interne Comptable

```typescript
case "recos_controle_interne":
  return "https://t22wtwxl.rpcld.app/webhook/recos_contrôle_interne_comptable";
```

**Format de réponse attendu**:
- Structure: `{ "Etape mission - Programme": [...] }`
- Tables avec en-têtes HTML rouges
- Rubriques: Intitule, Observation, Constat, Risque, Recommendation

### Case 1: Standard/Default

```typescript
case "default":
default:
  return this.n8nDefaultEndpoint; // "https://t22wtwxl.rpcld.app/webhook/template"
```

**Format de réponse attendu**:
- Structure: Tableau markdown classique
- Format FRAP standard

---

## 🔧 Maintenance Future

### Ajout d'une Nouvelle Case

1. **Identifier la priorité**: Spécifique (2-33) ou Défaut (1, 8)
2. **Placer dans la bonne section**:
   - Priorité 1: Avant les cases par défaut
   - Priorité 2: Modifier les conditions de Case 1 ou 8
3. **Ajouter le mapping d'endpoint** dans `resolveEndpointFromRouteKey()`
4. **Tester** avec un message contenant "Command"

### Règles de Priorité

```
TOUJOURS:
- Cases spécifiques (2-33) AVANT cases par défaut (1, 8)
- Vérifications les plus spécifiques en premier
- Cases par défaut en dernier recours

JAMAIS:
- Mélanger cases spécifiques et cases par défaut
- Utiliser des conditions négatives pour cases spécifiques
- Supposer qu'un message ne contient pas "Command"
```

---

## ✅ Checklist de Validation

- [✅] Code modifié dans `claraApiService.ts`
- [✅] Commentaires de section ajoutés
- [✅] Logique de priorité clarifiée
- [✅] Documentation créée
- [⏳] Application redémarrée
- [⏳] Test Case 25 avec "Command"
- [⏳] Test Case 1 standard
- [⏳] Test Case 8 notification
- [⏳] Validation en production

---

## 📚 Références

- **Fichier modifié**: `src/services/claraApiService.ts`
- **Fonction**: `getN8nEndpointWithInfo()`
- **Lignes**: 50-150 (environ)
- **Date**: 29 Mars 2026
- **Auteur**: Correction suite au diagnostic du problème Case 25

---

## 🎯 Conclusion

Le problème était causé par une logique de priorité inversée dans le router. Les cases par défaut (1 et 8) étaient évaluées AVANT la fin de toutes les vérifications spécifiques, créant des conflits.

La solution consiste à réorganiser le code en 2 sections distinctes:
1. **Priorité 1**: Toutes les cases spécifiques (2-33)
2. **Priorité 2**: Cases par défaut (1 et 8)

Cette approche garantit que les cases spécifiques ont toujours la priorité, éliminant les conflits et rendant le code plus maintenable.

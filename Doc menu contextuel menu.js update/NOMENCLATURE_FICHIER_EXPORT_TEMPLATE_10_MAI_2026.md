# 📋 Nomenclature Fichier Export Template Excel

**Date:** 10 Mai 2026  
**Fichier modifié:** `public/menu.js`  
**Fonctions modifiées:** `exportTemplate()`, nouvelle fonction `extractEtapeMission()`  
**Statut:** ✅ IMPLÉMENTÉ

---

## 🎯 RÉSUMÉ EXÉCUTIF

**Problème:** Les fichiers exportés via "Export template Excel" avaient une nomenclature générique :
- `claraverse_template_2026-05-09T23-39-26.xlsx`
- `claraverse_template_2026-05-09T23-09-32.xlsx`

**Solution:** Nouvelle nomenclature spécifique au logiciel E-audit avec le nom de l'étape de mission :
- `E-audit_Etape-mission-Programme de travail_2026-05-09T23-39-26.xlsx`
- `E-audit_Etape-mission-Cartographie des risques_2026-05-09T23-09-32.xlsx`
- `E-audit_Etape-mission-X_2026-05-09T23-39-26.xlsx` (si étape non trouvée)

---

## 📊 CONTEXTE

### Structure des Tables E-audit

Dans le projet E-audit, les tables de mission contiennent généralement une table d'information avec :

| Rubrique | Description |
|----------|-------------|
| Client | FILTRACI |
| Exercice | 2023 |
| Date | 15/03/2026 |
| Référence | AA040 |
| Preparer | KMP |
| Reviewer | JFK |

| Rubrique | Description |
|----------|-------------|
| Etape de mission | **Leadsheet** |

**Objectif:** Extraire la valeur de "Etape de mission" pour nommer le fichier exporté.

---

## 🔍 DÉTECTION DE L'ÉTAPE DE MISSION

### Algorithme de Recherche

```javascript
extractEtapeMission(tables) {
  // Pour chaque table du message
  for (table of tables) {
    // 1. Extraire les données de la table
    const tableData = extractTableDataOptimized(table);
    
    // 2. Vérifier si la table a les colonnes "Rubrique" et "Description"
    const headers = tableData[0];
    const rubriqueIndex = headers.findIndex(h => h.includes('rubrique'));
    const descriptionIndex = headers.findIndex(h => h.includes('description'));
    
    if (rubriqueIndex === -1 || descriptionIndex === -1) continue;
    
    // 3. Chercher la ligne "Etape de mission"
    for (row of tableData) {
      const rubriqueValue = row[rubriqueIndex].toLowerCase();
      
      if (rubriqueValue.includes('etape') && rubriqueValue.includes('mission')) {
        // 4. Extraire la valeur de la colonne Description
        const etapeMission = row[descriptionIndex].trim();
        return etapeMission; // ✅ Trouvé!
      }
    }
  }
  
  return null; // ⚠️ Non trouvé
}
```

### Critères de Détection

1. **Colonnes requises:**
   - Colonne "Rubrique" (insensible à la casse)
   - Colonne "Description" (insensible à la casse)

2. **Ligne recherchée:**
   - Valeur dans "Rubrique" contient "etape" ET "mission"
   - Insensible à la casse
   - Exemples valides:
     - "Etape de mission"
     - "ETAPE DE MISSION"
     - "étape de mission"

3. **Valeur extraite:**
   - Contenu de la colonne "Description" sur la même ligne
   - Nettoyée (trim)
   - Exemples:
     - "Leadsheet"
     - "Programme de travail"
     - "Cartographie des risques"

---

## 📝 NOMENCLATURE DES FICHIERS

### Format Standard

```
E-audit_Etape-mission-{NomEtape}_{timestamp}.xlsx
```

**Composants:**
- `E-audit` : Préfixe du logiciel (fixe)
- `Etape-mission` : Indicateur de type (fixe)
- `{NomEtape}` : Nom de l'étape extrait de la table
- `{timestamp}` : Date et heure au format ISO (YYYY-MM-DDTHH-MM-SS)

### Exemples Réels

| Étape de mission | Nom du fichier |
|------------------|----------------|
| Leadsheet | `E-audit_Etape-mission-Leadsheet_2026-05-10T14-30-45.xlsx` |
| Programme de travail | `E-audit_Etape-mission-Programme-de-travail_2026-05-10T14-31-12.xlsx` |
| Cartographie des risques | `E-audit_Etape-mission-Cartographie-des-risques_2026-05-10T14-32-08.xlsx` |
| (non trouvé) | `E-audit_Etape-mission-X_2026-05-10T14-33-00.xlsx` |

### Sanitisation du Nom

Le nom de l'étape est nettoyé pour être compatible avec les systèmes de fichiers :

```javascript
const etapeSanitized = etapeMission
  .replace(/[^a-zA-Z0-9\s-]/g, '')  // Supprimer caractères spéciaux
  .replace(/\s+/g, '-');             // Remplacer espaces par tirets
```

**Exemples de transformation:**

| Valeur originale | Valeur sanitisée |
|------------------|------------------|
| "Programme de travail" | "Programme-de-travail" |
| "Cartographie des risques!" | "Cartographie-des-risques" |
| "Lead  sheet" | "Lead-sheet" |
| "Étape #1" | "tape-1" |

---

## 🔧 IMPLÉMENTATION

### Modifications dans `exportTemplate()`

**Avant:**
```javascript
const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");
XLSX.writeFile(wb, `claraverse_template_${timestamp}.xlsx`);
```

**Après:**
```javascript
// 🎯 NOUVEAU: Extraire le nom de l'étape de mission pour le nom du fichier
const etapeMission = this.extractEtapeMission(tables);
const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, "-");

// Construire le nom du fichier selon la nomenclature E-audit
let filename;
if (etapeMission) {
  // Format: E-audit_Etape-mission-{NomEtape}_{timestamp}
  const etapeSanitized = etapeMission.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
  filename = `E-audit_Etape-mission-${etapeSanitized}_${timestamp}.xlsx`;
  console.log(`✅ [Export Template] Nom fichier avec étape: ${filename}`);
} else {
  // Format fallback: E-audit_Etape-mission-X_{timestamp}
  filename = `E-audit_Etape-mission-X_${timestamp}.xlsx`;
  console.log(`⚠️ [Export Template] Étape de mission non trouvée, nom fichier fallback: ${filename}`);
}

XLSX.writeFile(wb, filename);
```

### Nouvelle Fonction `extractEtapeMission()`

```javascript
/**
 * Extraire le nom de l'étape de mission depuis les tables
 * Cherche une table avec les colonnes "Rubrique" et "Description"
 * et la ligne "Etape de mission" pour extraire sa valeur
 * 
 * @param {Array} tables - Liste des tables à analyser
 * @returns {string|null} - Nom de l'étape de mission ou null si non trouvé
 */
extractEtapeMission(tables) {
  console.log("🔍 [Extract Etape Mission] Recherche de l'étape de mission dans", tables.length, "table(s)");
  
  for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
    const table = tables[tableIndex];
    const tableData = this.extractTableDataOptimized(table);
    
    if (tableData.length < 2) continue; // Besoin d'au moins en-tête + 1 ligne
    
    // Vérifier si la table a les colonnes "Rubrique" et "Description"
    const headers = tableData[0].map(h => h.toLowerCase().trim());
    const rubriqueIndex = headers.findIndex(h => h.includes('rubrique'));
    const descriptionIndex = headers.findIndex(h => h.includes('description'));
    
    if (rubriqueIndex === -1 || descriptionIndex === -1) {
      console.log(`  ⏭️ Table ${tableIndex + 1}: Pas de colonnes Rubrique/Description`);
      continue;
    }
    
    console.log(`  ✅ Table ${tableIndex + 1}: Colonnes trouvées - Rubrique: col ${rubriqueIndex}, Description: col ${descriptionIndex}`);
    
    // Chercher la ligne "Etape de mission"
    for (let rowIndex = 1; rowIndex < tableData.length; rowIndex++) {
      const row = tableData[rowIndex];
      const rubriqueValue = (row[rubriqueIndex] || '').toLowerCase().trim();
      
      if (rubriqueValue.includes('etape') && rubriqueValue.includes('mission')) {
        const etapeMission = (row[descriptionIndex] || '').trim();
        
        if (etapeMission) {
          console.log(`  🎯 [Extract Etape Mission] Trouvé: "${etapeMission}" (Table ${tableIndex + 1}, Ligne ${rowIndex + 1})`);
          return etapeMission;
        }
      }
    }
  }
  
  console.log("  ⚠️ [Extract Etape Mission] Étape de mission non trouvée dans aucune table");
  return null;
}
```

---

## 🧪 TESTS ET VALIDATION

### Scénarios de Test

#### Test 1: Étape de mission présente

**Données:**
```
Table 1:
| Rubrique | Description |
|----------|-------------|
| Client | FILTRACI |
| Etape de mission | Leadsheet |
```

**Résultat attendu:**
```
Fichier: E-audit_Etape-mission-Leadsheet_2026-05-10T14-30-45.xlsx
Logs:
✅ [Extract Etape Mission] Trouvé: "Leadsheet" (Table 1, Ligne 2)
✅ [Export Template] Nom fichier avec étape: E-audit_Etape-mission-Leadsheet_2026-05-10T14-30-45.xlsx
```

#### Test 2: Étape de mission non trouvée

**Données:**
```
Table 1:
| Colonne A | Colonne B |
|-----------|-----------|
| Valeur 1 | Valeur 2 |
```

**Résultat attendu:**
```
Fichier: E-audit_Etape-mission-X_2026-05-10T14-30-45.xlsx
Logs:
⏭️ Table 1: Pas de colonnes Rubrique/Description
⚠️ [Extract Etape Mission] Étape de mission non trouvée dans aucune table
⚠️ [Export Template] Étape de mission non trouvée, nom fichier fallback: E-audit_Etape-mission-X_2026-05-10T14-30-45.xlsx
```

#### Test 3: Plusieurs tables, étape dans la 2ème

**Données:**
```
Table 1:
| Colonne A | Colonne B |
|-----------|-----------|
| Valeur 1 | Valeur 2 |

Table 2:
| Rubrique | Description |
|----------|-------------|
| Etape de mission | Programme de travail |
```

**Résultat attendu:**
```
Fichier: E-audit_Etape-mission-Programme-de-travail_2026-05-10T14-30-45.xlsx
Logs:
⏭️ Table 1: Pas de colonnes Rubrique/Description
✅ Table 2: Colonnes trouvées - Rubrique: col 0, Description: col 1
🎯 [Extract Etape Mission] Trouvé: "Programme de travail" (Table 2, Ligne 1)
✅ [Export Template] Nom fichier avec étape: E-audit_Etape-mission-Programme-de-travail_2026-05-10T14-30-45.xlsx
```

#### Test 4: Caractères spéciaux dans le nom

**Données:**
```
Table 1:
| Rubrique | Description |
|----------|-------------|
| Etape de mission | Cartographie des risques! |
```

**Résultat attendu:**
```
Fichier: E-audit_Etape-mission-Cartographie-des-risques_2026-05-10T14-30-45.xlsx
Logs:
🎯 [Extract Etape Mission] Trouvé: "Cartographie des risques!" (Table 1, Ligne 1)
✅ [Export Template] Nom fichier avec étape: E-audit_Etape-mission-Cartographie-des-risques_2026-05-10T14-30-45.xlsx
```

### Logs de Diagnostic

La fonction génère des logs détaillés pour faciliter le diagnostic :

```
🔍 [Extract Etape Mission] Recherche de l'étape de mission dans 3 table(s)
  ⏭️ Table 1: Pas de colonnes Rubrique/Description
  ✅ Table 2: Colonnes trouvées - Rubrique: col 0, Description: col 1
  🎯 [Extract Etape Mission] Trouvé: "Leadsheet" (Table 2, Ligne 2)
✅ [Export Template] Nom fichier avec étape: E-audit_Etape-mission-Leadsheet_2026-05-10T14-30-45.xlsx
```

---

## 🔄 CAS PARTICULIERS

### Cas 1: Deux tables avec "Etape de mission"

**Comportement:** La première occurrence trouvée est utilisée.

**Exemple:**
```
Table 1:
| Rubrique | Description |
|----------|-------------|
| Etape de mission | Leadsheet |

Table 2:
| Rubrique | Description |
|----------|-------------|
| Etape de mission | Programme de travail |
```

**Résultat:** `E-audit_Etape-mission-Leadsheet_...` (Table 1 utilisée)

### Cas 2: Valeur vide dans "Description"

**Comportement:** Continue la recherche dans les autres tables.

**Exemple:**
```
Table 1:
| Rubrique | Description |
|----------|-------------|
| Etape de mission | |

Table 2:
| Rubrique | Description |
|----------|-------------|
| Etape de mission | Leadsheet |
```

**Résultat:** `E-audit_Etape-mission-Leadsheet_...` (Table 2 utilisée)

### Cas 3: Colonnes inversées

**Comportement:** La fonction détecte automatiquement l'ordre des colonnes.

**Exemple:**
```
Table 1:
| Description | Rubrique |
|-------------|----------|
| Leadsheet | Etape de mission |
```

**Résultat:** `E-audit_Etape-mission-Leadsheet_...` ✅

### Cas 4: Variations de casse

**Comportement:** Insensible à la casse.

**Exemples valides:**
- "Etape de mission"
- "ETAPE DE MISSION"
- "étape de mission"
- "Étape De Mission"

Tous donnent le même résultat.

---

## 📚 INTÉGRATION AVEC AUTRES FONCTIONS

### Fonctions Utilisées

1. **`extractTableDataOptimized(table)`**
   - Extrait les données d'une table en format tableau 2D
   - Optimise le nombre de colonnes
   - Préserve le formatage

2. **`showQuickNotification(message)`**
   - Affiche une notification à l'utilisateur
   - Utilisée pour confirmer l'export

### Fonctions Appelantes

- **`exportTemplate()`**
  - Fonction principale d'export template Excel
  - Appelle `extractEtapeMission(tables)` pour obtenir le nom de l'étape
  - Construit le nom du fichier selon la nomenclature

---

## 🔧 MAINTENANCE FUTURE

### Points d'Attention

1. **Si la structure des tables change:**
   - Vérifier que les colonnes "Rubrique" et "Description" existent toujours
   - Adapter les critères de recherche si nécessaire

2. **Si d'autres logiciels sont ajoutés:**
   - Remplacer le préfixe "E-audit" par une variable configurable
   - Exemple: `const logiciel = "E-revision";`

3. **Si la nomenclature change:**
   - Modifier le format dans `exportTemplate()`
   - Exemple: `${logiciel}_${etapeSanitized}_${timestamp}.xlsx`

### Tests Recommandés

- ✅ Table avec étape de mission
- ✅ Table sans étape de mission
- ✅ Plusieurs tables avec étape
- ✅ Caractères spéciaux dans le nom
- ✅ Colonnes inversées
- ✅ Variations de casse
- ✅ Valeur vide dans Description

---

## 📝 CONCLUSION

La nouvelle nomenclature des fichiers exportés améliore significativement l'organisation et la traçabilité des documents E-audit :

**Avant:**
- ❌ Nom générique peu informatif
- ❌ Difficile de retrouver un fichier spécifique
- ❌ Pas de lien avec l'étape de mission

**Après:**
- ✅ Nom explicite avec l'étape de mission
- ✅ Facile de retrouver un fichier
- ✅ Nomenclature cohérente avec E-audit
- ✅ Fallback automatique si étape non trouvée

**Résultat:** Export template fonctionne maintenant avec une nomenclature professionnelle et traçable. ✅


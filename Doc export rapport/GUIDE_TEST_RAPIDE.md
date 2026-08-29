# GUIDE DE TEST RAPIDE - Export Synthèse CAC
**Date**: 25 Mars 2026

---

## 🚀 DÉMARRAGE

### 1. Redémarrer le backend
```powershell
.\start-claraverse-conda.ps1
```

**Logs attendus**:
```
✅ Export Synthèse CAC V2 router loaded successfully
```

### 2. Rafraîchir le frontend
- Ouvrir Claraverse dans le navigateur
- Appuyer sur `Ctrl+F5` (rafraîchissement forcé)

---

## 🧪 TEST 1: Vérification du menu

### Étapes:
1. Ouvrir Claraverse
2. Clic droit sur n'importe quelle table
3. Vérifier la structure du menu

### Résultat attendu:

**Section "Rapports d'Audit"** (doit contenir 4 items):
- ✅ 📄 Export Synthèse FRAP
- ✅ 📑 Export Rapport Provisoire
- ✅ 📖 Export Rapport Final
- ✅ 📝 Export FRAP Individuelle
- ❌ PAS de "📋 Export Rapport Structuré"

**Section "Rapports CAC & Expert-Comptable"** (doit contenir 3 items):
- ✅ 📊 Export Synthèse CAC
- ✅ 📋 Export Points Révision Comptes
- ✅ 🔍 Export Points Contrôle Interne

---

## 🧪 TEST 2: Détection des tables Recos CI

### Étapes:
1. Dans le chat, demander à Clara:
   ```
   Génère une table "Recos contrôle interne comptable" avec:
   - Intitulé: Séparation des tâches insuffisante
   - Observation: Absence de séparation entre saisie et validation
   - Constat: Une seule personne peut créer et valider les factures
   - Risque: Risque de fraude et d'erreurs non détectées
   - Recommandation: Mettre en place une séparation des tâches
   ```

2. Ouvrir la console du navigateur (F12)

3. Clic droit sur la table générée → "Rapports CAC & Expert-Comptable" → "Export Synthèse CAC"

### Logs attendus dans la console:
```
🔍 [Recos CI] Analyse de X table(s)
🔍 [Recos CI] Première cellule: "Recos contrôle interne comptable"
🔍 [Recos CI] Cellule: "Recos contrôle interne comptable" → recos:true, controle:true, interne:true, comptable:true
✅ [Recos CI] Table détectée avec 6 sous-tables
📊 [Export CAC] Points collectés:
   - FRAP: 0
   - Recos Révision: 0
   - Recos Contrôle Interne: 1
✅ Synthèse CAC exportée! (1 points)
```

### Si la table n'est PAS détectée:
```
🔍 [Recos CI] Analyse de X table(s)
🔍 [Recos CI] Première cellule: "..."
❌ [Recos CI] Table non reconnue comme Recos CI
```

**Action**: Vérifier que la première table contient bien les 4 mots-clés: "recos", "controle", "interne", "comptable"

---

## 🧪 TEST 3: Export complet avec tous les types

### Étapes:
1. Dans le chat, demander à Clara:
   ```
   Génère 3 tables:
   
   1. Une table FRAP avec:
      - Intitulé: Contrôle des factures fournisseurs
      - Observation: Absence de contrôle systématique
      - Constat: 15% des factures non vérifiées
      - Risque: Paiements indus
      - Recommandation: Mettre en place un contrôle systématique
   
   2. Une table "Recos revision des comptes" avec:
      - Intitulé: Provision pour congés payés
      - Description: Écart entre provision et calcul théorique
      - Observation: Provision sous-évaluée de 25 000 €
      - Ajustement: Augmenter la provision de 25 000 €
      - Régularisation: Débit 641 / Crédit 428 pour 25 000 €
   
   3. Une table "Recos contrôle interne comptable" avec:
      - Intitulé: Rapprochements bancaires
      - Observation: Rapprochements non effectués mensuellement
      - Constat: Dernier rapprochement date de 3 mois
      - Risque: Erreurs et fraudes non détectées
      - Recommandation: Effectuer les rapprochements mensuellement
   ```

2. Ouvrir la console (F12)

3. Clic droit sur n'importe quelle table → "Export Synthèse CAC"

### Logs attendus:
```
🔍 [Export CAC] 18 table(s) trouvée(s) dans le chat
🔍 [FRAP] Première cellule: "Frap"
✅ [FRAP] Table détectée avec 6 sous-tables
🔍 [Recos Révision] Première cellule: "Recos revision des comptes"
✅ [Recos Révision] Table détectée avec 6 sous-tables
🔍 [Recos CI] Première cellule: "Recos contrôle interne comptable"
✅ [Recos CI] Table détectée avec 6 sous-tables
📊 [Export CAC] Points collectés:
   - FRAP: 1
   - Recos Révision: 1
   - Recos Contrôle Interne: 1
✅ Synthèse CAC exportée! (3 points)
```

### Backend logs:
```
📊 Export Synthèse CAC V2: 3 points au total
   - FRAP: 1
   - Recos Révision: 1
   - Recos CI: 1
✅ Document généré avec succès (version programmatique)
✅ Export réussi: synthese_cac_2026-03-25_XX-XX-XX.docx
```

---

## 📄 TEST 4: Vérification du document Word

### Ouvrir le fichier téléchargé:
`synthese_cac_2026-03-25_XX-XX-XX.docx`

### Structure attendue:

```
SYNTHÈSE DES TRAVAUX DE RÉVISION

Entité: [Nom]
Exercice: [Année]
Date du rapport: [Date]

1. INTRODUCTION
   [Texte standard]

2. OBSERVATIONS D'AUDIT
   2.1. Provision pour congés payés
        Référence: [Ref]
        Description: Écart entre provision et calcul théorique ✅
        Observation: Provision sous-évaluée de 25 000 € ✅
        Ajustement/Reclassement proposé: Augmenter la provision de 25 000 € ✅
        Régularisation comptable: Débit 641 / Crédit 428 pour 25 000 € ✅

3. POINTS DE CONTRÔLE INTERNE
   3.1. Contrôle des factures fournisseurs
        Référence: [Ref]
        Type: FRAP
        Observation: Absence de contrôle systématique ✅
        Constat: 15% des factures non vérifiées ✅
        Risques identifiés: Paiements indus ✅
        Recommandation: Mettre en place un contrôle systématique ✅
   
   3.2. Rapprochements bancaires
        Référence: [Ref]
        Type: Recos CI
        Observation: Rapprochements non effectués mensuellement ✅
        Constat: Dernier rapprochement date de 3 mois ✅
        Risques identifiés: Erreurs et fraudes non détectées ✅
        Recommandation: Effectuer les rapprochements mensuellement ✅

4. CONCLUSION
   Au total, 3 point(s) ont été identifié(s)...
```

### Points à vérifier:
- ✅ Tous les champs sont présents
- ✅ Les retours à la ligne sont préservés
- ✅ La mise en forme est correcte
- ✅ Les sections sont bien structurées
- ✅ Le nombre de points est correct

---

## ❌ PROBLÈMES COURANTS

### Problème 1: "Export Rapport Structuré" encore visible
**Cause**: Cache du navigateur  
**Solution**: Appuyer sur `Ctrl+F5` pour forcer le rafraîchissement

### Problème 2: Tables Recos CI non détectées
**Cause**: Première table ne contient pas les 4 mots-clés  
**Solution**: Vérifier que la première cellule contient "Recos contrôle interne comptable"

### Problème 3: Champs manquants dans le Word
**Cause**: Backend V1 utilisé au lieu de V2  
**Solution**: 
1. Vérifier les logs backend: doit afficher "Export Synthèse CAC V2"
2. Vérifier l'URL dans la console: doit être `/export-synthese-cac-v2`

### Problème 4: Erreur 500 du backend
**Cause**: Module python-docx non installé  
**Solution**:
```powershell
conda activate claraverse
pip install python-docx
```

---

## ✅ CHECKLIST FINALE

- [ ] Backend démarré avec succès
- [ ] Frontend rafraîchi (Ctrl+F5)
- [ ] Menu ne contient plus "Export Rapport Structuré"
- [ ] Tables Recos CI détectées correctement
- [ ] Logs de debug visibles dans la console
- [ ] Export Word fonctionne
- [ ] Tous les champs présents dans le Word
- [ ] Mise en forme correcte

---

**FIN DU GUIDE**

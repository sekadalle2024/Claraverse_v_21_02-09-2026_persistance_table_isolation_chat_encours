# Guide de Test - Corrections Format Liasse

**Date**: 23 mars 2026  
**Version**: 1.0

## 🎯 Objectif

Valider les 3 corrections apportées au menu accordéon:
1. ✅ Format liasse avec colonnes N et N-1
2. ✅ TFT avec colonnes N et N-1
3. ✅ Annexes complètes avec colonnes N et N-1

## 📋 Prérequis

- Backend actif sur http://127.0.0.1:5000
- Frontend actif sur http://localhost:5173
- Fichier `BALANCES_N_N1_N2.xlsx` disponible

## 🧪 Tests à Effectuer

### Test 1: Vérification Backend

```powershell
# Vérifier que le backend est actif
Invoke-WebRequest -Uri "http://127.0.0.1:5000/health" -UseBasicParsing
```

**Résultat attendu**: StatusCode 200

### Test 2: Upload Fichier Multi-Onglets

1. Ouvrir http://localhost:5173
2. Dans le chat, taper: `/Demarrer E-audit pro`
3. Sélectionner "États Financiers"
4. Uploader le fichier `BALANCES_N_N1_N2.xlsx`

**Résultat attendu**:
- Message de succès
- Menu accordéon affiché avec 5 sections

### Test 3: Vérification Bilan Actif

1. Cliquer sur "🏢 BILAN - ACTIF"
2. Vérifier la présence du tableau avec 5 colonnes:
   - REF
   - LIBELLÉS
   - NOTE
   - EXERCICE N
   - EXERCICE N-1

**Points à vérifier**:
- ✅ Tous les postes affichés (même vides avec "-")
- ✅ Colonnes N et N-1 présentes
- ✅ Montants formatés avec espaces (ex: 26 020 175)
- ✅ Totaux en gras

### Test 4: Vérification Compte de Résultat

1. Cliquer sur "📊 COMPTE DE RÉSULTAT"
2. Vérifier la structure complète:
   - Postes TA à XI (43 postes)
   - Colonnes EXERCICE N et EXERCICE N-1
   - Totaux XA, XB, XC, XD, XE, XF, XG, XI

**Points à vérifier**:
- ✅ 43 postes affichés
- ✅ 8 postes de totalisation (X*)
- ✅ Résultat net (XI) calculé
- ✅ Cohérence des totaux

### Test 5: Vérification TFT

1. Cliquer sur "💧 TABLEAU DES FLUX DE TRÉSORERIE (TFT)"
2. Vérifier la structure:
   - 19 lignes (ZA à ZF)
   - Colonnes EXERCICE N et EXERCICE N-1

**Lignes à vérifier**:
```
ZA - Trésorerie nette au 1er janvier
FA - Capacité d'Autofinancement Globale (CAFG)
FB - Variation actif circulant HAO
FC - Variation des stocks
FD - Variation des créances
FE - Variation du passif circulant
ZB - FLUX OPÉRATIONNELS
FF - Décaissements acquisitions immobilisations incorporelles
FG - Décaissements acquisitions immobilisations corporelles
FH - Décaissements acquisitions immobilisations financières
FI - Encaissements cessions immobilisations
ZC - FLUX D'INVESTISSEMENT
FJ - Augmentation de capital
FK - Dividendes versés
FL - Nouveaux emprunts
FM - Remboursements emprunts
ZD - FLUX DE FINANCEMENT
ZE - VARIATION DE TRÉSORERIE
ZF - Trésorerie nette au 31 décembre
```

**Points à vérifier**:
- ✅ 19 lignes présentes
- ✅ Colonnes N et N-1
- ✅ Totaux ZB, ZC, ZD, ZE en gras
- ✅ Cohérence: ZE = ZB + ZC + ZD
- ✅ Cohérence: ZF = ZA + ZE

### Test 6: Vérification Annexes

1. Cliquer sur "📋 NOTES ANNEXES"
2. Vérifier la présence de 14 notes:

**Liste des notes**:
- ✅ NOTE 3A - Immobilisations incorporelles (5 postes)
- ✅ NOTE 3B - Immobilisations corporelles (6 postes)
- ✅ NOTE 4 - Immobilisations financières (3 postes)
- ✅ NOTE 6 - État des stocks (5 postes)
- ✅ NOTE 7 - État des créances (3 postes)
- ✅ NOTE 8 - Trésorerie-Actif (2 postes)
- ✅ NOTE 10 - Capital social (2 postes)
- ✅ NOTE 11 - Réserves et report à nouveau (5 postes)
- ✅ NOTE 13 - Résultat net (1 poste)
- ✅ NOTE 14 - Emprunts et dettes financières (3 postes)
- ✅ NOTE 16 - Dettes circulantes (6 postes)
- ✅ NOTE 21 - Chiffre d'affaires (3 postes)
- ✅ NOTE 22 - Achats consommés (4 postes)
- ✅ NOTE 24 - Charges de personnel (2 postes)

**Points à vérifier pour chaque note**:
- ✅ Titre de la note affiché
- ✅ Tableau avec 4 colonnes (REF, LIBELLÉS, EXERCICE N, EXERCICE N-1)
- ✅ Tous les postes affichés
- ✅ Montants formatés correctement
- ✅ "-" pour les montants nuls

### Test 7: Vérification Cohérence

**Cohérence Bilan**:
```
Total Actif N = Total Passif N + Résultat Net N
```

**Cohérence TFT**:
```
Variation Trésorerie (ZE) = Flux Opérationnels (ZB) + Flux Investissement (ZC) + Flux Financement (ZD)
Trésorerie Fin (ZF) = Trésorerie Début (ZA) + Variation (ZE)
```

**Cohérence Annexes**:
```
Somme des postes d'une note = Total de la note (si applicable)
```

## 📊 Checklist de Validation

### Format Général
- [ ] Menu accordéon avec 5 sections
- [ ] Toutes les sections cliquables
- [ ] Animations d'ouverture/fermeture fluides
- [ ] CSS liasse appliqué correctement

### Bilan
- [ ] Bilan Actif avec colonnes N et N-1
- [ ] Bilan Passif avec colonnes N et N-1
- [ ] Tous les postes affichés (même vides)
- [ ] Totaux calculés correctement

### Compte de Résultat
- [ ] 43 postes affichés
- [ ] Colonnes N et N-1
- [ ] 8 totaux (XA à XI)
- [ ] Résultat net cohérent

### TFT
- [ ] 19 lignes complètes
- [ ] Colonnes N et N-1
- [ ] Totaux ZB, ZC, ZD, ZE, ZF
- [ ] Cohérence des calculs

### Annexes
- [ ] 14 notes présentes
- [ ] Chaque note avec colonnes N et N-1
- [ ] Tous les postes détaillés
- [ ] Format tableau uniforme

## 🐛 Problèmes Potentiels

### Problème 1: Onglets non détectés
**Symptôme**: Message "Balance N-1 non trouvée"  
**Solution**: Vérifier les noms des onglets dans le fichier Excel

### Problème 2: TFT vide
**Symptôme**: Section TFT sans contenu  
**Solution**: Vérifier les logs backend pour erreurs de calcul

### Problème 3: Annexes incomplètes
**Symptôme**: Moins de 14 notes affichées  
**Solution**: Vérifier que les données sont présentes dans les balances

### Problème 4: Montants incorrects
**Symptôme**: Montants ne correspondent pas à l'Excel  
**Solution**: Vérifier le mapping des comptes dans `correspondances_syscohada.json`

## 📝 Rapport de Test

### Informations Générales
- Date du test: _______________
- Testeur: _______________
- Fichier testé: _______________
- Version backend: _______________

### Résultats

| Test | Statut | Commentaires |
|------|--------|--------------|
| Backend actif | ⬜ OK / ⬜ KO | |
| Upload fichier | ⬜ OK / ⬜ KO | |
| Bilan Actif | ⬜ OK / ⬜ KO | |
| Bilan Passif | ⬜ OK / ⬜ KO | |
| Compte de Résultat | ⬜ OK / ⬜ KO | |
| TFT | ⬜ OK / ⬜ KO | |
| Annexes | ⬜ OK / ⬜ KO | |
| Cohérence | ⬜ OK / ⬜ KO | |

### Observations
```
[Espace pour notes et observations]
```

### Bugs Identifiés
```
[Liste des bugs trouvés]
```

### Recommandations
```
[Améliorations suggérées]
```

## 🔧 Commandes Utiles

### Redémarrer le Backend
```powershell
.\stop-claraverse.ps1
.\start-claraverse-conda.ps1
```

### Vérifier les Logs Backend
```powershell
# Dans le terminal où le backend tourne
# Chercher les messages avec "📊", "✅", "❌"
```

### Tester l'Endpoint Directement
```powershell
# Créer un fichier test-endpoint.ps1
$fileContent = [Convert]::ToBase64String([IO.File]::ReadAllBytes("BALANCES_N_N1_N2.xlsx"))
$body = @{
    file_base64 = $fileContent
    filename = "BALANCES_N_N1_N2.xlsx"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:5000/etats-financiers/process-excel" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## 📚 Documentation Associée

- `CORRECTION_MENU_ACCORDEON_TFT_ANNEXES.md` - Détails des corrections
- `GUIDE_UTILISATEUR_ETATS_LIASSE.md` - Guide utilisateur
- `Doc_Etat_Fin/STRUCTURE_TFT.md` - Structure TFT détaillée
- `py_backend/structure_liasse_complete.json` - Structure complète

## ✅ Validation Finale

Une fois tous les tests passés:
- [ ] Tous les tests OK
- [ ] Aucun bug bloquant
- [ ] Performance acceptable
- [ ] Documentation à jour

**Signature**: _______________  
**Date**: _______________

---

**Note**: Ce guide doit être utilisé après chaque modification du code pour garantir la non-régression.

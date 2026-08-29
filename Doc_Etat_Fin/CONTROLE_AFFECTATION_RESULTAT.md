# Contrôle d'Affectation du Résultat

## Objectif
Vérifier si l'affectation du résultat au passif permettrait d'équilibrer le bilan, sans modifier les données réelles.

## Principe
Ce contrôle calcule une **hypothèse** : que se passerait-il si le résultat net était affecté au passif (compte 13 - Résultat de l'exercice) ?

## Formules

### Situation Actuelle
```
Différence Bilan = Actif - Passif
```

### Hypothèse d'Affectation
```
Passif avec Résultat = Passif + Résultat Net
Différence après Affectation = Actif - (Passif + Résultat Net)
```

### Équilibre
```
Bilan Équilibré = |Différence après Affectation| < 0,01
```

## Interprétation

### Cas 1 : Bilan Équilibré après Affectation ✅
**Situation** : La différence après affectation est proche de zéro

**Signification** :
- Le résultat n'est pas encore affecté au passif
- C'est une situation normale en cours d'exercice
- Le bilan s'équilibrera après affectation du résultat

**Recommandation** : Affecter le résultat au passif (compte 13)

**Exemple** (données de test) :
```
Actif:                181,162,530.00
Passif (sans résultat): 370,703,030.00
Résultat Net:        -189,540,500.00 (Perte)

Différence avant:    -189,540,500.00 ❌

Passif + Résultat:    181,162,530.00
Différence après:              0.00 ✅

→ Le bilan s'équilibre si le résultat est affecté
```

### Cas 2 : Bilan NON Équilibré après Affectation ⚠️
**Situation** : La différence après affectation reste significative

**Signification** :
- Il y a une incohérence dans les écritures comptables
- Des comptes sont mal classés ou manquants
- Erreurs de saisie possibles

**Recommandation** : Vérifier les écritures comptables

**Causes possibles** :
1. Comptes de bilan mal classés (actif/passif inversés)
2. Comptes non intégrés dans les états financiers
3. Erreurs de saisie dans la balance
4. Comptes avec sens inversé

## Affichage dans l'Interface

### Badge de Statut
- 🟢 **Vert** : "✓ Équilibrerait" - Le bilan s'équilibrerait après affectation
- 🟠 **Orange** : "⚠ N'équilibrerait pas" - Incohérence détectée

### Informations Affichées
1. **Type de résultat** : Bénéfice / Perte / Nul
2. **Montant du résultat**
3. **Situation actuelle** :
   - Actif
   - Passif (sans résultat)
   - Différence
4. **Hypothèse** :
   - Passif (avec résultat)
   - Différence après affectation
   - Bilan équilibré : OUI/NON
5. **Recommandation** : Action à entreprendre

## Relation avec Autres Contrôles

### Cohérence Résultat
Le contrôle "Cohérence Résultat" vérifie que :
```
Résultat CR = Résultat Bilan
```

Si ce contrôle est OK, alors le contrôle d'affectation devrait montrer que le bilan s'équilibrerait.

### Équilibre du Bilan
Le contrôle "Équilibre du Bilan" vérifie que :
```
Actif = Passif
```

Si ce contrôle est NON et que le contrôle d'affectation est OK, cela signifie que le résultat n'est pas encore affecté.

## Cas d'Usage

### Situation Normale (Balance en Cours d'Exercice)
```
✅ Cohérence Résultat : OUI
❌ Équilibre Bilan : NON
✅ Hypothèse Affectation : Équilibrerait

→ Situation normale, résultat pas encore affecté
```

### Situation Anormale (Incohérence Comptable)
```
❌ Cohérence Résultat : NON
❌ Équilibre Bilan : NON
❌ Hypothèse Affectation : N'équilibrerait pas

→ Incohérence comptable à corriger
```

### Situation Idéale (Balance Après Affectation)
```
✅ Cohérence Résultat : OUI
✅ Équilibre Bilan : OUI
✅ Hypothèse Affectation : Déjà équilibré

→ Résultat déjà affecté, bilan équilibré
```

## Implémentation Technique

### Backend (Python)
```python
# Calcul de l'hypothèse
passif_avec_resultat = total_passif + resultat_net_cr
difference_apres_affectation = total_actif - passif_avec_resultat

controles['hypothese_affectation_resultat'] = {
    'resultat_net': resultat_net_cr,
    'passif_avant_affectation': total_passif,
    'passif_apres_affectation': passif_avec_resultat,
    'actif': total_actif,
    'difference_avant': total_actif - total_passif,
    'difference_apres': difference_apres_affectation,
    'equilibre_apres_affectation': abs(difference_apres_affectation) < 0.01,
    'recommandation': 'Affecter le résultat au passif (compte 13)' 
                      if abs(difference_apres_affectation) < 0.01 
                      else 'Vérifier les écritures comptables',
    'type_resultat': 'Bénéfice' if resultat_net_cr > 0 
                     else 'Perte' if resultat_net_cr < 0 
                     else 'Nul'
}
```

### Frontend (HTML)
Affichage dans la section "États de Contrôle" avec :
- Badge coloré selon le statut
- Détails de la situation actuelle
- Calcul de l'hypothèse
- Recommandation claire

## Avantages de Cette Approche

1. **Non Invasif** : Ne modifie pas les données réelles
2. **Pédagogique** : Explique pourquoi le bilan n'est pas équilibré
3. **Diagnostic** : Aide à identifier les incohérences
4. **Recommandation** : Guide l'utilisateur sur l'action à entreprendre

## Fichiers Concernés
- `py_backend/etats_financiers.py` (fonction `process_balance_to_etats_financiers`)
- `py_backend/test_etats_financiers_standalone.py` (test)
- `Doc_Etat_Fin/CONTROLE_AFFECTATION_RESULTAT.md` (ce fichier)

## Date
22 mars 2026

# Flexibilité Multi-Entreprises - États Financiers

**Date**: 22 mars 2026  
**Objectif**: Documenter la capacité du système à traiter différentes entreprises avec différents plans comptables

---

## Principe de Fonctionnement

Le système est conçu pour être **flexible et adaptable** à différentes entreprises, tout en maintenant une structure de fichier Excel standardisée.

### Structure Standard du Fichier

```
BALANCES_N_N1_N2.xlsx
├── Balance N (2024)      ← Exercice en cours
├── Balance N-1 (2023)    ← Exercice précédent
└── Balance N-2 (2022)    ← Exercice N-2 (optionnel)
```

**Colonnes requises** (identiques pour toutes les entreprises):
- Numéro (compte)
- Intitulé
- Solde Débit
- Solde Crédit

---

## Adaptabilité aux Différents Plans Comptables

### 1. Mapping Automatique via SYSCOHADA

Le fichier `correspondances_syscohada.json` contient les **racines de comptes** qui permettent de mapper n'importe quel plan comptable SYSCOHADA vers les postes de la liasse officielle.

**Exemple de mapping**:
```json
{
  "ref": "CA",
  "libelle": "Capital",
  "racines": ["101"]
}
```

Cela signifie que **tous les comptes commençant par "101"** seront mappés vers le poste CA:
- 101000 → Capital
- 1011000 → Capital souscrit appelé
- 1012000 → Capital souscrit non appelé
- 10131000 → Capital souscrit appelé versé
- etc.

### 2. Flexibilité par Entreprise

Chaque entreprise peut avoir:

#### Entreprise A (PME)
```
101000 - Capital social
411000 - Clients
521000 - Banque SGBCI
```

#### Entreprise B (Grande entreprise)
```
1011000 - Capital souscrit appelé
1012000 - Capital souscrit non appelé
4111000 - Clients ordinaires
4112000 - Clients douteux
5211000 - Banque SGBCI compte courant
5212000 - Banque BOA compte courant
5213000 - Banque Ecobank compte courant
```

**Résultat**: Les deux entreprises génèrent la même liasse officielle avec les mêmes postes, mais avec des montants différents selon leur activité.

---

## Exemples Concrets

### Exemple 1: Entreprise Commerciale

**Balance N**:
```
Compte    | Intitulé                  | Débit      | Crédit
----------|---------------------------|------------|------------
101000    | Capital social            |            | 10 000 000
411000    | Clients                   | 5 000 000  |
521000    | Banque                    | 2 000 000  |
601000    | Achats de marchandises    | 50 000 000 |
701000    | Ventes de marchandises    |            | 80 000 000
```

**Liasse générée**:
```
REF | LIBELLÉS                    | EXERCICE N
----|-----------------------------|-----------
CA  | Capital                     | 10 000 000
BM  | Clients                     |  5 000 000
BS  | Banques                     |  2 000 000
RA  | Achats de marchandises      | 50 000 000
TA  | Ventes de marchandises      | 80 000 000
```

### Exemple 2: Entreprise Industrielle

**Balance N**:
```
Compte    | Intitulé                  | Débit      | Crédit
----------|---------------------------|------------|------------
101000    | Capital social            |            | 50 000 000
231000    | Bâtiments                 | 30 000 000 |
241000    | Matériel industriel       | 20 000 000 |
321000    | Matières premières        | 10 000 000 |
602000    | Achats matières premières | 40 000 000 |
702000    | Ventes produits finis     |            | 100 000 000
```

**Liasse générée**:
```
REF | LIBELLÉS                    | EXERCICE N
----|-----------------------------|-----------
CA  | Capital                     | 50 000 000
AK  | Bâtiments                   | 30 000 000
AM  | Matériel                    | 20 000 000
BH  | Matières premières          | 10 000 000
RC  | Achats matières premières   | 40 000 000
TB  | Ventes produits fabriqués   | 100 000 000
```

---

## Avantages du Système

### 1. Standardisation
- **Format unique** pour toutes les entreprises
- **Structure Excel identique** quel que soit le plan comptable
- **Liasse officielle conforme** SYSCOHADA pour tous

### 2. Flexibilité
- **Supporte tous les plans comptables** SYSCOHADA
- **Détail variable** selon la taille de l'entreprise
- **Comptes personnalisés** reconnus automatiquement

### 3. Simplicité
- **Pas de configuration** par entreprise
- **Mapping automatique** via les racines de comptes
- **Génération instantanée** des états financiers

### 4. Évolutivité
- **Ajout facile** de nouveaux comptes
- **Modification simple** du mapping
- **Extension possible** à d'autres référentiels

---

## Cas d'Usage Réels

### Cas 1: Cabinet d'Expertise Comptable

Un cabinet traite 50 entreprises différentes:
- 20 PME avec plans comptables simplifiés
- 20 entreprises moyennes avec plans détaillés
- 10 grandes entreprises avec plans très détaillés

**Solution**: 
- Chaque entreprise fournit son fichier `BALANCES_N_N1_N2.xlsx`
- Le système génère automatiquement la liasse officielle
- Format identique pour toutes, facilite la consolidation

### Cas 2: Groupe d'Entreprises

Un groupe avec 5 filiales:
- Filiale A: Commerce (plan simple)
- Filiale B: Industrie (plan détaillé)
- Filiale C: Services (plan moyen)
- Filiale D: Immobilier (plan spécifique)
- Filiale E: Transport (plan adapté)

**Solution**:
- Chaque filiale utilise son propre plan comptable
- Le système génère des liasses comparables
- Consolidation facilitée par la standardisation

### Cas 3: Entreprise en Croissance

Une entreprise qui évolue:
- **Année 1**: 50 comptes (PME)
- **Année 3**: 200 comptes (croissance)
- **Année 5**: 500 comptes (grande entreprise)

**Solution**:
- Même structure de fichier Excel
- Ajout progressif de comptes
- Historique comparable sur plusieurs années

---

## Gestion des Cas Particuliers

### 1. Comptes Non Reconnus

Si un compte n'est pas dans le mapping:
```python
controles['comptes_non_integres'].append({
    'numero': '999999',
    'intitule': 'Compte spécial',
    'solde_net': 1000000,
    'raison': 'Codification non reconnue'
})
```

**Action**: L'utilisateur peut:
- Vérifier le plan comptable
- Ajouter le mapping dans `correspondances_syscohada.json`
- Corriger la codification du compte

### 2. Comptes Multiples pour un Poste

Plusieurs comptes peuvent alimenter le même poste:
```json
{
  "ref": "BS",
  "libelle": "Banques, chèques postaux, caisse",
  "racines": ["52", "53", "54", "57", "58"]
}
```

Tous ces comptes sont **agrégés automatiquement** dans le poste BS.

### 3. Plans Comptables Personnalisés

Si une entreprise utilise des comptes hors SYSCOHADA:
- **Option 1**: Mapper les comptes personnalisés vers SYSCOHADA
- **Option 2**: Étendre `correspondances_syscohada.json`
- **Option 3**: Créer un fichier de correspondances spécifique

---

## Workflow Multi-Entreprises

### Étape 1: Préparation des Données
```
Entreprise A → BALANCES_N_N1_N2_EntrepriseA.xlsx
Entreprise B → BALANCES_N_N1_N2_EntrepriseB.xlsx
Entreprise C → BALANCES_N_N1_N2_EntrepriseC.xlsx
```

### Étape 2: Génération des États
```bash
# Entreprise A
python generer_etats_liasse.py BALANCES_N_N1_N2_EntrepriseA.xlsx

# Entreprise B
python generer_etats_liasse.py BALANCES_N_N1_N2_EntrepriseB.xlsx

# Entreprise C
python generer_etats_liasse.py BALANCES_N_N1_N2_EntrepriseC.xlsx
```

### Étape 3: Résultats
```
Bureau/
├── Etats_Financiers_Liasse_EntrepriseA_20260322.html
├── Etats_Financiers_Liasse_EntrepriseB_20260322.html
└── Etats_Financiers_Liasse_EntrepriseC_20260322.html
```

---

## Extension du Système

### Ajout de Nouveaux Mappings

Pour ajouter un nouveau compte:

1. **Identifier le poste de la liasse**
   ```
   Exemple: Compte 275 → Poste AS (Autres immobilisations financières)
   ```

2. **Modifier `correspondances_syscohada.json`**
   ```json
   {
     "ref": "AS",
     "libelle": "Autres immobilisations financières",
     "racines": ["27", "297"]  ← Ajouter "275" si nécessaire
   }
   ```

3. **Tester avec une balance**
   ```bash
   python generer_etats_liasse.py
   ```

### Création de Mappings Personnalisés

Pour un référentiel spécifique:

```json
// correspondances_custom.json
{
  "bilan_actif": [
    {
      "ref": "AA",
      "libelle": "Poste personnalisé",
      "racines": ["999"]
    }
  ]
}
```

---

## Statistiques et Contrôles

Le système génère automatiquement:

### Taux de Couverture
```
Comptes intégrés: 256/256 (100%)
Comptes non intégrés: 0
Taux de couverture: 100%
```

### Comptes Non Intégrés
```
Compte    | Intitulé           | Solde      | Raison
----------|--------------------|-----------|---------
999999    | Compte spécial     | 1 000 000 | Non reconnu
```

### Comptes Sens Anormal
```
Compte    | Nature    | Sens Attendu | Sens Réel | Gravité
----------|-----------|--------------|-----------|----------
521000    | Banque    | Débit        | Crédit    | Critique
```

---

## Recommandations

### Pour les Cabinets d'Expertise
1. **Standardiser** le format Excel pour tous les clients
2. **Former** les clients à la structure BALANCES_N_N1_N2
3. **Vérifier** le taux de couverture pour chaque entreprise
4. **Documenter** les comptes non reconnus

### Pour les Entreprises
1. **Respecter** le plan comptable SYSCOHADA
2. **Utiliser** des codes de comptes standards
3. **Vérifier** la cohérence des soldes
4. **Conserver** l'historique sur 3 exercices

### Pour les Développeurs
1. **Enrichir** `correspondances_syscohada.json` progressivement
2. **Tester** avec différents plans comptables
3. **Documenter** les cas particuliers
4. **Maintenir** la compatibilité ascendante

---

## Conclusion

Le système est conçu pour être:
- ✅ **Universel**: Fonctionne pour toutes les entreprises SYSCOHADA
- ✅ **Flexible**: S'adapte aux différents plans comptables
- ✅ **Simple**: Structure Excel standardisée
- ✅ **Évolutif**: Facilement extensible
- ✅ **Fiable**: Contrôles automatiques intégrés

**Format unique + Mapping flexible = Solution universelle**

---

## Fichiers Clés

1. **BALANCES_N_N1_N2.xlsx** - Structure standard (toutes entreprises)
2. **correspondances_syscohada.json** - Mapping universel
3. **generer_etats_liasse.py** - Générateur flexible
4. **etats_financiers_v2.py** - Moteur de traitement

---

**Date de création**: 22 mars 2026  
**Version**: 1.0  
**Statut**: ✅ Documenté et validé

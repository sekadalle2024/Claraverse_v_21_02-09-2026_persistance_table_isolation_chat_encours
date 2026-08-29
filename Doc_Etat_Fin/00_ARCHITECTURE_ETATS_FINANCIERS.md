# Architecture : États Financiers SYSCOHADA Révisé

## 📅 Date : 22 Mars 2026

---

## 🎯 Objectif

Créer un workflow automatique pour générer les États Financiers SYSCOHADA Révisé (Bilan et Compte de Résultat) à partir d'une balance comptable, en utilisant un tableau de correspondance postes/comptes.

---

## 🏗️ Architecture Globale

### Inspiration
Architecture basée sur le workflow Lead Balance (Case 21) avec les mêmes principes :
- Déclenchement automatique via commande "Etat fin"
- Upload automatique de fichier Excel
- Traitement backend Python
- Affichage des résultats en accordéons

### Composants Principaux

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/TypeScript)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. claraApiService.ts (Case 24)                            │
│     └─> Détecte "Etat fin"                                  │
│     └─> Génère table déclencheuse                           │
│     └─> Retourne SENTINEL_ETAT_FIN                          │
│                                                              │
│  2. EtatFinAutoTrigger.js                                   │
│     └─> Détecte la table sentinel                          │
│     └─> Ouvre dialogue fichier automatiquement             │
│     └─> Upload fichier Excel (Balance)                     │
│     └─> Affiche résultats en accordéons                    │
│                                                              │
│  3. menu.js                                                  │
│     └─> Option "📊 États Financiers" (Ctrl+F)              │
│     └─> Option "📥 Export États Financiers" (Ctrl+Shift+F) │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Python/FastAPI)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. etats_financiers.py                                     │
│     └─> Endpoint: /etats-financiers/process-excel          │
│     └─> Lit fichier Excel Balance                          │
│     └─> Charge tableau de correspondance                   │
│     └─> Calcule Bilan et Compte de Résultat                │
│     └─> Génère HTML accordéons                             │
│                                                              │
│  2. Tableau correspondance.xlsx                             │
│     └─> Mapping postes → racines comptes                   │
│     └─> Bilan (Actif/Passif)                               │
│     └─> Compte de Résultat (Charges/Produits)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Flux de Données

### 1. Déclenchement
```
User tape "Etat fin"
    ↓
claraApiService.ts (Case 24)
    ↓
Génère table avec classe "etat-fin-trigger"
    ↓
Retourne SENTINEL_ETAT_FIN
```

### 2. Upload Automatique
```
EtatFinAutoTrigger.js détecte la table
    ↓
Ouvre dialogue fichier automatiquement
    ↓
User sélectionne fichier Balance Excel
    ↓
Encode en base64
    ↓
POST /etats-financiers/process-excel
```

### 3. Traitement Backend
```
Reçoit fichier base64
    ↓
Décode et lit Excel (Balance)
    ↓
Charge Tableau correspondance.xlsx
    ↓
Pour chaque compte de la balance:
    - Identifie la racine (1-4 chiffres)
    - Trouve le poste correspondant
    - Cumule les montants
    ↓
Génère Bilan (Actif/Passif)
Génère Compte de Résultat (Charges/Produits)
    ↓
Crée HTML accordéons
    ↓
Retourne JSON avec HTML
```

### 4. Affichage Frontend
```
Reçoit HTML
    ↓
Insère accordéons sous la table
    ↓
Affiche:
    - Bilan Actif
    - Bilan Passif
    - Compte de Résultat Charges
    - Compte de Résultat Produits
```

---

## 📁 Structure des Fichiers

### Frontend
```
src/services/
└── claraApiService.ts
    └── Case 24: "Etat fin"

public/
├── EtatFinAutoTrigger.js (NOUVEAU)
│   └── Détection et upload automatique
│
└── menu.js
    └── Options États Financiers

index.html
└── <script src="/EtatFinAutoTrigger.js"></script>
```

### Backend
```
py_backend/
├── etats_financiers.py (NOUVEAU)
│   └── Endpoint /etats-financiers/process-excel
│
├── Tableau correspondance.xlsx (EXISTANT)
│   └── Mapping postes/comptes
│
└── main.py
    └── Inclure router etats_financiers
```

### Documentation
```
Doc_Etat_Fin/
├── 00_ARCHITECTURE_ETATS_FINANCIERS.md (ce fichier)
├── 01_GUIDE_UTILISATION.md
├── 02_STRUCTURE_TABLEAU_CORRESPONDANCE.md
├── 03_IMPLEMENTATION_BACKEND.md
├── 04_IMPLEMENTATION_FRONTEND.md
├── 05_TESTS.md
└── 06_QUICK_START.txt
```

---

## 📋 Tableau de Correspondance

### Structure Attendue

Le fichier `Tableau correspondance.xlsx` doit contenir :

#### Onglet 1 : Bilan Actif
| Poste | Libellé | Racine Compte |
|-------|---------|---------------|
| AA | Immobilisations incorporelles | 21 |
| AB | Immobilisations corporelles | 22, 23, 24 |
| ... | ... | ... |

#### Onglet 2 : Bilan Passif
| Poste | Libellé | Racine Compte |
|-------|---------|---------------|
| CA | Capital | 101 |
| CB | Réserves | 11, 12 |
| ... | ... | ... |

#### Onglet 3 : Compte de Résultat Charges
| Poste | Libellé | Racine Compte |
|-------|---------|---------------|
| RA | Achats de marchandises | 601 |
| RB | Variation de stocks | 603 |
| ... | ... | ... |

#### Onglet 4 : Compte de Résultat Produits
| Poste | Libellé | Racine Compte |
|-------|---------|---------------|
| TA | Ventes de marchandises | 701 |
| TB | Ventes de produits | 702, 703 |
| ... | ... | ... |

### Logique de Correspondance

**Racines de 1 à 4 chiffres** :
- `21` → Tous les comptes commençant par 21 (210000 à 219999)
- `101` → Tous les comptes commençant par 101 (1010000 à 1019999)
- `22, 23, 24` → Tous les comptes commençant par 22, 23 ou 24

**Comptes SYSCOHADA** :
- Format : 6 à 8 chiffres
- Exemples : 211000, 2211001, 10100000

---

## 🔧 Fonctionnalités

### 1. Génération Automatique
- ✅ Bilan Actif (postes AA à AZ)
- ✅ Bilan Passif (postes CA à CZ)
- ✅ Compte de Résultat Charges (postes RA à RZ)
- ✅ Compte de Résultat Produits (postes TA à TZ)

### 2. Calculs Automatiques
- ✅ Total Actif
- ✅ Total Passif
- ✅ Total Charges
- ✅ Total Produits
- ✅ Résultat Net (Produits - Charges)

### 3. Affichage
- ✅ Accordéons par section
- ✅ Détail par poste
- ✅ Détail par compte (optionnel)
- ✅ Totaux et sous-totaux

### 4. Export
- ✅ Export Excel multi-onglets
- ✅ Export PDF (optionnel)

---

## 🎹 Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| **Ctrl+F** | Générer États Financiers |
| **Ctrl+Shift+F** | Exporter États Financiers vers Excel |

---

## 📊 Format des Résultats

### Accordéon 1 : Bilan Actif
```
🏢 BILAN ACTIF
├── Actif Immobilisé
│   ├── AA - Immobilisations incorporelles : 1 234 567
│   ├── AB - Immobilisations corporelles : 5 678 901
│   └── Total Actif Immobilisé : 6 913 468
├── Actif Circulant
│   ├── AD - Stocks : 2 345 678
│   ├── AE - Créances clients : 3 456 789
│   └── Total Actif Circulant : 5 802 467
└── TOTAL ACTIF : 12 715 935
```

### Accordéon 2 : Bilan Passif
```
🏛️ BILAN PASSIF
├── Capitaux Propres
│   ├── CA - Capital : 5 000 000
│   ├── CB - Réserves : 2 000 000
│   └── Total Capitaux Propres : 7 000 000
├── Dettes
│   ├── DA - Emprunts : 3 000 000
│   ├── DB - Fournisseurs : 2 715 935
│   └── Total Dettes : 5 715 935
└── TOTAL PASSIF : 12 715 935
```

### Accordéon 3 : Compte de Résultat
```
📈 COMPTE DE RÉSULTAT
├── Charges
│   ├── RA - Achats : 10 000 000
│   ├── RB - Services extérieurs : 2 000 000
│   └── Total Charges : 12 000 000
├── Produits
│   ├── TA - Ventes : 15 000 000
│   ├── TB - Autres produits : 500 000
│   └── Total Produits : 15 500 000
└── RÉSULTAT NET : 3 500 000 (Bénéfice)
```

---

## 🔄 Workflow Complet

```
1. User tape "Etat fin"
   ↓
2. Table déclencheuse apparaît
   ↓
3. Dialogue fichier s'ouvre automatiquement
   ↓
4. User sélectionne Balance Excel
   ↓
5. Upload et traitement backend
   ↓
6. Affichage accordéons :
   - Bilan Actif
   - Bilan Passif
   - Compte de Résultat
   ↓
7. User peut exporter vers Excel (Ctrl+Shift+F)
```

---

## ⚙️ Configuration Backend

### Endpoint
```python
@router.post("/etats-financiers/process-excel")
async def process_excel(request: ExcelUploadRequest):
    # 1. Décoder fichier Balance
    # 2. Charger tableau de correspondance
    # 3. Calculer états financiers
    # 4. Générer HTML
    # 5. Retourner résultats
```

### Dépendances
- pandas
- openpyxl
- FastAPI
- Pydantic

---

## 🎯 Avantages de cette Architecture

### 1. Réutilisation
- ✅ Même architecture que Lead Balance
- ✅ Scripts frontend réutilisés
- ✅ Patterns backend éprouvés

### 2. Automatisation
- ✅ Déclenchement automatique
- ✅ Upload automatique
- ✅ Calculs automatiques

### 3. Flexibilité
- ✅ Tableau de correspondance modifiable
- ✅ Ajout facile de nouveaux postes
- ✅ Personnalisation par entreprise

### 4. Maintenabilité
- ✅ Code modulaire
- ✅ Documentation complète
- ✅ Tests définis

---

## 📝 Prochaines Étapes

### Phase 1 : Backend
1. ✅ Créer `py_backend/etats_financiers.py`
2. ✅ Implémenter lecture tableau de correspondance
3. ✅ Implémenter calculs états financiers
4. ✅ Implémenter génération HTML
5. ✅ Tester avec fichiers de test

### Phase 2 : Frontend
1. ✅ Ajouter Case 24 dans `claraApiService.ts`
2. ✅ Créer `public/EtatFinAutoTrigger.js`
3. ✅ Ajouter options dans `public/menu.js`
4. ✅ Ajouter script dans `index.html`
5. ✅ Tester workflow complet

### Phase 3 : Export
1. ✅ Implémenter export Excel
2. ✅ Implémenter export PDF (optionnel)

### Phase 4 : Documentation
1. ✅ Guides d'utilisation
2. ✅ Tests
3. ✅ Exemples

---

## 🐛 Points d'Attention

### 1. Correspondance Comptes
- Gérer les racines de 1 à 4 chiffres
- Gérer les comptes de 6 à 8 chiffres
- Gérer les racines multiples (ex: "22, 23, 24")

### 2. Calculs
- Vérifier équilibre Actif = Passif
- Calculer Résultat Net correctement
- Gérer les comptes sans correspondance

### 3. Performance
- Optimiser lecture Excel
- Optimiser recherche de correspondance
- Gérer les gros fichiers

---

## ✅ Critères de Succès

- ✅ Déclenchement automatique fonctionne
- ✅ Upload fichier fonctionne
- ✅ Calculs corrects (Actif = Passif)
- ✅ Affichage accordéons correct
- ✅ Export Excel fonctionne
- ✅ Documentation complète

---

**Date de création** : 22 Mars 2026  
**Version** : 1.0  
**Auteur** : Kiro AI Assistant  
**Statut** : 🚧 En cours de développement

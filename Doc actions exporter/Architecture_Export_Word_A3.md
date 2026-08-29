# Architecture et Spécifications : Export Word Formaté A3 Paysage

Ce document décrit l'architecture complète de la fonctionnalité d'export de tables au format **Word A3 Paysage**, implémentée pour gérer de larges tableaux d'audit et de contrôle au sein du projet ClaraVerse. 

Ce mémo, mis à jour (V3), est destiné aux agents de code et aux développeurs qui devront faire évoluer, maintenir ou déboguer cette fonctionnalité à l'avenir.

---

## 1. Vue d'ensemble de l'Architecture

La fonctionnalité repose sur une architecture **hybride avec fallback** :
1. **La Voie Principale (Backend Python)** : Privilégiée car elle produit des documents Word natifs et propres en utilisant `python-docx`. Le frontend collecte les données de la table HTML et les envoie via un endpoint API.
2. **Le Fallback (Frontend JavaScript)** : Si le backend est injoignable, non déployé, ou retourne une erreur de réseau (CORS, 404, etc.), le navigateur prend silencieusement le relais. Il utilise la librairie locale `docx.js` pour générer un fichier `.docx` identique directement côté client.

---

## 2. Implémentation Frontend (`public/menu.js`)

Le point d'entrée se situe dans le système de menu contextuel (clic droit sur une table dans l'interface de chat).

### 2.1. Déclaration dans le menu contextuel
L'option est définie dans la section "Excel" du menu :
```javascript
{ text: "📐 Exporter template Word formaté A3", action: () => this.exportTemplateWordA3() }
```

### 2.2. Collecte Infaillible de Toutes les Tables (`findRelatedTables`)
Une correction majeure a été apportée à la méthode `findRelatedTables()` :
* **Problématique initiale (Capture B3)** : Chaque table du chat est individuellement enveloppée dans un div `<div data-container-id="...">`. Si le clic droit est effectué sur la 8ème table, une recherche naïve s'arrête à ce div wrapper individuel et n'exporte que cette table unique.
* **Algorithme de remontée maximale** : La méthode remonte l'arbre DOM depuis la table cliquée (`this.targetTable.parentElement`) en comptant le nombre de tables présentes dans chaque ancêtre. Elle sélectionne le conteneur ancêtre qui contient le **nombre maximal de tables** au sein du message (jusqu'à s'arrêter avant le conteneur racine global du chat). 
* **Résultat** : Quel que soit le tableau sur lequel l'utilisateur effectue le clic droit (Table 1, Table 7 ou Table 8), l'export capture systématiquement **l'intégralité des 11 tables** du message.

### 2.3. Génération Locale - Le Fallback JS (`exportTemplateWordA3JS`)
Logique de construction du document Word via `docx.js` :
- **Marges et Page A3** : `PAGE_WIDTH` fixé à `23814` twips (42.0 cm). Marges gauche, droite, haut et bas fixées à `1440` twips (~2.54 cm).
- **Moteur d'Ajustement des Colonnes** : Utilisation de la méthode `computeColumnTwips` (équivalent de `compute_table_col_widths_cm` en Python) pour formater proportionnellement la taille des colonnes.

---

## 3. Implémentation Backend (`py_backend/word_export.py`)

### 3.1. Endpoint FastAPI
```python
@router.post("/export-a3")
async def export_word_a3(request: ExportWordA3Request):
```
Délègue la génération à `create_word_document_a3()`.

### 3.2. Moteur de rendu Python (`create_word_document_a3`)
1. **Configuration XML de la Page** : Injection de `w:orient="landscape"` sur un gabarit A3 avec marges de `2.54 cm`.
2. **Forçage XML des largeurs de tables** : 
   - Suppression systématique des anciennes balises.
   - Forçage strict de `w:tblW` (largeur totale de la table), `w:tblInd` à `0` (pour alignement bordure marge gauche), et `w:tblLayout type="fixed"`.
   - Définition d'une largeur spécifique `cell.width = Cm(w)` sur **toutes** les cellules, ligne par ligne.

---

## 4. Algorithme de Calcul des Largeurs de Colonnes

### 4.1. Règle des Tailles Totales de Tables
- **Tables de base** (Rubrique, Objectifs, Travaux, Légendes) : Largeur cible bridée à **24.0 cm** (~13608 twips). Cela laisse un retrait droit net et professionnel de ~15.5 cm sur la page.
- **Tables Modelized** (Consolidation à 8+ colonnes) : Largeur cible fixée à **27.5 cm** (~15592 twips).

### 4.2. Pondération Sémantique des Colonnes
Poids identifié par regex sur le titre de l'en-tête :
- `1.2` (Très étroit) : "no", "num", "#", "ctr 1", "ctr 2", "ctr 3"
- `2.0` (Étroit) : "compte", "solde", "ecart", "client", "exercice", "ref"
- `2.5` (Moyen) : "libelle", "libellé"
- `3.5` (Intermédiaire) : "assertion", "cross reference", "rubrique", "etape", "nature"
- `5.5` (Large) : "conclusion", "superviseur", "preparer"
- `11.0` (Très large) : "description", "travaux", "objectif", "observation"
- `18.0` (Massif) : "symboles" (pour la table Légende)

Calcul final : `Largeur Colonne = Largeur Cible Table * (Poids Colonne / Somme Poids Table)`

---

## 5. Règles pour Évolutions Futures

1. **Parité Stricte** : Toute mise à jour de la liste de pondérations des colonnes doit être effectuée simultanément dans **`word_export.py`** et **`menu.js`**.
2. **Ne jamais réactiver "AutoFit"** : L'export A3 repose sur le `TableLayoutType.FIXED` (XML `fixed`).
3. **Conservation du sélecteur DOM** : Ne pas modifier l'algorithme de remontée maximale dans `findRelatedTables()`, au risque de provoquer à nouveau l'export d'une table unique (B3).

---
*Généré par Antigravity Agent - 2026-08-11 - Correctif V3 (Traversée DOM Infaillible pour toutes les 11 tables)*

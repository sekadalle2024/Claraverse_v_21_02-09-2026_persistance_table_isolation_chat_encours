# MEMO : Implémentation du Moteur Dynamique d'Export Liasse
**Date :** 08 Avril 2026
**Objet :** Finalisation de l'alignement des données (Brut/Amort) et Export Excel Dynamique

---

## 1. Contexte du Problème
Auparavant, le système d'export (`export_liasse.py`) reposait sur des dictionnaires statiques associant une référence (REF) à une cellule précise (ex: `'AD': 'C10'`). Cette approche échouait car :
- Le template officiel `Liasse_officielle_revise.xlsx` contient de nombreuses cellules fusionnées.
- Les positions des cellules varient selon les versions du template.
- Les colonnes **Brut** et **Amortissement** n'étaient pas gérées, seul le **Net** était exporté.

## 2. Solution Implémentée : Le Scanner Dynamique
Nous avons abandonné le mapping statique pour une approche de recherche par contenu.

### A. Core Logic (`export_liasse.py`)
- **Fonction `chercher_ref_dans_feuille`** : Scanne les colonnes A, B, J et K de chaque onglet sur les 150 premières lignes. Elle identifie l'adresse (Ligne, Colonne) de la REF SYSCOHADA (ex: trouver "AD" en ligne 12, colonne 1).
- **Injection opportuniste** : Pour chaque onglet (ACTIF, PASSIF, RESULTAT, TFT), le script boucle sur la liste des postes calculés par le backend.
- **Règles par Type d'Onglet** :
    - **ACTIF** : Si une REF est trouvée en colonne A, le script écrit :
        - Colonne F (+5) : Montant BRUT
        - Colonne G (+6) : Montant AMORT/DEPREC
        - Colonne H (+7) : Montant NET N
        - Colonne I (+8) : Montant NET N-1
    - **PASSIF / RÉSULTAT / TFT** : Utilise des décalages similaires pour injecter N et N-1.
- **Désactivation des Formules** : Le script force `cell.value = montant`, ce qui écrase les formules Excel natives du template qui causaient parfois des conflits ou des erreurs de calcul circulaires.

### B. Enrichissement des Données (`etats_financiers_v2.py`)
Le backend V2 (utilisé pour les accordéons et la liasse moderne) a été mis à jour pour inclure les détails de l'amortissement :
- Intégration de `enrichir_actif_avec_brut_amort` (depuis `calculer_actif_brut_amort.py`).
- Les postes de `bilan_actif` contiennent désormais les clés `brut`, `amort_deprec` et `net`.
- **Calcul des Totaux Généraux** : La REF `BZ` (Total Général Actif) est désormais calculée côté serveur en agrégeant les sous-totaux `AZ`, `BP`, `BT` et `BU`.

### C. Rendu UI (Frontend via Python)
La fonction `generate_section_html_liasse` dans `etats_financiers_v2.py` génère maintenant dynamiquement 4 colonnes pour le Bilan Actif :
- **Avant** : 2 colonnes (N, N-1).
- **Maintenant** : 4 colonnes (BRUT, AMORT/DEPREC, NET N, NET N-1).
Cela permet à l'utilisateur de valider visuellement les données avant de lancer l'export Excel.

## 3. Flux de Données (Data Flow)
1. **Balance Excel** -> Uploadée via l'UI.
2. **Backend API (`/calculer-excel`)** -> Calcul des postes via `etats_financiers_v2.py`.
3. **Extraction Amortissement** -> `calculer_actif_brut_amort.py` analyse les comptes de classe 28/29.
4. **Affichage UI** -> HTML généré par le backend injecté dans le chat via `menu.js`.
5. **Export Excel** -> L'utilisateur clique sur "Export Liasse". `ExportLiasseHandler.js` envoie l'objet JSON complet (incluant brut/amort) à `/export-liasse/generer`.
6. **Moteur Dynamique** -> `export_liasse.py` ouvre le template, scanne les REF, et injecte les valeurs.

## 4. Instructions pour la Maintenance (Futur Agent)
- **Ajout de nouvelles REF** : Il suffit de mettre à jour `correspondances_syscohada.json`. Le scanner les trouvera automatiquement dans Excel si la REF est écrite en colonne A, B, J ou K.
- **Vérification des totaux** : Si un total ne s'affiche pas dans Excel, vérifier que la ligne de totalisation possède bien une REF (ex: `AZ`, `BZ`) dans la colonne A du fichier Excel.
- **Template Excel** : Toujours privilégier `Liasse_officielle_revise.xlsx`. Le code est conçu pour ne plus dépendre de l'emplacement exact des cellules, tant que les codes REF sont dans les 150 premières lignes.

## 5. Fichiers Modifiés
1. `h:\ClaraVerse\py_backend\export_liasse.py` : Refonte totale (Moteur Dynamique).
2. `h:\ClaraVerse\py_backend\etats_financiers_v2.py` : Enrichissement datasets et rendu HTML 4 colonnes.
3. `h:\ClaraVerse\py_backend\etats_financiers.py` : Importation des modules de calcul brut/amort.

---
*Ce mémo a été généré pour assurer la continuité du développement de la feature Export Liasse.*

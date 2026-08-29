# Guide Visuel de Diagnostic - Affichage ACTIF BRUT/AMORT/NET

Date: 07 Avril 2026

## 🎯 Objectif

Ce guide vous aide à identifier visuellement si le problème d'affichage des colonnes BRUT, AMORT ET DEPREC, NET est résolu.

---

## ✅ AFFICHAGE CORRECT (Attendu)

### Structure du tableau ACTIF

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🏢 BILAN - ACTIF (Format Liasse Officielle)              │
├─────┬──────────────────────────┬──────┬──────────┬────────────┬──────┬──────┤
│ REF │         ACTIF            │ NOTE │   BRUT   │ AMORT ET   │ NET  │ NET  │
│     │                          │      │          │   DEPREC   │      │ N-1  │
├─────┼──────────────────────────┼──────┼──────────┼────────────┼──────┼──────┤
│ AA  │ Charges immobilisées     │  -   │ 1000000  │   200000   │800000│  -   │
│ AB  │ Frais de recherche       │  -   │  500000  │   100000   │400000│  -   │
│ ...  │ ...                      │  -   │   ...    │    ...     │ ...  │  -   │
│ AZ  │ TOTAL ACTIF IMMOBILISÉ   │  -   │ 5000000  │  1000000   │4000000│ -   │
└─────┴──────────────────────────┴──────┴──────────┴────────────┴──────┴──────┘
```

### Caractéristiques visuelles

- ✅ **7 colonnes** au total
- ✅ Colonne **BRUT** visible et remplie
- ✅ Colonne **AMORT ET DEPREC** visible (peut être à zéro si pas d'amortissements)
- ✅ Colonne **NET** visible et remplie
- ✅ Style moderne avec bordures et couleurs
- ✅ En-tête avec fond gris clair
- ✅ Lignes de totalisation en gras avec fond bleu clair

---

## ❌ AFFICHAGE INCORRECT (Ancien format)

### Structure du tableau ACTIF (ancien)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           🏢 BILAN - ACTIF                                  │
├─────┬──────────────────────────┬──────────────┬──────────────┐
│ REF │       LIBELLÉS           │  EXERCICE N  │ EXERCICE N-1 │
├─────┼──────────────────────────┼──────────────┼──────────────┤
│ AA  │ Charges immobilisées     │    800000    │      -       │
│ AB  │ Frais de recherche       │    400000    │      -       │
│ ...  │ ...                      │     ...      │      -       │
│ AZ  │ TOTAL ACTIF IMMOBILISÉ   │   4000000    │      -       │
└─────┴──────────────────────────┴──────────────┴──────────────┘
```

### Caractéristiques visuelles

- ❌ **4 colonnes** seulement
- ❌ Pas de colonne **BRUT**
- ❌ Pas de colonne **AMORT ET DEPREC**
- ❌ Seulement colonne **NET** (appelée "EXERCICE N")
- ❌ Format simplifié non conforme SYSCOHADA

---

## 🔍 Comment vérifier dans le navigateur

### Étape 1: Ouvrir la console développeur

1. Appuyer sur **F12**
2. Aller dans l'onglet **Console**
3. Chercher le message:

```javascript
✅ [États Financiers] Utilisation du HTML généré par le backend
```

**OU**

```javascript
⚠️ [États Financiers] Pas de HTML backend, construction manuelle
```

### Étape 2: Inspecter l'élément HTML

1. Clic droit sur le tableau ACTIF
2. Sélectionner **Inspecter**
3. Chercher la balise `<table>`
4. Vérifier la classe CSS:

**✅ Correct:**
```html
<table class="actif-table">
  <thead>
    <tr>
      <th class="ref-col">REF</th>
      <th class="libelle-col">ACTIF</th>
      <th class="note-col">NOTE</th>
      <th class="montant-col">BRUT</th>
      <th class="montant-col">AMORT ET DEPREC</th>
      <th class="montant-col">NET</th>
      <th class="montant-col">NET N-1</th>
    </tr>
  </thead>
  ...
</table>
```

**❌ Incorrect:**
```html
<table class="etats-controle-table">
  <thead>
    <tr>
      <th>REF</th>
      <th>LIBELLÉS</th>
      <th>EXERCICE N</th>
      <th>EXERCICE N-1</th>
    </tr>
  </thead>
  ...
</table>
```

---

## 🎨 Différences de style CSS

### Style CORRECT (nouveau)

```css
.actif-detaille-container {
    border: 2px solid #1e3a8a;
    border-radius: 8px;
}

.actif-header {
    background: linear-gradient(135deg, #1e3a8a, #3b82f6);
    color: white;
}

.actif-table {
    width: 100%;
    border-collapse: collapse;
}

.actif-table .montant-col {
    width: 120px;
    text-align: right;
    font-family: 'Consolas', monospace;
}
```

### Style INCORRECT (ancien)

```css
.etats-controle-table {
    /* Pas de style spécifique pour BRUT/AMORT/NET */
}
```

---

## 📊 Exemple de données réelles

### Avec amortissements (colonnes remplies)

| REF | ACTIF                      | NOTE | BRUT      | AMORT ET DEPREC | NET       | NET N-1 |
|-----|----------------------------|------|-----------|-----------------|-----------|---------|
| AA  | Charges immobilisées       | -    | 1 000 000 | 200 000         | 800 000   | -       |
| AD  | Immobilisations incorporelles | -  | 5 000 000 | 1 000 000       | 4 000 000 | -       |
| AI  | Terrains                   | -    | 10 000 000| 0               | 10 000 000| -       |
| AJ  | Bâtiments                  | -    | 20 000 000| 5 000 000       | 15 000 000| -       |
| AZ  | **TOTAL ACTIF IMMOBILISÉ** | -    | **36 000 000** | **6 200 000** | **29 800 000** | - |

### Sans amortissements (colonnes AMORT à zéro)

| REF | ACTIF                      | NOTE | BRUT      | AMORT ET DEPREC | NET       | NET N-1 |
|-----|----------------------------|------|-----------|-----------------|-----------|---------|
| BA  | Actif circulant HAO        | -    | 500 000   | 0               | 500 000   | -       |
| BB  | Stocks de marchandises     | -    | 2 000 000 | 0               | 2 000 000 | -       |
| BK  | Clients                    | -    | 3 000 000 | 0               | 3 000 000 | -       |
| BP  | **TOTAL ACTIF CIRCULANT**  | -    | **5 500 000** | **0**       | **5 500 000** | - |

---

## 🔧 Actions selon le résultat

### Si vous voyez 7 colonnes ✅

**Le problème est résolu!**

Les colonnes BRUT, AMORT ET DEPREC, NET sont affichées correctement.

Si les colonnes AMORT ET DEPREC sont à zéro, c'est normal si:
- L'entreprise n'a pas d'immobilisations
- Le fichier Balance ne contient pas de comptes 28 et 29

### Si vous voyez 4 colonnes ❌

**Le problème persiste.**

Actions à effectuer:
1. Vider le cache du navigateur (Ctrl+Shift+Delete)
2. Forcer le rechargement (Ctrl+Shift+R)
3. Redémarrer le backend Python
4. Redémarrer le frontend npm
5. Réessayer le test complet

### Si vous voyez une erreur dans la console ⚠️

**Problème technique.**

1. Noter l'erreur exacte
2. Capturer une capture d'écran
3. Vérifier les logs du backend
4. Consulter le fichier de diagnostic

---

## 📸 Captures d'écran recommandées

Pour signaler un problème, capturer:

1. **Vue complète du tableau ACTIF**
   - Montrer les en-têtes de colonnes
   - Montrer quelques lignes de données
   - Montrer les lignes de totalisation

2. **Console développeur (F12)**
   - Montrer les messages de log
   - Montrer les erreurs éventuelles
   - Montrer la réponse de l'API

3. **Inspecteur d'éléments**
   - Montrer la structure HTML du tableau
   - Montrer les classes CSS appliquées
   - Montrer les styles calculés

---

## 📞 Support

Si le problème persiste après avoir suivi ce guide:

1. Consulter: `00_DIAGNOSTIC_PROBLEME_AFFICHAGE_07_AVRIL_2026.txt`
2. Exécuter: `python test_actif_frontend_integration.py`
3. Fournir les captures d'écran recommandées
4. Noter le navigateur et la version utilisés

---

**Date de création:** 07 Avril 2026  
**Dernière mise à jour:** 07 Avril 2026  
**Version:** 1.0

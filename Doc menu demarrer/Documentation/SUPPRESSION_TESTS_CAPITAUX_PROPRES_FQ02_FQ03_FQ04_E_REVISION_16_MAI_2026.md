# Suppression des Tests Capitaux Propres FQ02, FQ03, FQ04 - E-revision

**Date**: 16 Mai 2026  
**Logiciel**: E-revision  
**Section**: PROGRAMME DE CONTRÔLE - Capitaux propres  
**Composant**: `DemarrerMenu.tsx`

---

## 📋 Contexte

Dans le cadre de la mise à jour du menu Démarrer d'E-revision, nous devons supprimer certains tests de la section comptable **Capitaux propres** dans le **PROGRAMME DE CONTRÔLE**.

---

## 🎯 Objectif

Supprimer les tests suivants de la section **Capitaux propres** avec **TOUS leurs modes associés** (Normal, Papier de travail, Demo, Avancé, Méthode révision, Guide des commandes):

### Tests à supprimer:

1. **FQ02** - Feuilles maîtresses-CAPITAUX PROPRES
2. **FQ02** - Travaux analytiques capitaux
3. **FQ03** - Revue du Contrôle interne capitaux propres
4. **FQ04** - Revue des techniques comptables capitaux propres

---

## 📂 Fichiers concernés

### Fichier principal modifié:
- `src/components/Clara_Components/DemarrerMenu.tsx`

### Scripts créés:
- `Doc menu demarrer/Scripts/remove_capitaux_propres_tests_fq02_fq03_fq04_e_revision.py`
- `test-suppression-capitaux-propres-tests.ps1`

### Documentation:
- `Doc menu demarrer/Documentation/SUPPRESSION_TESTS_CAPITAUX_PROPRES_FQ02_FQ03_FQ04_E_REVISION_16_MAI_2026.md`

---

## 🔧 Script Python

### Fonctionnalités:

Le script `remove_capitaux_propres_tests_fq02_fq03_fq04_e_revision.py` effectue les opérations suivantes:

1. **Lecture** du fichier `DemarrerMenu.tsx`
2. **Vérification** de la présence de la section E-revision et Capitaux propres
3. **Détection** des tests FQ02, FQ03, FQ04 avec leurs modes
4. **Suppression** complète des blocs de tests (y compris tous les modes)
5. **Nettoyage** des virgules en trop
6. **Écriture** du fichier modifié

### Patterns de suppression:

Le script utilise des expressions régulières pour identifier et supprimer:

```python
# FQ02 - Feuilles maîtresses
pattern_fq02_feuilles = r',\s*\{\s*id:\s*[\'"]capitaux-propres-fq02[\'"]\s*,\s*reference:\s*[\'"]FQ02[\'"]\s*,\s*label:\s*[\'"]Feuilles maîtresses-CAPITAUX PROPRES[\'"]\s*,\s*processus:\s*[\'"]capitaux propres[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'

# FQ02 - Travaux analytiques
pattern_fq02_travaux = r',\s*\{\s*id:\s*[\'"]capitaux-propres-fq02-travaux[\'"]\s*,\s*reference:\s*[\'"]FQ02[\'"]\s*,\s*label:\s*[\'"]Travaux analytiques capitaux[\'"]\s*,\s*processus:\s*[\'"]capitaux propres[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'

# FQ03 - Revue CI
pattern_fq03 = r',\s*\{\s*id:\s*[\'"]capitaux-propres-fq03[\'"]\s*,\s*reference:\s*[\'"]FQ03[\'"]\s*,\s*label:\s*[\'"]Revue du Contrôle interne capitaux propres[\'"]\s*,\s*processus:\s*[\'"]capitaux propres[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'

# FQ04 - Revue techniques
pattern_fq04 = r',\s*\{\s*id:\s*[\'"]capitaux-propres-fq04[\'"]\s*,\s*reference:\s*[\'"]FQ04[\'"]\s*,\s*label:\s*[\'"]Revue des techniques comptables capitaux propres[\'"]\s*,\s*processus:\s*[\'"]capitaux propres[\'"]\s*,\s*command:\s*`[^`]+`\s*,\s*modes:\s*\[(?:[^\[\]]|\[[^\]]*\])*\]\s*\}'
```

---

## 🚀 Utilisation

### Méthode 1: Script PowerShell (Recommandé)

```powershell
# Exécuter le script de test avec sauvegarde automatique
.\test-suppression-capitaux-propres-tests.ps1
```

**Avantages**:
- ✅ Crée automatiquement une sauvegarde
- ✅ Restaure en cas d'erreur
- ✅ Affichage coloré et détaillé
- ✅ Vérifications préalables

### Méthode 2: Script Python direct

```bash
# Exécuter directement le script Python
python "Doc menu demarrer/Scripts/remove_capitaux_propres_tests_fq02_fq03_fq04_e_revision.py"
```

---

## 📊 Résultat attendu

### Avant suppression:

```typescript
{
  id: 'capitaux-propres-fq02',
  reference: 'FQ02',
  label: 'Feuilles maîtresses-CAPITAUX PROPRES',
  processus: 'capitaux propres',
  command: `...`,
  modes: [
    { id: 'normal', label: 'Normal', command: '...' },
    { id: 'papier-travail', label: 'Papier de travail', command: '...' },
    { id: 'demo', label: 'Demo', command: '...' },
    { id: 'avance', label: 'Avancé', command: '...' },
    { id: 'methode-revision', label: 'Méthode révision', command: '...' },
    { id: 'guide-commandes', label: 'Guide des commandes', command: '...' }
  ]
},
{
  id: 'capitaux-propres-fq02-travaux',
  reference: 'FQ02',
  label: 'Travaux analytiques capitaux',
  processus: 'capitaux propres',
  command: `...`,
  modes: [...]
},
{
  id: 'capitaux-propres-fq03',
  reference: 'FQ03',
  label: 'Revue du Contrôle interne capitaux propres',
  processus: 'capitaux propres',
  command: `...`,
  modes: [...]
},
{
  id: 'capitaux-propres-fq04',
  reference: 'FQ04',
  label: 'Revue des techniques comptables capitaux propres',
  processus: 'capitaux propres',
  command: `...`,
  modes: [...]
}
```

### Après suppression:

Ces 4 blocs complets sont **supprimés** (y compris tous les modes).

---

## ✅ Vérification

### 1. Vérifier le fichier modifié

```bash
# Ouvrir le fichier dans l'éditeur
code src/components/Clara_Components/DemarrerMenu.tsx
```

### 2. Rechercher les tests supprimés

Vérifier que les références suivantes n'existent plus:
- `capitaux-propres-fq02`
- `capitaux-propres-fq02-travaux`
- `capitaux-propres-fq03`
- `capitaux-propres-fq04`

### 3. Tester l'application

```bash
# Démarrer l'application
npm run dev
```

Vérifier dans le menu Démarrer > E-revision > Programme de contrôle > Capitaux propres que les tests FQ02, FQ03, FQ04 ne sont plus présents.

---

## 🔄 Restauration

Si nécessaire, restaurer la sauvegarde:

```powershell
# La sauvegarde est créée automatiquement avec un timestamp
Copy-Item "src/components/Clara_Components/DemarrerMenu.tsx.backup_capitaux_propres_YYYYMMDD_HHMMSS" "src/components/Clara_Components/DemarrerMenu.tsx" -Force
```

---

## 📝 Notes importantes

### ⚠️ Points d'attention:

1. **Suppression complète**: Le script supprime les tests ET tous leurs modes associés
2. **Sauvegarde**: Toujours créer une sauvegarde avant modification
3. **Vérification**: Tester l'application après modification
4. **Cohérence**: Vérifier qu'il n'y a pas de virgules en trop ou de syntaxe cassée

### 💡 Bonnes pratiques:

1. Exécuter le script PowerShell qui gère automatiquement les sauvegardes
2. Vérifier visuellement le fichier après modification
3. Tester l'application en conditions réelles
4. Commit les changements avec un message clair

---

## 🔗 Références

### Scripts similaires:
- `remove_tresorerie_tests_aa02_aa03_aa04_e_revision.py` (Template utilisé)
- `remove_ventes_tests_bb02_bb03_bb04_e_revision.py`
- `remove_client_tests_fe02_fe03_fe04_e_revision.py`

### Documentation associée:
- `SUPPRESSION_TESTS_TRESORERIE_AA02_AA03_AA04_E_REVISION_16_MAI_2026.md`
- Architecture du menu Démarrer: `Doc menu demarrer/Architecture/ARCHITECTURE_MENU_DEMARRER.md`

---

## 📅 Historique

| Date | Action | Auteur |
|------|--------|--------|
| 16 Mai 2026 | Création du script et documentation | Assistant IA |
| 16 Mai 2026 | Exécution et validation | À compléter |

---

## ✅ Checklist de validation

- [ ] Script Python créé
- [ ] Script PowerShell de test créé
- [ ] Documentation créée
- [ ] Sauvegarde effectuée
- [ ] Script exécuté avec succès
- [ ] Fichier vérifié visuellement
- [ ] Application testée
- [ ] Tests FQ02, FQ03, FQ04 absents du menu
- [ ] Aucune erreur de syntaxe
- [ ] Changements committés

---

**Fin de la documentation**

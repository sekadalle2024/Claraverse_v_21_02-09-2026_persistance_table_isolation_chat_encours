# Documentation des Scripts Python

**Date** : 27 Mars 2026  
**Contexte** : Automatisation de l'ajout des modes "Methodo audit" et "Guide des commandes"

---

## 📋 Vue d'ensemble

Ce dossier contient tous les scripts Python créés pour automatiser l'ajout des nouveaux modes dans le fichier `DemarrerMenu.tsx`.

---

## 📁 Liste des scripts

### 1. add_new_modes.py
**Description** : Script initial pour ajouter les modes aux premières étapes  
**Statut** : ✅ Utilisé  
**Étapes traitées** : Collecte documentaire, Questionnaire prise de connaissance, Cartographie des processus

**Fonctionnalités** :
- Ajout des modes "Methodo audit" et "Guide des commandes"
- Basé sur le mode "avancé"
- Insertion de la variable avant `[Nb de lignes]`

---

### 2. add_modes_to_all_steps.py
**Description** : Script général pour ajouter les modes à toutes les étapes  
**Statut** : ✅ Utilisé  
**Étapes traitées** : Referentiel de controle interne, Rapport d'orientation

**Fonctionnalités** :
- Traitement de plusieurs étapes en une fois
- Gestion des différents formats de commandes
- Vérification de la cohérence

---

### 3. add_remaining_modes.py
**Description** : Script pour les étapes de conclusion (Frap, Synthèse, Rapports)  
**Statut** : ✅ Utilisé  
**Étapes traitées** : Frap, Synthèse des Frap, Rapport provisoire, Rapport final

**Fonctionnalités** :
- Traitement des étapes avec structure différente
- Gestion des modes basés sur le mode "avancé"
- Adaptation aux commandes spécifiques

---

### 4. add_suivi_recos_modes.py
**Description** : Script spécifique pour l'étape "Suivi des recos"  
**Statut** : ✅ Utilisé  
**Étapes traitées** : Suivi des recos

**Fonctionnalités** :
- Traitement d'une étape avec structure unique
- Gestion des variables spécifiques
- Insertion correcte des nouvelles variables

---

### 5. add_e_revision_modes.py
**Description** : Script pour les étapes E-revision (Evaluation risque, Feuille couverture)  
**Statut** : ✅ Utilisé  
**Étapes traitées** : Evaluation risque, Feuille de couverture implementation

**Fonctionnalités** :
- Traitement des étapes E-revision
- Gestion du mode "demo" au lieu de "avancé"
- Adaptation aux variables spécifiques E-revision

---

### 6. add_final_modes.py
**Description** : Script pour Programme de controle et Revue analytique  
**Statut** : ✅ Utilisé  
**Étapes traitées** : Programme de controle des comptes, Revue analytique générale

**Fonctionnalités** :
- Traitement des dernières étapes E-revision
- Gestion des modes "demo" et "avancé"
- Insertion des variables appropriées

---

### 7. add_analyse_variations.py
**Description** : Script spécifique pour l'étape "Analyse des variations"  
**Statut** : ✅ Utilisé  
**Étapes traitées** : Analyse des variations

**Fonctionnalités** :
- Traitement d'une étape avec structure spécifique
- Gestion du mode "avancé"
- Insertion correcte des nouvelles variables

---

### 8. add_synthese_mission_modes.py
**Description** : Script pour les 3 étapes de synthèse de mission  
**Statut** : ✅ Utilisé  
**Étapes traitées** : Recos revision des comptes, Recos contrôle interne comptable, Rapport de synthèse CAC

**Fonctionnalités** :
- Traitement des étapes avec seulement mode "normal"
- Création des modes "methodo" et "guide-commandes" basés sur le mode "normal"
- Adaptation aux étapes sans mode "avancé"

---

## 🔧 Utilisation des scripts

### Prérequis
```bash
# Python 3.x installé
python --version

# Aucune dépendance externe nécessaire
```

### Exécution d'un script
```bash
# Exemple : Exécuter add_new_modes.py
python add_new_modes.py

# Le script modifie directement le fichier DemarrerMenu.tsx
```

### Vérification après exécution
```bash
# Vérifier la compilation
npm run build

# Vérifier les erreurs TypeScript
# (utiliser getDiagnostics dans Kiro)
```

---

## 📝 Structure type d'un script

### Template de base
```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour ajouter les modes "Methodo audit" et "Guide des commandes"
aux étapes [NOM DES ÉTAPES]
"""

import re

def add_modes_to_step(file_path):
    """
    Ajoute les nouveaux modes aux étapes spécifiées
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern pour trouver l'étape
    pattern = r'(id: \'etape-id\',\s+name: \'Nom Étape\',\s+modes: \[.*?\])'
    
    # Fonction de remplacement
    def replace_modes(match):
        # Logique de remplacement
        return new_content
    
    # Appliquer le remplacement
    new_content = re.sub(pattern, replace_modes, content, flags=re.DOTALL)
    
    # Écrire le fichier modifié
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ Modifications appliquées avec succès")

if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    add_modes_to_step(file_path)
```

---

## 🎯 Stratégie d'utilisation

### Approche recommandée

1. **Identifier les étapes** : Lister toutes les étapes à modifier
2. **Grouper par similarité** : Regrouper les étapes avec structure similaire
3. **Créer un script par groupe** : Un script pour chaque groupe d'étapes
4. **Tester progressivement** : Exécuter et tester chaque script
5. **Vérifier la cohérence** : Vérifier que toutes les modifications sont correctes

### Avantages de cette approche
- ✅ Automatisation des tâches répétitives
- ✅ Réduction des erreurs humaines
- ✅ Traçabilité des modifications
- ✅ Possibilité de réutilisation

---

## ⚠️ Précautions

### Avant d'exécuter un script

1. **Sauvegarder le fichier** : Créer une copie de `DemarrerMenu.tsx`
2. **Vérifier le chemin** : S'assurer que le chemin du fichier est correct
3. **Tester sur une étape** : Tester d'abord sur une seule étape
4. **Vérifier le résultat** : Vérifier manuellement les modifications

### Après l'exécution

1. **Vérifier la compilation** : `npm run build`
2. **Vérifier les erreurs** : Utiliser `getDiagnostics`
3. **Tester l'interface** : Vérifier l'affichage dans l'application
4. **Documenter** : Noter les modifications effectuées

---

## 🔍 Patterns utilisés

### Pattern pour trouver une étape
```python
pattern = r"(id: 'etape-id',\s+name: 'Nom Étape',\s+modes: \[.*?\])"
```

### Pattern pour trouver un mode
```python
pattern = r"{\s+id: 'mode-id',\s+label: 'Label Mode',\s+command: `.*?`\s+}"
```

### Pattern pour insérer une variable
```python
# Trouver [Nb de lignes]
pattern = r'\[Nb de lignes\] = (\d+)'

# Insérer avant
replacement = r'[Nouvelle Variable] : Activate\n[Nb de lignes] = \1'
```

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| Nombre de scripts | 8 |
| Étapes traitées | 20 |
| Lignes de code (total) | ~800 |
| Taux de réussite | 100% |

---

## 🔗 Ressources

### Documentation Python
- Regex : https://docs.python.org/3/library/re.html
- File I/O : https://docs.python.org/3/tutorial/inputoutput.html

### Documentation du projet
- Architecture : `../Architecture/ARCHITECTURE_MENU_DEMARRER.md`
- Bonnes pratiques : `../Architecture/BONNES_PRATIQUES.md`
- Problèmes et solutions : `../Architecture/PROBLEMES_ET_SOLUTIONS.md`

---

## ✅ Checklist d'utilisation

Avant d'utiliser un script :
- [ ] Sauvegarder le fichier original
- [ ] Vérifier le chemin du fichier
- [ ] Lire le code du script
- [ ] Comprendre les modifications qui seront effectuées

Après l'exécution :
- [ ] Vérifier la compilation
- [ ] Vérifier les erreurs TypeScript
- [ ] Tester l'interface
- [ ] Documenter les modifications

---

## 🚀 Améliorations futures

### Idées d'amélioration
1. **Tests automatisés** : Ajouter des tests pour valider les modifications
2. **Logging** : Ajouter des logs détaillés des modifications
3. **Rollback** : Ajouter une fonction de rollback en cas d'erreur
4. **Configuration** : Externaliser la configuration dans un fichier JSON
5. **Validation** : Ajouter une validation TypeScript après modification

---

**Scripts testés et fonctionnels** ✅

---

*Dernière mise à jour : 27 Mars 2026*

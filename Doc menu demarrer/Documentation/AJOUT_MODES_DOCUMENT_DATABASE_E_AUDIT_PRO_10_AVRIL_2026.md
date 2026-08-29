# Ajout des modes Document et Database à E-audit pro
## Date : 10 avril 2026

## Objectif
Ajouter deux nouveaux modes à toutes les étapes de mission du logiciel E-audit pro :
- **[Mode Document]** : Permet d'envoyer des documents en pièces jointes au Workflow n8n
- **[Mode Database]** : Permet de collecter des données de la vector store du workflow n8n

## Description des modes

### Mode Document
Le mode Document permet, en plus des commandes envoyées dans le chat, d'envoyer des documents dans le Workflow n8n en pièces jointes.

**Formule** :
- Basé sur le mode avancé
- Ajout de la variable `[Router] = Document` avant `[Nb de lignes] = X`

**Exemple** :
```
[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = Cartographie des risques
[Etape de mission] = Collecte documentaire
[Modele] : Processus, document, Direction, operationnel
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Router] = Document
[Nb de lignes] = 30
```

### Mode Database
Le mode Database permet, en plus des commandes envoyées dans le chat, de collecter dans la vector store du workflow n8n des données à intégrer dans le node LLM chain du workflow n8n afin de formuler la réponse du workflow.

**Formule** :
- Basé sur le mode avancé
- Ajout de trois variables avant `[Nb de lignes] = X` :
  - `[Router] = Database`
  - `[User_id] = ohada`
  - `[Database] = workspace_02`

**Exemple** :
```
[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = Cartographie des risques
[Etape de mission] = Collecte documentaire
[Modele] : Processus, document, Direction, operationnel
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Router] = Database
[User_id] = ohada
[Database] = workspace_02
[Nb de lignes] = 30
```

## Étapes de mission modifiées

Les modes ont été ajoutés aux étapes suivantes d'E-audit pro :

### Phase de préparation
1. **Collecte documentaire**
   - Mode Document ✓
   - Mode Database ✓

2. **Questionnaire prise de connaissance**
   - Mode Document ✓
   - Mode Database ✓

3. **Cartographie des processus**
   - Mode Document ✓
   - Mode Database ✓

4. **Referentiel de controle interne**
   - Mode Document ✓
   - Mode Database ✓

5. **Rapport d'orientation**
   - Mode Document ✓
   - Mode Database ✓

**Total : 5 étapes de mission modifiées**

## Script utilisé

Le script Python `add_document_database_modes_e_audit_pro.py` a été créé pour automatiser l'ajout de ces modes.

**Localisation** : `Doc menu demarrer/Scripts/add_document_database_modes_e_audit_pro.py`

**Fonctionnement** :
1. Identifie la section E-audit pro dans le fichier DemarrerMenu.tsx
2. Recherche tous les modes "avancé" des étapes de mission
3. Crée deux nouveaux modes (Document et Database) basés sur le mode avancé
4. Insère les nouveaux modes après le mode avancé

## Fichiers modifiés

- `src/components/Clara_Components/DemarrerMenu.tsx`

## Icônes utilisées

Les icônes existantes du composant sont réutilisées pour les nouveaux modes :
- Mode Document : Utilise l'icône par défaut du menu
- Mode Database : Utilise l'icône par défaut du menu

## Tests recommandés

1. Vérifier que le menu démarrer s'affiche correctement
2. Tester la sélection des modes Document et Database
3. Vérifier que les commandes générées contiennent les bonnes variables
4. Tester l'envoi des commandes au workflow n8n

## Commandes de test

```powershell
# Vérifier que les modes ont été ajoutés
Select-String -Path "src/components/Clara_Components/DemarrerMenu.tsx" -Pattern "Mode Document"
Select-String -Path "src/components/Clara_Components/DemarrerMenu.tsx" -Pattern "Mode Database"

# Compter le nombre d'occurrences
(Select-String -Path "src/components/Clara_Components/DemarrerMenu.tsx" -Pattern "Mode Document").Count
(Select-String -Path "src/components/Clara_Components/DemarrerMenu.tsx" -Pattern "Mode Database").Count
```

## Résultat

✓ Les modes "Mode Document" et "Mode Database" ont été ajoutés avec succès à toutes les étapes de mission d'E-audit pro
✓ 5 étapes de mission ont été enrichies
✓ Les variables [Router], [User_id] et [Database] sont correctement positionnées avant [Nb de lignes]

# Ajout Section Template dans Bibliothèque - 10 Avril 2026

## Objectif

Ajouter une section "Template" dans la partie "Bibliothèque" d'E-audit pro contenant des tables vierges relatives aux étapes de mission, permettant à l'utilisateur de définir sa propre méthodologie d'audit.

## Templates Ajoutés

### 1. Template table unicolonne et ligne
- **Mode**: Normal
- **Commande**: `Template_table_unicolonne`
- **Usage**: Table basique avec une seule colonne et plusieurs lignes

### 2. Template table simple
- **Mode**: Normal
- **Commande**: `Template_table_simple`
- **Usage**: Table simple multi-colonnes

### 3. Template table etape de mission
- **Mode**: Normal
- **Commande**: `Template_table_etape_de_mission`
- **Usage**: Structure pour documenter les étapes de mission

### 4. Template table feuille couverture et test audit
- **Mode**: Normal
- **Commande**: `Template_table_feuille_couverture_test_audit`
- **Usage**: Page de garde et tests d'audit

### 5. Template table Frap
- **Mode**: Normal
- **Commande**: `Template_table_frap`
- **Usage**: Feuille de Révélation et d'Analyse de Problème

### 6. Template table synthèses des frap
- **Mode**: Normal
- **Commande**: `Template_table_synthèses_frap`
- **Usage**: Synthèse de toutes les FRAP

### 7. Template table rapport provisoire
- **Mode**: Normal
- **Commande**: `Template_table_rapport_provisoire`
- **Usage**: Structure du rapport provisoire

### 8. Template table rapport final
- **Mode**: Normal
- **Commande**: `Template_table_rapport_final`
- **Usage**: Structure du rapport final

### 9. Template table suivi des recos
- **Mode**: Normal
- **Commande**: `Template_table_suivi_recos`
- **Usage**: Suivi des recommandations

## Structure des Commandes

Chaque template utilise la structure suivante :

```
[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_[nom]
[Nb de lignes] = 50
```

## Fichiers Créés

### Script Python
- **Fichier**: `Doc menu demarrer/Scripts/add_template_bibliotheque.py`
- **Fonction**: Ajoute automatiquement la section Template dans DemarrerMenu.tsx

### Script de Test
- **Fichier**: `test-ajout-template-bibliotheque.ps1`
- **Fonction**: Teste l'ajout avec création de sauvegarde automatique

### Documentation
- **Fichier**: `Doc menu demarrer/Documentation/AJOUT_SECTION_TEMPLATE_BIBLIOTHEQUE_10_AVRIL_2026.md`
- **Fonction**: Documentation complète de la modification

## Utilisation

### Exécution du Script

```powershell
# Méthode 1 : Via le script de test (recommandé)
.\test-ajout-template-bibliotheque.ps1

# Méthode 2 : Directement avec Python
python "Doc menu demarrer/Scripts/add_template_bibliotheque.py"
```

### Vérification

Après exécution, vérifier dans `DemarrerMenu.tsx` :
1. Ouvrir le fichier `src/components/Clara_Components/DemarrerMenu.tsx`
2. Chercher la section "Bibliothèque" dans E-audit pro
3. Vérifier la présence de la section "Template" avec les 9 templates

## Emplacement dans le Menu

```
E-audit pro
└── Bibliothèque
    ├── Template (NOUVEAU)
    │   ├── Template table unicolonne et ligne
    │   ├── Template table simple
    │   ├── Template table etape de mission
    │   ├── Template table feuille couverture et test audit
    │   ├── Template table Frap
    │   ├── Template table synthèses des frap
    │   ├── Template table rapport provisoire
    │   ├── Template table rapport final
    │   └── Template table suivi des recos
    └── [Autres sections existantes...]
```

## Sécurité

- Le script de test crée automatiquement une sauvegarde avant modification
- Format de sauvegarde : `DemarrerMenu_backup_template_YYYYMMDD_HHmmss.tsx`
- Le script vérifie si la section existe déjà pour éviter les doublons

## Restauration en Cas d'Erreur

```powershell
# Restaurer depuis la sauvegarde
Copy-Item "src/components/Clara_Components/DemarrerMenu_backup_template_*.tsx" "src/components/Clara_Components/DemarrerMenu.tsx" -Force
```

## Notes Techniques

### Pattern de Recherche
Le script recherche la section Bibliothèque avec le pattern :
```javascript
id: 'bibliotheque',
label: 'Bibliothèque',
items: [
```

### Insertion
La section Template est insérée au début de la liste `items` de la Bibliothèque.

### Format des Commandes
Toutes les commandes suivent le format standard avec :
- `[Logiciel]` : E-audit pro
- `[Etape de mission]` : Bibliothèque
- `[Section]` : Template
- `[Commande]` : Nom spécifique du template
- `[Nb de lignes]` : 50 (par défaut)

## Prochaines Étapes

1. Exécuter le script d'ajout
2. Vérifier l'intégration dans l'interface
3. Tester chaque template dans l'application
4. Documenter les cas d'usage pour chaque template
5. Créer les workflows n8n correspondants si nécessaire

## Compatibilité

- Compatible avec la structure actuelle de DemarrerMenu.tsx
- Suit les conventions de nommage existantes
- S'intègre dans la hiérarchie E-audit pro > Bibliothèque

## Auteur

Script créé le 10 Avril 2026 pour ajouter les templates de tables vierges dans la bibliothèque d'E-audit pro.

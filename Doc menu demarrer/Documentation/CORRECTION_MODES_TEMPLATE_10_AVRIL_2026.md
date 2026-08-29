# Correction Modes Template - 10 Avril 2026

## Contexte

Après l'ajout initial de la section Template dans la Bibliothèque, la structure des étapes utilisait un `command` direct au lieu d'une structure avec `modes`. Cette correction transforme chaque étape pour ajouter les modes requis.

## Problème Identifié

### Structure Initiale (Incorrecte)
```typescript
{
  id: 'template-unicolonne',
  label: 'Template table unicolonne et ligne',
  icon: <FileText className="w-4 h-4" />,
  command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_unicolonne
[Nb de lignes] = 50`
}
```

### Problèmes
- Pas de structure `modes`
- Impossible d'avoir plusieurs variantes de commande
- Ne suit pas la convention des autres étapes du menu

## Solution Appliquée

### Structure Corrigée
```typescript
{
  id: 'template-unicolonne',
  label: 'Template table unicolonne et ligne',
  icon: <FileText className="w-4 h-4" />,
  modes: [
    {
      id: 'normal',
      label: 'Normal',
      command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_unicolonne
[Nb de lignes] = 50`
    },
    {
      id: 'guide-commandes',
      label: 'Guide des commandes',
      command: `[Logiciel] = E-audit pro
[Etape de mission] = Bibliothèque
[Section] = Template
[Commande] = Template_table_unicolonne
[Guide des commandes] = Activate
[Nb de lignes] = 50`
    }
  ]
}
```

## Modes Ajoutés

### 1. Mode Normal
- **ID**: `normal`
- **Label**: Normal
- **Commande**: Commande de base sans variable supplémentaire
- **Usage**: Utilisation standard du template

### 2. Mode Guide des Commandes
- **ID**: `guide-commandes`
- **Label**: Guide des commandes
- **Commande**: Commande de base + `[Guide des commandes] = Activate`
- **Usage**: Affiche le guide des commandes pour le template

## Formule du Mode Guide des Commandes

```
Mode Guide des Commandes = Mode Normal + [Guide des commandes] = Activate
```

## Templates Corrigés

| # | Template | Commande | Modes |
|---|----------|----------|-------|
| 1 | Template table unicolonne et ligne | `Template_table_unicolonne` | Normal, Guide des commandes |
| 2 | Template table simple | `Template_table_simple` | Normal, Guide des commandes |
| 3 | Template table etape de mission | `Template_table_etape_de_mission` | Normal, Guide des commandes |
| 4 | Template table feuille couverture et test audit | `Template_table_feuille_couverture_test_audit` | Normal, Guide des commandes |
| 5 | Template table Frap | `Template_table_frap` | Normal, Guide des commandes |
| 6 | Template table synthèses des frap | `Template_table_synthèses_frap` | Normal, Guide des commandes |
| 7 | Template table rapport provisoire | `Template_table_rapport_provisoire` | Normal, Guide des commandes |
| 8 | Template table rapport final | `Template_table_rapport_final` | Normal, Guide des commandes |
| 9 | Template table suivi des recos | `Template_table_suivi_recos` | Normal, Guide des commandes |

## Script de Correction

### Fichier
`Doc menu demarrer/Scripts/fix_template_modes.py`

### Fonctionnement
1. Recherche toutes les étapes Template avec `command` direct
2. Extrait les informations (id, label, commande)
3. Crée la structure `modes` avec 2 modes
4. Remplace l'ancienne structure par la nouvelle

### Pattern de Recherche
```python
pattern = r'''(\s+\{
\s+id: '(template-[^']+)',
\s+label: '([^']+)',
\s+icon: <FileText className="w-4 h-4" />,
\s+command: `\[Logiciel\] = E-audit pro
\[Etape de mission\] = Bibliothèque
\[Section\] = Template
\[Commande\] = ([^\n]+)
\[Nb de lignes\] = 50`
\s+\})'''
```

## Exécution

### Méthode 1 : Script Python Direct
```bash
python "Doc menu demarrer/Scripts/fix_template_modes.py"
```

### Méthode 2 : Script PowerShell avec Sauvegarde
```powershell
.\test-correction-modes-template.ps1
```

## Vérification

### Commandes de Vérification
```bash
# Vérifier que tous les templates ont le mode guide-commandes
grep -c "id: 'guide-commandes'" src/components/Clara_Components/DemarrerMenu.tsx

# Résultat attendu : 9 (un par template dans la section Template)
```

### Vérification Syntaxe TypeScript
```bash
# Aucune erreur de syntaxe détectée
npx tsc --noEmit src/components/Clara_Components/DemarrerMenu.tsx
```

## Résultats

### Statistiques
- **Templates corrigés** : 9
- **Modes ajoutés** : 18 (2 par template)
- **Lignes modifiées** : ~270
- **Erreurs de syntaxe** : 0

### Fichiers Créés
1. `Doc menu demarrer/Scripts/fix_template_modes.py` - Script de correction
2. `test-correction-modes-template.ps1` - Script de test PowerShell
3. `00_CORRECTION_MODES_TEMPLATE_10_AVRIL_2026.txt` - Documentation rapide
4. `Doc menu demarrer/Documentation/CORRECTION_MODES_TEMPLATE_10_AVRIL_2026.md` - Documentation complète

### Fichiers Modifiés
1. `src/components/Clara_Components/DemarrerMenu.tsx` - Correction des modes Template

## Sauvegarde et Restauration

### Sauvegarde Automatique
Le script PowerShell crée automatiquement une sauvegarde :
```
src/components/Clara_Components/DemarrerMenu_backup_modes_YYYYMMDD_HHmmss.tsx
```

### Restauration
```powershell
Copy-Item "src/components/Clara_Components/DemarrerMenu_backup_modes_*.tsx" `
          "src/components/Clara_Components/DemarrerMenu.tsx" -Force
```

## Conformité

### Spécifications Respectées
✅ Mode Normal avec commande de base  
✅ Mode Guide des commandes avec variable `[Guide des commandes] = Activate`  
✅ Structure `modes` conforme aux autres étapes  
✅ Pas de modes Cours, Demo, Avancé, Methodo audit  
✅ Syntaxe TypeScript valide  

## Prochaines Étapes

1. ✅ Corriger les modes Template (FAIT)
2. ⏳ Tester l'interface dans l'application
3. ⏳ Créer les workflows n8n pour les templates
4. ⏳ Documenter l'utilisation des modes
5. ⏳ Former les utilisateurs

## Notes Techniques

### Indentation
Le script préserve l'indentation originale du fichier pour maintenir la cohérence du code.

### Regex Pattern
Le pattern regex utilise des groupes de capture pour extraire :
- L'indentation
- L'ID de l'étape
- Le label de l'étape
- La commande

### Gestion des Espaces
Les espaces et sauts de ligne sont préservés pour maintenir la lisibilité du code.

## Auteur

Script créé le 10 Avril 2026 pour corriger la structure des modes de la section Template.

---

**Date** : 10 Avril 2026  
**Statut** : ✅ Terminé  
**Version** : 1.0

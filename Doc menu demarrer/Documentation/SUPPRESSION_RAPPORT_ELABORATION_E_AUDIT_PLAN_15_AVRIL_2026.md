# Suppression de l'étape "Rapport d'élaboration du plan annuel d'audit" dans E-audit plan

**Date:** 15 avril 2026  
**Composant:** `src/components/Clara_Components/DemarrerMenu.tsx`  
**Logiciel concerné:** E-audit plan

## 📋 Objectif

Supprimer complètement l'étape "Rapport d'élaboration du plan annuel d'audit" et tous ses modes du logiciel E-audit plan.

## 🎯 Étape supprimée

### Rapport d'élaboration du plan annuel d'audit (`eap-rapport-elaboration-plan`)

**ID de l'étape:** `eap-rapport-elaboration-plan`  
**Label:** "Rapport d'élaboration du plan annuel d'audit"  
**Icône:** FileCheck

**Modes supprimés:**
- ✅ Normal
- ✅ Avancé
- ✅ Document
- ✅ Database

## 📝 Détails de la suppression

### Structure supprimée

```typescript
{
  id: 'eap-rapport-elaboration-plan',
  label: "Rapport d'élaboration du plan annuel d'audit",
  icon: <FileCheck className="w-4 h-4" />,
  modes: [
    {
      id: 'normal',
      label: 'Normal',
      command: `[Command] = Etape de mission
[Logiciel] = E-audit plan
[Processus] = rapprochements bancaires
[Etape précédente] = Plan annuel d'audit interne
[Etape de mission] = Rapport d'élaboration du plan annuel d'audit
[Modele] : Base
[Nb de pages] = 5`
    },
    {
      id: 'avance',
      label: 'Avancé',
      command: `[Command] = Etape de mission
[Logiciel] = E-audit plan
[Processus] = rapprochements bancaires
[Etape précédente] = Plan annuel d'audit interne
[Etape de mission] = Rapport d'élaboration du plan annuel d'audit
[Modele] : Base
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Nb de pages] = 5`
    },
    {
      id: 'document',
      label: 'Document',
      command: `[Command] = Etape de mission
[Logiciel] = E-audit plan
[Processus] = rapprochements bancaires
[Etape précédente] = Plan annuel d'audit interne
[Etape de mission] = Rapport d'élaboration du plan annuel d'audit
[Modele] : Base
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Router] = Document
[Nb de pages] = 5`
    },
    {
      id: 'database',
      label: 'Database',
      command: `[Command] = Etape de mission
[Logiciel] = E-audit plan
[Processus] = rapprochements bancaires
[Etape précédente] = Plan annuel d'audit interne
[Etape de mission] = Rapport d'élaboration du plan annuel d'audit
[Modele] : Base
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Router] = Database
[User_id] = ohada
[Database] = workspace_02
[Nb de pages] = 5`
    }
  ]
}
```

## ✅ Résultat

- **Étape supprimée:** 1 (Rapport d'élaboration du plan annuel d'audit)
- **Modes supprimés:** 4 (normal, avancé, document, database)
- **Lignes de code supprimées:** ~65 lignes
- Aucune référence à `eap-rapport-elaboration-plan` ne subsiste
- La structure du menu E-audit plan reste cohérente

## 🔍 Vérification

Pour vérifier que les modifications sont correctes :

```bash
# Rechercher les références restantes à l'étape supprimée
grep -n "eap-rapport-elaboration-plan" src/components/Clara_Components/DemarrerMenu.tsx

# Résultat attendu : aucune correspondance

# Rechercher le label de l'étape
grep -n "Rapport d'élaboration du plan annuel d'audit" src/components/Clara_Components/DemarrerMenu.tsx

# Résultat attendu : aucune correspondance
```

## 📦 Fichiers modifiés

- `src/components/Clara_Components/DemarrerMenu.tsx`

## 📊 Impact

### Étapes restantes dans E-audit plan

Après cette suppression, E-audit plan contient les étapes suivantes :

1. ✅ Cartographie des processus
2. ✅ Question Identification des risques
3. ✅ Identification des risques
4. ✅ Évaluation des risques
5. ✅ Plan d'action de couverture des risques
6. ✅ Mise à jour cartographie N-1
7. ✅ Hiérarchisation des risques
8. ✅ Priorisation des risques
9. ✅ Plan annuel d'audit interne
10. ❌ ~~Rapport d'élaboration du plan annuel d'audit~~ (SUPPRIMÉ)

## 🚀 Prochaines étapes

1. Tester le menu demarrer dans l'interface
2. Vérifier que l'étape n'apparaît plus dans le menu E-audit plan
3. Valider avec l'équipe que la suppression est correcte

## 📚 Références

- Tâche précédente : Suppression des lignes [Algorithme] (15 avril 2026)
- Dossier documentation : `Doc menu demarrer/Documentation/`

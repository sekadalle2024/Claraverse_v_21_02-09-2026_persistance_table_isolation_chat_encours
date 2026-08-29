# Ajout de l'étape Leadsheet dans E-revision

**Date**: 09 Mai 2026  
**Logiciel**: E-revision  
**Section**: REVUE ANALYTIQUE  
**Position**: Après "Lead balance"

## 📋 Objectif

Ajouter une nouvelle étape de mission "Leadsheet" dans la section "REVUE ANALYTIQUE" du logiciel E-revision avec deux modes : Normal et Demo.

## 🎯 Spécifications

### Étape ajoutée : Leadsheet

**Position** : Entre "Lead balance" et "Revue analytique générale"

### Mode Normal
```
[Command] = Leadsheet
[Processus] = Trésorerie
[Données de base] = pièce jointe
```

### Mode Demo
```
[Command] = Leadsheet
[Processus] = Trésorerie
[Données de base] = pièce jointe
[Demo] = Activate
```

## 🔧 Implémentation

### Script Python
**Fichier**: `Doc menu demarrer/Scripts/add_leadsheet_e_revision.py`

Le script effectue les opérations suivantes :
1. Lit le fichier `DemarrerMenu.tsx`
2. Localise la position après "Lead balance"
3. Insère la nouvelle étape "Leadsheet" avec ses deux modes
4. Sauvegarde le fichier modifié

### Structure ajoutée

```typescript
{
  id: 'leadsheet',
  label: 'Leadsheet',
  icon: <Calculator className="w-4 h-4" />,
  modes: [
    {
      id: 'normal',
      label: 'Normal',
      command: `[Command] = Leadsheet
[Processus] = Trésorerie
[Données de base] = pièce jointe`
    },
    {
      id: 'demo',
      label: 'Demo',
      command: `[Command] = Leadsheet
[Processus] = Trésorerie
[Données de base] = pièce jointe
[Demo] = Activate`
    }
  ]
}
```

## 📂 Fichiers modifiés

- `src/components/Clara_Components/DemarrerMenu.tsx` - Ajout de l'étape Leadsheet

## 📂 Fichiers créés

- `Doc menu demarrer/Scripts/add_leadsheet_e_revision.py` - Script d'ajout
- `Doc menu demarrer/Documentation/AJOUT_LEADSHEET_E_REVISION_09_MAI_2026.md` - Cette documentation

## ✅ Tests à effectuer

1. **Test visuel**
   - Ouvrir l'application E-audit
   - Cliquer sur le bouton "Démarrer"
   - Naviguer vers E-revision > REVUE ANALYTIQUE
   - Vérifier que "Leadsheet" apparaît après "Lead balance"

2. **Test des modes**
   - Mode Normal : Vérifier que la commande générée contient les 3 variables
   - Mode Demo : Vérifier que `[Demo] = Activate` est présent

3. **Test de la commande**
   - Sélectionner le mode Normal
   - Vérifier que la commande s'insère correctement dans la zone de saisie
   - Répéter pour le mode Demo

## 📝 Notes techniques

### Icône utilisée
`<Calculator className="w-4 h-4" />` - Cohérent avec Lead balance

### Variables de commande
- `[Command]` : Leadsheet
- `[Processus]` : Trésorerie (fixe)
- `[Données de base]` : pièce jointe (fixe)
- `[Demo]` : Activate (mode Demo uniquement)

### Position dans la hiérarchie
```
E-revision
└── REVUE ANALYTIQUE
    ├── Lead balance
    ├── Leadsheet ← NOUVEAU
    ├── Revue analytique générale
    └── Analyse des variations
```

## 🔄 Historique des modifications

| Date | Action | Détails |
|------|--------|---------|
| 09 Mai 2026 | Création | Ajout initial de l'étape Leadsheet avec modes Normal et Demo |

## 📚 Références

- Template utilisé : `add_e_revision_modes.py`
- Structure inspirée de : Lead balance
- Documentation projet : `Doc menu demarrer/README.md`

## 🎓 Utilisation du script

### Exécution
```powershell
# Depuis la racine du projet
python "Doc menu demarrer/Scripts/add_leadsheet_e_revision.py"
```

### Résultat attendu
```
======================================================================
🚀 AJOUT DE L'ÉTAPE LEADSHEET DANS E-REVISION
======================================================================

📖 Lecture du fichier DemarrerMenu.tsx...
✅ Étape Leadsheet ajoutée avec succès après Lead balance
   - Mode Normal: [Command] = Leadsheet, [Processus] = Trésorerie, [Données de base] = pièce jointe
   - Mode Demo: Même commande + [Demo] = Activate

💾 Sauvegarde du fichier...
✅ Fichier sauvegardé avec succès!

📋 Résumé:
   • Logiciel: E-revision
   • Section: REVUE ANALYTIQUE
   • Étape ajoutée: Leadsheet (après Lead balance)
   • Modes: Normal et Demo
   • Processus: Trésorerie

======================================================================
✅ MISSION ACCOMPLIE!

📝 Prochaines étapes:
   1. Vérifier le fichier DemarrerMenu.tsx
   2. Tester l'interface avec le bouton Démarrer
   3. Valider les commandes générées
======================================================================
```

## ⚠️ Précautions

1. **Backup** : Le script modifie directement `DemarrerMenu.tsx`. Assurez-vous d'avoir une sauvegarde.
2. **Vérification** : Après exécution, vérifiez que la syntaxe TypeScript est correcte.
3. **Tests** : Testez l'interface avant de déployer en production.

## 🆘 Dépannage

### Le script ne trouve pas le texte de référence
- Vérifiez que `DemarrerMenu.tsx` n'a pas été modifié
- Vérifiez la structure autour de "Lead balance"

### Erreur de syntaxe après modification
- Vérifiez les accolades et virgules
- Utilisez un linter TypeScript pour identifier les erreurs

### L'étape n'apparaît pas dans l'interface
- Vérifiez que le serveur de développement a été redémarré
- Vérifiez la console du navigateur pour des erreurs

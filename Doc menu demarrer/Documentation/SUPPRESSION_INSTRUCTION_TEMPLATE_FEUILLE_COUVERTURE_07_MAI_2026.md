# Suppression ligne [Instruction] = Template - Feuille couverture

**Date**: 07 Mai 2026  
**Logiciel**: E-audit pro  
**Section**: PHASE DE REALISATION  
**Étape**: Feuille couverture  
**Modes concernés**: Normal et Demo

## 📋 Objectif

Supprimer la ligne `[Instruction] = Template` des modes Normal et Demo pour l'étape "Feuille couverture" dans la section "PHASE DE REALISATION" du logiciel E-audit pro.

## 🎯 Contexte

Dans l'interface du chat, le bouton menu "Démarrer" permet de générer des commandes dans la zone de saisie. Pour le logiciel E-audit pro, dans la section "PHASE DE REALISATION", l'étape "Feuille couverture" dispose de deux modes :
- Mode [Normal]
- Mode [Demo] = Activate

Ces deux modes contenaient la ligne `[Instruction] = Template` qui devait être supprimée.

## 🔧 Modification effectuée

### Avant modification

**Mode Normal:**
```
[Command] = Couverture
[Processus] = Sécurité trésorerie
[Contrôle] = Verifier l exhaustivite des inventaires de caisse
[Instruction] = Template
[Modele de test] = no, compte, site, libelle, solde BG, Solde Pv inventaire
[Nb de lignes] = 15
```

**Mode Demo:**
```
[Command] = Couverture
[Processus] = Sécurité trésorerie
[Contrôle] = Verifier l exhaustivite des inventaires de caisse
[Instruction] = Template
[Modele de test] = no, compte, site, libelle, solde BG, Solde Pv inventaire
[Nb de lignes] = 15
[Demo] = Activate
```

### Après modification

**Mode Normal:**
```
[Command] = Couverture
[Processus] = Sécurité trésorerie
[Contrôle] = Verifier l exhaustivite des inventaires de caisse
[Modele de test] = no, compte, site, libelle, solde BG, Solde Pv inventaire
[Nb de lignes] = 15
```

**Mode Demo:**
```
[Command] = Couverture
[Processus] = Sécurité trésorerie
[Contrôle] = Verifier l exhaustivite des inventaires de caisse
[Modele de test] = no, compte, site, libelle, solde BG, Solde Pv inventaire
[Nb de lignes] = 15
[Demo] = Activate
```

## 📁 Fichiers modifiés

- `src/components/Clara_Components/DemarrerMenu.tsx`

## 🚀 Script utilisé

- `Doc menu demarrer/Scripts/remove_instruction_template_feuille_couverture.py`

## ✅ Résultat

La ligne `[Instruction] = Template` a été supprimée avec succès des deux modes (Normal et Demo) pour l'étape "Feuille couverture" dans la phase de réalisation du logiciel E-audit pro.

## 📝 Notes

- Cette modification suit le même pattern que les tâches précédentes de mise à jour du menu Démarrer
- Le script Python utilise des expressions régulières pour localiser et supprimer précisément les lignes concernées
- Une sauvegarde automatique du contenu original est effectuée avant modification
- Le script affiche un rapport détaillé des modifications effectuées

## 🔍 Vérification

Pour vérifier que la modification a été appliquée correctement :

1. Ouvrir l'application E-audit
2. Cliquer sur le bouton "Démarrer"
3. Naviguer vers : E-audit pro > Phase de réalisation > Feuille couverture
4. Vérifier les modes Normal et Demo
5. Confirmer que la ligne `[Instruction] = Template` n'apparaît plus dans les commandes générées

## 📚 Références

- Dossier de documentation : `Doc menu demarrer/`
- Exemples de tâches similaires disponibles dans `Doc menu demarrer/Documentation/`

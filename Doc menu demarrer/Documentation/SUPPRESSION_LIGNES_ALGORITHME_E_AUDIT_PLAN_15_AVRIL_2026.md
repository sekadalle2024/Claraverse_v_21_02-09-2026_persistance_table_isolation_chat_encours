# Suppression des lignes [Algorithme] dans E-audit plan

**Date:** 15 avril 2026  
**Composant:** `src/components/Clara_Components/DemarrerMenu.tsx`  
**Logiciel concerné:** E-audit plan

## 📋 Objectif

Retirer les lignes contenant `[Algorithme]` pour les étapes suivantes dans E-audit plan :
- Hiérarchisation des risques
- Priorisation des risques  
- Plan annuel d'audit interne

## 🎯 Étapes modifiées

### 1. Hiérarchisation des risques (`eap-hierarchisation-risques`)

**Ligne retirée dans tous les modes:**
```
[Algorithme]= Hiearchisation
```

**Modes concernés:**
- ✅ Normal
- ✅ Avancé
- ✅ Database
- ✅ Document

### 2. Priorisation des risques (`eap-priorisation-risques`)

**Ligne retirée dans tous les modes:**
```
[Algorithme]= Priorisation
```

**Modes concernés:**
- ✅ Normal
- ✅ Avancé
- ✅ Database
- ✅ Document

### 3. Plan annuel d'audit interne (`eap-plan-annuel-audit`)

**Ligne retirée dans tous les modes:**
```
[Algorithme]= Plan annuel d'audit
```
ou
```
[Algorithme] = Plan annuel d'audit
```

**Modes concernés:**
- ✅ Normal
- ✅ Avancé
- ✅ Database
- ✅ Document

## 📝 Exemple de modification

### Avant
```typescript
command: `[Command] = Etape de mission
[Logiciel] = E-audit plan
[Processus] = rapprochements bancaires
[Etape précédente] = Plan d'action de couverture des risques
[Etape de mission] = Hiearchisation des risques
[Modele] : Point de controle, risque, évaluation risque, probabilité, impact, Plan d'action de couverture des risques
[Algorithme]= Hiearchisation
[Nb de lignes] = 30`
```

### Après
```typescript
command: `[Command] = Etape de mission
[Logiciel] = E-audit plan
[Processus] = rapprochements bancaires
[Etape précédente] = Plan d'action de couverture des risques
[Etape de mission] = Hiearchisation des risques
[Modele] : Point de controle, risque, évaluation risque, probabilité, impact, Plan d'action de couverture des risques
[Nb de lignes] = 30`
```

## ✅ Résultat

- **12 lignes supprimées** au total (3 étapes × 4 modes)
- Aucune ligne `[Algorithme]` ne subsiste dans E-audit plan
- Les autres logiciels ne sont pas affectés
- La structure du menu reste intacte

## 🔍 Vérification

Pour vérifier que les modifications sont correctes :

```bash
# Rechercher les lignes [Algorithme] restantes
grep -n "\[Algorithme\]" src/components/Clara_Components/DemarrerMenu.tsx

# Résultat attendu : aucune correspondance
```

## 📦 Fichiers modifiés

- `src/components/Clara_Components/DemarrerMenu.tsx`

## 🚀 Prochaines étapes

1. Tester le menu demarrer dans l'interface
2. Vérifier que les commandes générées sont correctes
3. Valider avec l'équipe que les modifications correspondent aux attentes

## 📚 Références

- Script Python créé : `Doc menu demarrer/Scripts/remove_hierarchisation_priorisation_e_audit_plan.py`
- Dossier documentation : `Doc menu demarrer/Documentation/`

# 🔄 Solution - Conflit Données Automatiques vs Manuelles

## 📋 Problème Identifié

### Situation Actuelle

**Scénario problématique** :
1. Table `[Modelised_table]` génère automatiquement `[Table_conso]` avec données A
2. Utilisateur active "Édition des cellules" et modifie manuellement `[Table_conso]` → données B
3. Utilisateur modifie `[Modelised_table]` → devrait générer nouvelles données C
4. **❌ PROBLÈME** : Les données B (manuelles) écrasent les données C (automatiques)

### Comportement Attendu

**Règle de priorité** : La **dernière action** (manuelle OU automatique) doit prévaloir.

- Si dernière action = modification manuelle → garder données man
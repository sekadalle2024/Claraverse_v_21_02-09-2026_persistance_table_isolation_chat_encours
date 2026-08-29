# GUIDE DE TEST - 16 ÉTATS DE CONTRÔLE

## 🚀 TESTS RAPIDES

### Test 1: Import du Module

```bash
python -c "from py_backend.etats_controle_exhaustifs_html import generate_all_16_etats_controle_html; print('✅ OK')"
```

**Résultat attendu**: `✅ OK`

### Test 2: Génération Rapide

```bash
python test-16-etats-rapide.py
```

**Résultats attendus**:
- ✅ HTML généré: ~37 000 caractères
- ✅ Nombre de sections: 16
- ✅ Nombre d'accordéons: 16
- ✅ Tous les états présents (1-16)

### Test 3: Test d'Intégration Complet

```powershell
.\Doc_Etat_Fin\Scripts\test-integration-16-etats.ps1
```

**Résultats attendus**:
- ✅ Module importé correctement
- ✅ Génération HTML fonctionnelle
- ✅ Structure HTML conforme
- ✅ Intégration dans etats_financiers.py
- ✅ Conformité avec le fichier de référence
- ✅ 16 états générés correctement

## 🧪 TESTS DÉTAILLÉS

### Test 4: Vérification de la Structure HTML

```python
from py_backend.etats_controle_exhaustifs_html import generate_all_16_etats_controle_html

# Données minimales
controles = {
    'statistiques': {
        'total_comptes_balance': 100,
        'comptes_integres': 95,
        'comptes_non_integres': 5,
        'taux_couverture': 95.0
    },
    'equilibre_bilan': {
        'actif': 1000000,
        'passif': 1000000,
        'difference': 0,
        'pourcentage_ecart': 0,
        'equilibre': True
    },
    'equilibre_resultat': {
        'resultat_cr': 50000,
        'resultat_bilan': 50000,
        'difference': 0,
        'equilibre': True
    },
    'comptes_non_integres': [],
    'comptes_sens_inverse': [],
    'comptes_desequilibre': [],
    'hypothese_affectation': {
        'resultat_net': 50000,
        'actif': 1000000,
        'passif_sans_resultat': 950000,
        'difference_avant': 50000,
        'passif_avec_resultat': 1000000,
        'difference_apres': 0,
        'equilibre_apres': True
    },
    'comptes_sens_anormal': {
        'critiques': [],
        'eleves': [],
        'moyens': [],
        'faibles': []
    }
}

totaux = {
    'actif': 1000000,
    'passif': 1000000,
    'resultat': 50000
}

# Générer le HTML
html = generate_all_16_etats_controle_html(controles, controles, totaux, totaux)

# Vérifications
print(f"Longueur HTML: {len(html)} caractères")
print(f"Nombre de sections: {html.count('<div class=\"section\">')}")
print(f"Nombre d'accordéons: {html.count('section-header')}")
```

### Test 5: Vérification des 16 États

```python
etats_attendus = [
    "1. Statistiques de Couverture (Exercice N)",
    "2. Équilibre du Bilan (Exercice N)",
    "3. Cohérence Résultat (Exercice N)",
    "4. Comptes Non Intégrés (Exercice N)",
    "5. Comptes avec Sens Inversé (Exercice N)",
    "6. Comptes Créant un Déséquilibre (Exercice N)",
    "7. Hypothèse d'Affectation du Résultat (Exercice N)",
    "8. Comptes avec Sens Anormal par Nature (Exercice N)",
    "9. Statistiques de Couverture (Exercice N-1)",
    "10. Équilibre du Bilan (Exercice N-1)",
    "11. Cohérence Résultat (Exercice N-1)",
    "12. Comptes Non Intégrés (Exercice N-1)",
    "13. Comptes avec Sens Inversé (Exercice N-1)",
    "14. Comptes Créant un Déséquilibre (Exercice N-1)",
    "15. Hypothèse d'Affectation du Résultat (Exercice N-1)",
    "16. Comptes avec Sens Anormal par Nature (Exercice N-1)"
]

for i, etat in enumerate(etats_attendus, 1):
    if etat in html:
        print(f"✅ État {i}: {etat}")
    else:
        print(f"❌ État {i}: {etat} - MANQUANT")
```

### Test 6: Vérification de la Conformité

```python
# Vérifier les éléments clés du format de référence
checks = {
    'Icônes': '📊' in html and '⚖️' in html and '💰' in html,
    'Accordéons': 'onclick="toggleSection(this)"' in html,
    'Flèches': '<span class="arrow">›</span>' in html,
    'Badges success': 'badge-success' in html,
    'Badges warning': 'badge-warning' in html,
    'Badges danger': 'badge-danger' in html,
    'Success box': 'success-box' in html,
    'Warning box': 'warning-box' in html,
    'Danger box': 'danger-box' in html,
    'Info box': 'info-box' in html,
    'Tableaux': '<table>' in html and '<thead>' in html,
    'Montants': 'montant-cell' in html,
    'Références': 'ref-cell' in html
}

for name, passed in checks.items():
    status = '✅' if passed else '❌'
    print(f'{status} {name}')
```

## 📊 TESTS AVEC DONNÉES RÉELLES

### Test 7: Avec Balance Démo

```bash
python py_backend/generer_test_etats_controle_html.py
```

Ce script:
1. Charge la balance démo
2. Calcule les contrôles exhaustifs
3. Génère le HTML des 16 états
4. Sauvegarde le fichier HTML sur le bureau

**Fichier généré**: `C:\Users\LEADER\Desktop\test_etats_controle_html.html`

### Test 8: Vérification Visuelle

1. Ouvrir le fichier HTML généré dans un navigateur
2. Vérifier que les 16 sections s'affichent
3. Tester les accordéons (clic sur les headers)
4. Vérifier les styles CSS (couleurs, badges, tableaux)
5. Vérifier les icônes et émojis

## 🔍 CHECKLIST DE VALIDATION

### Structure HTML

- [ ] 16 sections `<div class="section">` présentes
- [ ] 16 headers `<div class="section-header">` présents
- [ ] 16 contenus `<div class="section-content">` présents
- [ ] 16 corps `<div class="section-body">` présents
- [ ] Flèches `<span class="arrow">›</span>` présentes

### Contenu des États

- [ ] État 1: Statistiques de Couverture (N)
- [ ] État 2: Équilibre du Bilan (N)
- [ ] État 3: Cohérence Résultat (N)
- [ ] État 4: Comptes Non Intégrés (N)
- [ ] État 5: Comptes avec Sens Inversé (N)
- [ ] État 6: Comptes Créant un Déséquilibre (N)
- [ ] État 7: Hypothèse d'Affectation (N)
- [ ] État 8: Comptes avec Sens Anormal (N)
- [ ] État 9: Statistiques de Couverture (N-1)
- [ ] État 10: Équilibre du Bilan (N-1)
- [ ] État 11: Cohérence Résultat (N-1)
- [ ] État 12: Comptes Non Intégrés (N-1)
- [ ] État 13: Comptes avec Sens Inversé (N-1)
- [ ] État 14: Comptes Créant un Déséquilibre (N-1)
- [ ] État 15: Hypothèse d'Affectation (N-1)
- [ ] État 16: Comptes avec Sens Anormal (N-1)

### Éléments Visuels

- [ ] Boîtes colorées (success, warning, danger, info)
- [ ] Badges colorés (success, warning, danger, info, critical)
- [ ] Tableaux avec headers et données
- [ ] Icônes et émojis (📊, ⚖️, 💰, ⚠️, 🔄, 💡, 🚨)
- [ ] Montants formatés avec séparateurs
- [ ] Classes CSS appliquées correctement

### Fonctionnalités

- [ ] Accordéons cliquables
- [ ] Ouverture/fermeture des sections
- [ ] Rotation des flèches
- [ ] Affichage/masquage du contenu
- [ ] Styles CSS actifs

## 🐛 DÉPANNAGE

### Problème: Module non trouvé

```bash
# Vérifier que le fichier existe
ls py_backend/etats_controle_exhaustifs_html.py

# Vérifier l'import
python -c "import sys; sys.path.insert(0, 'py_backend'); from etats_controle_exhaustifs_html import generate_all_16_etats_controle_html"
```

### Problème: États manquants

```python
# Vérifier le nombre d'états générés
html = generate_all_16_etats_controle_html(controles, controles, totaux, totaux)
print(f"Nombre de sections: {html.count('<div class=\"section\">')}")
```

### Problème: HTML mal formaté

```python
# Vérifier la structure
print(f"Sections: {html.count('<div class=\"section\">')}")
print(f"Headers: {html.count('section-header')}")
print(f"Contents: {html.count('section-content')}")
print(f"Bodies: {html.count('section-body')}")
```

## 📝 NOTES

- Les tests utilisent des données minimales pour la validation
- Les listes de comptes peuvent être vides (normal pour les tests)
- Le HTML généré doit faire ~37 000 caractères minimum
- Tous les tests doivent passer pour valider l'intégration

## 🎯 CRITÈRES DE SUCCÈS

✅ **Intégration réussie si**:
1. Tous les tests passent
2. 16 états générés correctement
3. HTML conforme au fichier de référence
4. Accordéons fonctionnels
5. Styles CSS appliqués
6. Aucune erreur dans la console

---

**Date**: 05 Avril 2026  
**Version**: 1.0

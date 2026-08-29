# Changelog - Menu Démarrer E-audit

## [31 Mars 2026] - Programme de Contrôle des Comptes - Cycles Opérationnels

### ✅ Ajouté
- 24 nouveaux modes basés sur les cycles opérationnels (8 cycles × 3 niveaux de risque)
- Mode Trésorerie (R=1, R=2, R=3)
- Mode Ventes (R=1, R=2, R=3)
- Mode Stocks (R=1, R=2, R=3)
- Mode Capitaux propres (R=1, R=2, R=3)
- Mode Achats (R=1, R=2, R=3)
- Mode Immobilisations (R=1, R=2, R=3)
- Mode Personnel (R=1, R=2, R=3)
- Mode Emprunts (R=1, R=2, R=3)

### ❌ Supprimé
- Mode "Normal" du Programme de contrôle des comptes
- Mode "Demo" du Programme de contrôle des comptes
- Mode "Methodo revision" du Programme de contrôle des comptes
- Mode "Guide des commandes" du Programme de contrôle des comptes

### 📝 Modifié
- Structure du "Programme de contrôle des comptes" dans E-revision
- Format des commandes: ajout de `[Niveau de risque R]` et `[Assertion]`

### 📚 Documentation
- Ajout de `update_programme_controle_cycles.py`
- Ajout de `UPDATE_PROGRAMME_CONTROLE_CYCLES_31_MARS_2026.md`
- Ajout de `CHANGELOG_31_MARS_2026.md`

### 🎯 Impact
- **Fichier modifié**: `src/components/Clara_Components/DemarrerMenu.tsx`
- **Lignes modifiées**: Section "Programme de contrôle des comptes" (lignes ~1045-1120)
- **Modes avant**: 4
- **Modes après**: 24
- **Erreurs de compilation**: 0

---

## [28 Mars 2026] - Lead Balance E-revision

### ✅ Ajouté
- Mode "Lead balance" dans E-revision

---

## [27 Mars 2026] - Modes E-contrôle et E-CIA Exam

### ✅ Ajouté
- Modes "Methodo audit" et "Guide des commandes" pour E-contrôle
- Mode QCM pour E-CIA Exam

### ❌ Supprimé
- Modes Demo, Avancé, Manuel pour E-CIA Exam Part 1

---

## [27 Mars 2026] - Methodo Revision et Guide des Commandes

### ✅ Ajouté
- Mode "Methodo revision" pour 20 étapes (E-audit pro + E-revision)
- Mode "Guide des commandes" pour 20 étapes (E-audit pro + E-revision)

### 📚 Documentation
- Création du dossier `Doc menu demarrer/`
- Ajout de scripts Python pour automatisation
- Documentation complète de l'architecture

---

**Format du changelog**: [Date] - Titre de la modification

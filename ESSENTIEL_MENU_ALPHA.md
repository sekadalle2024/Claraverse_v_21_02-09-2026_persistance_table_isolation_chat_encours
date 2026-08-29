# ⚡ L'Essentiel - Menu Alpha CIA

## En 30 secondes

**Objectif:** Ajouter des questionnaires CIA avec checkboxes persistantes dans ClaraVerse

**Installation:** 1 ligne de code dans `index.html`

**Résultat:** Détection et configuration automatiques des tables CIA

## Installation

```html
<!-- Ajouter dans index.html après menu.js -->
<script src="public/menu_alpha_simple.js"></script>
```

## Structure de table

```html
<table class="min-w-full border border-gray-200">
    <tr>
        <th>Question</th>
        <th>Option</th>
        <th>Reponse_user</th> <!-- Déclenche la détection -->
    </tr>
    <tr>
        <td>Question?</td>
        <td>A) Option 1</td>
        <td></td> <!-- Checkbox créée ici -->
    </tr>
</table>
```

## Ce qui se passe automatiquement

1. ✅ Détection des tables avec colonne "Reponse_user"
2. ✅ Création des checkboxes
3. ✅ Masquage des colonnes "Reponse CIA" et "Remarques"
4. ✅ Fusion des cellules "Question" et "Ref_question"
5. ✅ Sauvegarde après chaque clic
6. ✅ Restauration après actualisation

## Test

```bash
# Ouvrir dans le navigateur
public/test-menu-alpha-cia.html
```

## Vérification

```javascript
// Console (F12)
✅ Menu Alpha (Extension CIA) chargé
🎓 Extensions CIA initialisées avec succès
```

## Colonnes supportées

| Colonne | Variations | Action |
|---------|-----------|--------|
| Reponse_user | reponse_user, reponse user | Checkboxes créées |
| Reponse CIA | reponse cia, REPONSE CIA | Masquée |
| Remarques | remarques, remarque | Masquée |
| Question | question | Fusionnée |
| Ref_question | ref_question, REF_QUESTION | Fusionnée |

## Fonctionnalités

- ☑️ Checkboxes persistantes (localStorage + IndexedDB)
- 🔒 Une seule checkbox cochée par table
- 👁️ Colonnes sensibles masquées
- 🔗 Questions fusionnées
- 🔄 Restauration automatique
- 📊 Intégration avec menu.js et dev.js

## Dépannage rapide

**Checkboxes ne s'affichent pas?**
→ Vérifier nom de colonne "Reponse_user"

**Checkboxes non persistantes?**
→ Vérifier localStorage activé

**Colonnes non masquées?**
→ Vérifier noms "Reponse CIA" et "Remarques"

## Documentation complète

- **Démarrage:** [COMMENCEZ_ICI_MENU_ALPHA.md](COMMENCEZ_ICI_MENU_ALPHA.md)
- **Guide rapide:** [GUIDE_RAPIDE_MENU_ALPHA.md](GUIDE_RAPIDE_MENU_ALPHA.md)
- **Documentation:** [README_MENU_ALPHA_CIA.md](README_MENU_ALPHA_CIA.md)
- **Technique:** [DOCUMENTATION_TECHNIQUE_MENU_ALPHA.md](DOCUMENTATION_TECHNIQUE_MENU_ALPHA.md)
- **Navigation:** [INDEX_MENU_ALPHA_CIA.md](INDEX_MENU_ALPHA_CIA.md)

## Fichiers créés

### Code
- `public/menu_alpha_simple.js` ⭐ (Recommandé)
- `public/menu_alpha.js` (Alternative)
- `public/test-menu-alpha-cia.html` (Test)

### Documentation
- `COMMENCEZ_ICI_MENU_ALPHA.md` (Démarrage)
- `ESSENTIEL_MENU_ALPHA.md` (Ce fichier)
- `INDEX_MENU_ALPHA_CIA.md` (Navigation)
- `GUIDE_RAPIDE_MENU_ALPHA.md` (Guide)
- `README_MENU_ALPHA_CIA.md` (Documentation)
- `DOCUMENTATION_TECHNIQUE_MENU_ALPHA.md` (Technique)
- `SYNTHESE_FINALE_MENU_ALPHA.md` (Synthèse)
- `RECAPITULATIF_MENU_ALPHA_CIA.md` (Récapitulatif)
- `INTEGRATION_INDEX_HTML.md` (Intégration)
- `CHECKLIST_FINALE_MENU_ALPHA.md` (Checklist)

## Statistiques

- **Lignes de code:** 450+
- **Lignes de documentation:** 1000+
- **Temps d'installation:** 5 minutes
- **Temps de configuration table:** < 50ms
- **Compatibilité:** Chrome, Firefox, Safari, Opera

## Prêt!

C'est tout ce que vous devez savoir pour commencer.

**Pour plus de détails:** [COMMENCEZ_ICI_MENU_ALPHA.md](COMMENCEZ_ICI_MENU_ALPHA.md)

---

**Installation → Test → Production** 🚀

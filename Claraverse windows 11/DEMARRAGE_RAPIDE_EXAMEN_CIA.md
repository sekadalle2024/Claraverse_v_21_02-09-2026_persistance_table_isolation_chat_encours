# 🚀 Démarrage Rapide - Examen CIA

## ⚡ En 3 étapes

### 1️⃣ Le script est déjà intégré
Le fichier `public/examen_cia.js` est automatiquement chargé dans `index.html`.

### 2️⃣ Créez vos tables d'examen
Dans votre endpoint Flowise, générez des tables avec ces colonnes:

```
| Ref_question | Question | Option | Reponse_user | Reponse_cia | Remarques |
```

### 3️⃣ C'est tout ! 🎉
Le script détecte automatiquement les tables et:
- ✅ Ajoute des checkboxes dans Reponse_user
- ✅ Masque Reponse_cia et Remarques
- ✅ Fusionne les cellules Question et Ref_question
- ✅ Sauvegarde automatiquement les réponses

## 🧪 Tester immédiatement

### Option 1: Page de test
```bash
npm run dev
```
Ouvrir: `http://localhost:5173/test-examen-cia.html`

### Option 2: Console du navigateur
```javascript
// Afficher les informations
window.examenCIA.debug()

// Exporter les données
window.examenCIA.exportData()

// Obtenir les statistiques
window.examenCIA.getInfo()
```

## 📋 Colonnes supportées

| Colonne | Variations acceptées | Comportement |
|---------|---------------------|--------------|
| Reponse_user | reponse_user, reponse user, Reponse User | ☑️ Checkbox (choix unique) |
| Reponse_cia | reponse cia, REPONSE CIA, Reponse_cia | 🙈 Masquée |
| Option | option, options | 👁️ Visible |
| Remarques | remarques, remarque | 🙈 Masquée |
| Question | question, questions | 🔗 Fusionnée si identique |
| Ref_question | ref_question, REF_QUESTION | 🔗 Fusionnée si identique |

## 💡 Exemple de table

### Avant traitement
```
| Ref_question | Question | Option | Reponse_user | Reponse_cia | Remarques |
|--------------|----------|--------|--------------|-------------|-----------|
| Q1.1         | Texte... | A      |              | Non         | Info...   |
| Q1.1         | Texte... | B      |              | Oui         | Info...   |
| Q1.1         | Texte... | C      |              | Non         | Info...   |
```

### Après traitement
```
| Ref_question | Question | Option | Reponse_user |
|--------------|----------|--------|--------------|
|              |          | A      | ☐            |
|     Q1.1     |  Texte   | B      | ☐            |
| (fusionné)   |(fusionné)| C      | ☐            |
```

## 🎯 Utilisation

1. **Cliquer sur une checkbox** → Elle se coche
2. **Cliquer sur une autre** → La première se décoche automatiquement
3. **Recharger la page** → Les réponses sont restaurées

## 🔍 Vérifier que ça fonctionne

### Dans la console
```javascript
window.examenCIA.debug()
```

**Résultat attendu:**
```
📊 Informations Examen CIA:
  - Nombre d'examens: 2
  - Taille des données: 1.23 KB
  - Données: {...}
```

### Logs automatiques
Rechercher dans la console:
```
🎓 [Examen CIA] Table d'examen CIA détectée: exam-cia-...
🎓 [Examen CIA] ✅ Table d'examen configurée
🎓 [Examen CIA] 💾 Sauvegarde de l'examen: exam-cia-...
```

## ⚙️ Configuration (optionnel)

### Ajouter une variation de colonne
Éditer `public/examen_cia.js`:
```javascript
columnVariations: {
  reponse_user: [
    "reponse_user",
    "ma_variation"  // ← Ajouter ici
  ]
}
```

### Modifier le délai de sauvegarde
```javascript
autoSaveDelay: 500,  // ← Modifier ici (en ms)
```

## 🐛 Problème ?

### Les checkboxes ne s'affichent pas
```javascript
// Vérifier la détection
window.examenCIA.debug()
```

### Les données ne sont pas sauvegardées
```javascript
// Tester localStorage
localStorage.setItem('test', 'test')
localStorage.getItem('test')  // Doit retourner 'test'
```

## 📚 Documentation complète

- **Guide complet**: `GUIDE_EXAMEN_CIA.md`
- **Résumé**: `EXAMEN_CIA_README.md`
- **Code source**: `public/examen_cia.js`
- **Page de test**: `public/test-examen-cia.html`

## ✅ Checklist

- [x] Script créé et intégré
- [x] Détection automatique des tables
- [x] Checkboxes fonctionnelles
- [x] Choix unique par table
- [x] Colonnes masquées
- [x] Fusion des cellules
- [x] Persistance localStorage
- [x] Restauration automatique
- [x] API JavaScript
- [x] Page de test
- [x] Documentation complète

---

**C'est prêt à l'emploi ! 🎉**

Pour toute question, consulter `GUIDE_EXAMEN_CIA.md`

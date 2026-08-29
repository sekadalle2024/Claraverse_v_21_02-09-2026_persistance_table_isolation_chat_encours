# 🚀 Guide d'Utilisation - Système de Persistance ClaraVerse

## 📋 Vue d'Ensemble

Le nouveau système de persistance ClaraVerse permet de **modifier et sauvegarder automatiquement** toutes les données des tables du chat en temps réel, avec persistance dans le DOM et le localStorage.

## ✨ Fonctionnalités

### 🔄 Persistance Automatique
- **Sauvegarde en temps réel** : Modifications sauvegardées après 300ms
- **Double persistance** : DOM + localStorage pour sécurité maximale
- **Restauration automatique** : Données restaurées au rechargement
- **Compatible SPA** : Fonctionne avec l'architecture React de ClaraVerse

### 🎯 Tables Supportées
- ✅ **Toutes les tables ClaraVerse** avec les classes standards
- ✅ **Tables de pointage** (Écart, Conclusion, CTR, Assertion, etc.)
- ✅ **Tables de consolidation** (avec ID `conso-content`)
- ✅ **Tables de résultats** (conclusions finales)
- ✅ **Tables dynamiques** créées par les scripts

## 🛠️ Installation & Activation

### 1. Vérification des Fichiers
Assurez-vous que ces fichiers sont présents :
```
D:\ClaraVerse-v firebase\
├── dev.js                           # Nouveau système de persistance
├── html-processor.js               # Processeur HTML (existant)
└── test-table-persistence.html     # Page de test (optionnel)
```

### 2. Chargement du Script
Dans votre application ClaraVerse, ajoutez :
```html
<script src="dev.js"></script>
```

### 3. Vérification d'Activation
Ouvrez la console navigateur et tapez :
```javascript
claraverse.status()
```

Vous devriez voir :
```
✅ initialized: true
📋 processedTables: X
💾 storedCells: Y
```

## 🎮 Utilisation

### 💡 Utilisation Simple
1. **Cliquez sur une cellule** → Elle devient éditable (bordure orange)
2. **Tapez votre modification** → Sauvegarde automatique après 300ms
3. **Rechargez la page** → Vos modifications sont restaurées ✨

### 🔧 Commandes Avancées
```javascript
// Scanner manuellement les tables
claraverse.scan()

// Forcer la sauvegarde de toutes les tables
claraverse.save()

// Restaurer toutes les données
claraverse.restore()

// Voir le statut du système
claraverse.status()

// Exporter les données en JSON
claraverse.export()

// Vider toutes les données
claraverse.clear()

// Afficher l'aide complète
claraverse.help()
```

## 🔍 Identification Visuelle

### Tables Gérées
- **Bordure verte** avec ombre
- **Indicateur "💾 ClaraVerse - Persistance Active"** au-dessus

### Cellules
- **Curseur texte** sur les cellules éditables
- **Fond jaune + bordure orange** lors du focus
- **Fond vert temporaire** après modification/sauvegarde

## 🧪 Test du Système

### Page de Test Complète
Ouvrez `test-table-persistence.html` dans votre navigateur pour :
- ✅ Tester l'édition des cellules
- ✅ Vérifier la persistance
- ✅ Créer des tables dynamiques
- ✅ Exporter/importer les données

### Test Manuel Rapide
1. Ouvrez la console : `F12`
2. Tapez : `claraverse.help()`
3. Suivez les instructions affichées

## 🚨 Résolution de Problèmes

### ❌ "claraverse is not defined"
**Solution :** Le script n'est pas chargé
```javascript
// Recharger manuellement
const script = document.createElement('script');
script.src = 'dev.js';
document.head.appendChild(script);
```

### ❌ Les cellules ne sont pas éditables
**Solutions :**
1. Vérifier que les tables ont les bonnes classes CSS
2. Relancer le scan : `claraverse.scan()`
3. Vérifier la console pour les erreurs

### ❌ La sauvegarde ne fonctionne pas
**Solutions :**
1. Vérifier localStorage : `claraverse.status()`
2. Tester manuellement : `claraverse.save()`
3. Vider et recréer : `claraverse.clear()` puis `claraverse.scan()`

### ❌ Données perdues après rechargement
**Solutions :**
1. Vérifier la restauration : `claraverse.restore()`
2. Exporter en backup : `claraverse.export()`
3. Vérifier les clés localStorage : `localStorage` (dans la console)

## 🔧 Configuration Avancée

### Modifier les Délais
```javascript
// Dans dev.js, ligne CONFIG
DEBOUNCE_DELAY: 300,    // Délai sauvegarde (ms)
RETRY_DELAY: 1000,      // Délai retry (ms)
RETRY_ATTEMPTS: 3,      // Nombre de tentatives
```

### Ajouter des Sélecteurs Personnalisés
```javascript
// Dans dev.js, section TABLE_SELECTORS
TABLE_SELECTORS: {
    base: "votre-sélecteur-personnalisé",
    // ...
}
```

## 📊 Monitoring & Debug

### Informations Système
```javascript
// Statut complet
claraverse.status()

// Debug détaillé
claraverse.debug()

// Toutes les tables en mémoire
console.table(window.ClaraVerseTableManager.tableData)
```

### Logs de Monitoring
Le système log automatiquement :
- 🔍 Scan des tables
- 📝 Éditions des cellules  
- 💾 Sauvegardes
- 🔄 Restaurations
- ❌ Erreurs

## 🎯 Bonnes Pratiques

### ✅ À Faire
- **Sauvegarder régulièrement** : `claraverse.export()`
- **Tester après maj** : Utiliser la page de test
- **Monitorer les logs** : Console ouverte pendant l'utilisation
- **Vérifier le statut** : `claraverse.status()` en cas de doute

### ❌ À Éviter
- Ne pas modifier directement localStorage
- Ne pas supprimer les attributs `data-claraverse-id`
- Ne pas désactiver JavaScript
- Ne pas vider localStorage sans export

## 🔄 Migration depuis l'Ancien Système

Si vous aviez un ancien système :
1. **Exporter** les anciennes données
2. **Charger** le nouveau dev.js
3. **Importer** : `claraverse.import(anciennesDonnees)`
4. **Vérifier** : `claraverse.status()`

## 📞 Support

### Auto-Diagnostic
```javascript
// Test complet automatique
claraverse.scan()
setTimeout(() => claraverse.status(), 1000)
```

### Réinitialisation Complète
```javascript
// En cas de problème majeur
claraverse.clear()           // Vider tout
location.reload()            // Recharger la page
// Puis relancer : claraverse.scan()
```

## 🎉 Succès !

Quand tout fonctionne, vous verrez :
- ✅ Tables avec bordures vertes
- ✅ Cellules éditables avec curseur texte
- ✅ Notifications de sauvegarde
- ✅ Données persistantes après rechargement

---

## 📝 Notes de Version

**Version Actuelle :** 2.0 - Système Complet DOM + localStorage
- 🆕 Persistance double (DOM + localStorage)
- 🆕 API complète de gestion
- 🆕 Interface de test intégrée
- 🆕 Compatible architecture React/SPA
- 🆕 Auto-detection et restauration
- 🆕 Export/Import des données
- 🆕 Monitoring et debug avancés

**Migration depuis v1.x :** Automatique, aucune action requise

---

*💡 Pour toute question ou problème, consultez les logs de la console ou utilisez `claraverse.help()`*
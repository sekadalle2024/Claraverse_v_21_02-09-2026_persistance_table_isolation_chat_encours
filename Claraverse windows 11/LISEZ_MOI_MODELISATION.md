# 📖 LISEZ-MOI - Système de Modélisation Template

## 🎯 Ce qui a été fait

J'ai créé un système complet d'injection de templates dans Claraverse qui détecte automatiquement les tables avec des critères spécifiques et injecte le contenu approprié.

## ✅ Fichiers créés

1. **`public/Modelisation_template.js`** - Script principal (✅ déjà ajouté dans index.html)
2. **`public/diagnostic-modelisation.js`** - Script de diagnostic
3. **`public/test-modelisation-simple.html`** - Page de test standalone
4. **`public/test-modelisation-template.html`** - Page de test complète
5. **`GUIDE_MODELISATION_TEMPLATE.md`** - Documentation complète
6. **`DEMARRAGE_RAPIDE_MODELISATION.md`** - Guide de démarrage
7. **`LISEZ_MOI_MODELISATION.md`** - Ce fichier

## 🚀 Comment tester MAINTENANT

### Option 1: Page de test simple (RECOMMANDÉ)

```bash
# Démarrez votre serveur de dev si ce n'est pas déjà fait
npm run dev

# Puis ouvrez dans votre navigateur:
http://localhost:5173/test-modelisation-simple.html
```

Vous devriez voir :
- ✅ Une table avec "Flowise" et "PARTIE 1"
- ✅ Des logs dans la console intégrée
- ✅ Un template PDF injecté automatiquement après 1 seconde

### Option 2: Dans Claraverse

1. Créez une table dans Flowise qui contient :
   - Le mot "Flowise" (n'importe où)
   - Le mot "PARTIE 1" (n'importe où)

2. Ouvrez la console du navigateur (F12)

3. Tapez :
```javascript
window.ModelisationTemplate.execute()
```

4. Regardez les logs pour voir ce qui se passe

## 🔍 Pourquoi "rien ne fonctionnait" ?

Le problème initial était probablement :

1. **Sélecteur CSS trop spécifique** : Le sélecteur cherchait des classes CSS très précises qui n'existaient peut-être pas
2. **Timing** : Les tables sont chargées dynamiquement, le script s'exécutait trop tôt
3. **Pas de logs de debug** : Impossible de savoir ce qui se passait

## ✅ Ce qui a été corrigé

1. **Sélecteur simplifié** : Maintenant cherche toutes les `<table>` (plus simple, plus robuste)
2. **Délai d'exécution** : Attend 2 secondes avant de s'exécuter
3. **Logs de debug activés** : `CONFIG.debug = true` pour voir tout ce qui se passe
4. **Observateur de mutations** : Détecte automatiquement les nouvelles tables ajoutées
5. **API exposée** : `window.ModelisationTemplate` pour tests manuels

## 📊 Comment ça fonctionne

```
1. Script détecte une table
   ↓
2. Vérifie si elle contient "Flowise"
   ↓
3. Vérifie si elle contient "PARTIE 1" (ou 2, 3, 4, 5)
   ↓
4. Détermine le type (PARTIE1, PARTIE2, etc.)
   ↓
5. Injecte le template approprié
   ↓
6. Initialise les interactions (accordéon, etc.)
```

## 🎨 Les 5 cas d'usage

| Cas | Critère | Source | Template |
|-----|---------|--------|----------|
| Case 1 | PARTIE 1 | DOCX statique | Alpha (PDF) |
| Case 2 | PARTIE 2 | JSON statique | Beta (Accordéon) |
| Case 3 | PARTIE 3 | JSON dynamique (n8n) | Beta (Accordéon) |
| Case 4 | PARTIE 4 | Word dynamique (n8n) | Beta (Accordéon) |
| Case 5 | PARTIE 5 | PDF statique | Beta (Accordéon) |

## 🧪 Tests disponibles

### Test 1: Page simple
```
http://localhost:5173/test-modelisation-simple.html
```
- Test basique avec une table
- Console intégrée
- Boutons de test

### Test 2: Page complète
```
http://localhost:5173/test-modelisation-template.html
```
- Tests des 3 premiers cas
- Interface complète
- Logs détaillés

### Test 3: Console manuelle
```javascript
// Dans la console de Claraverse
window.ModelisationTemplate.execute()
```

### Test 4: Diagnostic complet
Décommentez dans `index.html` :
```html
<script src="/diagnostic-modelisation.js"></script>
```

## 🐛 Dépannage

### Problème: "Aucune table trouvée"

**Vérification** :
```javascript
document.querySelectorAll('table').length
```

**Solution** : Attendez que les tables soient chargées, puis :
```javascript
window.ModelisationTemplate.execute()
```

### Problème: "Table trouvée mais pas de Flowise"

**Vérification** :
```javascript
document.querySelectorAll('table').forEach((t, i) => {
    console.log(`Table ${i}: ${t.textContent.includes('Flowise')}`);
});
```

**Solution** : Assurez-vous que la table contient exactement "Flowise", "FLOWISE" ou "flowise"

### Problème: "Flowise trouvé mais pas de PARTIE"

**Vérification** :
```javascript
document.querySelectorAll('table').forEach((t, i) => {
    console.log(`Table ${i}: ${t.textContent.includes('PARTIE 1')}`);
});
```

**Solution** : La table doit contenir "PARTIE 1" (ou 2, 3, 4, 5)

### Problème: "Template déjà injecté"

**Solution** :
```javascript
// Supprimer l'ancien
document.querySelector('.modelisation-template-container')?.remove();

// Réinjecter
window.ModelisationTemplate.execute();
```

## 📝 Exemple de table qui fonctionne

Dans Flowise, créez une réponse qui génère :

```html
<table>
    <tr>
        <th>Flowise</th>
        <th>Type</th>
    </tr>
    <tr>
        <td>PARTIE 1</td>
        <td>Guide d'audit interne</td>
    </tr>
</table>
```

Le script détectera automatiquement et injectera le template Alpha (format PDF).

## 🎯 Prochaines étapes

1. **Testez la page simple** : `test-modelisation-simple.html`
2. **Si ça fonctionne** : Le système est OK, testez dans Claraverse
3. **Si ça ne fonctionne pas** : Activez le diagnostic et partagez les logs
4. **Personnalisez** : Modifiez les templates dans `Modelisation_template.js`

## 💡 Commandes utiles

```javascript
// Voir la config
window.ModelisationTemplate.config

// Exécuter manuellement
window.ModelisationTemplate.execute()

// Compter les tables
document.querySelectorAll('table').length

// Voir le contenu des tables
document.querySelectorAll('table').forEach((t, i) => {
    console.log(`Table ${i + 1}:`, t.textContent.substring(0, 100));
});

// Supprimer le template injecté
document.querySelector('.modelisation-template-container')?.remove();
```

## ✨ Résultat attendu

Quand tout fonctionne, vous verrez :
- 📄 Un conteneur avec fond gris clair
- 📊 Des pages de style PDF ou un accordéon
- 🎨 Un design professionnel
- ✅ Du contenu formaté et stylisé

Le template apparaît **après la dernière table** de la page de chat.

## 📞 Support

Si rien ne fonctionne après avoir testé `test-modelisation-simple.html` :

1. Ouvrez la console (F12)
2. Tapez : `window.ModelisationTemplate.execute()`
3. Copiez tous les logs
4. Partagez-les pour analyse

Le système est maintenant **beaucoup plus robuste** et **verbeux** pour faciliter le débogage !

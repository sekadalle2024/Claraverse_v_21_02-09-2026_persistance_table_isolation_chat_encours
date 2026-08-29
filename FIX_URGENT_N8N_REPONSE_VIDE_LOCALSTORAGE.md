# 🚨 FIX URGENT : Réponse n8n vide + localStorage saturé

## PROBLÈMES IDENTIFIÉS

### 1. Réponse n8n vide (content-length: 0)
- Status: 200 OK mais aucun contenu
- Erreur: `Unexpected end of JSON input`
- Cause: Configuration incorrecte du node "Respond to Webhook"

### 2. localStorage saturé
- Bloque l'intégration des tables
- Empêche la sauvegarde du cache

### 3. Tables non-cibles ne s'affichent plus
- Seules les tables [Critère table cible] s'affichent
- Problème de filtrage trop restrictif

---

## SOLUTION 1 : Corriger n8n (Respond to Webhook)

### Configuration du node "Respond to Webhook14"

**IMPORTANT** : Dans n8n, ouvrir le node "Respond to Webhook14" et vérifier :

1. **Response Mode** : `Using 'Respond to Webhook' Node`
2. **Response Code** : `200`
3. **Response Body** : `JSON`
4. **Property Name** : Laisser VIDE ou mettre `data`

### Si le problème persiste, utiliser ce code AVANT le webhook :

```javascript
// Node "Code" juste avant "Respond to Webhook14"
const items = $input.all();
const data = items[0].json;

// Forcer le format de réponse
return [{
    json: data
}];
```

---

## SOLUTION 2 : Nettoyer localStorage

Exécuter dans la console du navigateur :

```javascript
// Nettoyage complet localStorage
Object.keys(localStorage).forEach(key => {
    if (key.includes('flowise') || key.includes('n8n') || key.includes('cache')) {
        localStorage.removeItem(key);
    }
});
console.log('✅ localStorage nettoyé');
```

---

## SOLUTION 3 : Fix Flowise.js (gestion réponse vide)

Modifier `queryN8nEndpoint` pour gérer les réponses vides :

```javascript
// Ligne ~813 dans Flowise.js
const responseData = await response.json();
```

Remplacer par :

```javascript
// Vérifier si la réponse a du contenu
const contentLength = response.headers.get('content-length');
if (contentLength === '0' || contentLength === 0) {
    console.warn('⚠️ Réponse n8n vide, utilisation du cache ou données par défaut');
    return {
        output: "⚠️ Réponse vide de n8n",
        status: "empty_response",
        timestamp: new Date().toISOString()
    };
}

const responseData = await response.json();
```

---

## SOLUTION 4 : Fix affichage toutes les tables

Le problème vient probablement du filtrage. Vérifier dans Flowise.js la fonction `collectCriteriaTables`.

---

## TEST RAPIDE

1. Nettoyer localStorage (Solution 2)
2. Recharger la page (F5)
3. Tester avec "Programme de travail"
4. Vérifier la console pour les logs

---

## ORDRE D'APPLICATION

1. ✅ Nettoyer localStorage (immédiat)
2. ✅ Corriger Flowise.js (gestion réponse vide)
3. ✅ Vérifier configuration n8n
4. ✅ Tester


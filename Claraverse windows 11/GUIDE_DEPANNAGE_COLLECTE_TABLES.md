# 🚨 GUIDE DE DÉPANNAGE - Collecte de Tables Non Fonctionnelle

## Problème Identifié
- ✗ Aucune collecte de tables ne se déclenche
- ✗ Aucun log d'appel API n8n dans la console
- ✗ Aucune opération enregistrée dans Google Sheets

## 🔍 Diagnostic en 3 Étapes

### ÉTAPE 1: Test de Chargement du Script

**Ouvrir le fichier de test:**
```
TEST_FLOWISE_CHARGEMENT.html
```

**Dans votre navigateur:**
1. Ouvrir le fichier avec votre serveur de dev
2. Ouvrir la console (F12)
3. Observer les résultats

**Ce que vous devriez voir:**
- ✅ Script Flowise.js chargé
- ✅ Table Flowise détectée
- ✅ Tables correspondantes trouvées
- ✅ Logs d'initialisation dans la console

### ÉTAPE 2: Diagnostic Console

**Copier-coller dans la console du navigateur:**
```javascript
// Charger le diagnostic
fetch('DIAGNOSTIC_URGENT_COLLECTE_TABLES.js')
  .then(r => r.text())
  .then(eval);
```

**Ou ouvrir le fichier:**
```
DIAGNOSTIC_URGENT_COLLECTE_TABLES.js
```
Et copier tout le contenu dans la console.

### ÉTAPE 3: Vérifier l'Endpoint n8n

**Test rapide dans la console:**
```javascript
fetch('http://localhost:5678/webhook/htlm_processor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'Test' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## 🔧 Solutions aux Problèmes Courants

### Problème A: Script Flowise.js Non Chargé

**Symptômes:**
- Aucun log "🚀 Initialisation du script dynamique" dans la console
- Script non trouvé dans les sources du navigateur

**Solutions:**
1. Vérifier que `index.html` contient:
   ```html
   <script src="/Flowise.js"></script>
   ```

2. Vérifier que le fichier existe:
   ```
   public/Flowise.js
   ```

3. Recharger la page avec cache vidé:
   ```
   Ctrl + F5 (Windows)
   Cmd + Shift + R (Mac)
   ```

4. Vérifier la console pour erreurs 404

### Problème B: Table Flowise Manquante

**Symptômes:**
- Log "❌ Aucune table avec en-tête 'Flowise' trouvée"

**Solutions:**
1. Créer une table avec exactement cet en-tête: **Flowise**
2. La première cellule doit contenir le mot-clé à rechercher
3. Exemple:
   ```
   | Flowise |
   |---------|
   | Gestion stratégique |
   ```

### Problème C: Tables Rubrique+Description Manquantes

**Symptômes:**
- Log "❌ Aucune table Rubrique+Description trouvée"

**Solutions:**
1. Vérifier que vos tables ont EXACTEMENT ces en-têtes:
   - **Rubrique**
   - **Description**

2. Respecter la casse (majuscules/minuscules)

3. Les tables doivent être dans des divs avec classe:
   ```html
   <div class="prose prose-base dark:prose-invert max-w-none">
     <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
       ...
     </table>
   </div>
   ```

### Problème D: Mot-clé Non Trouvé

**Symptômes:**
- Tables détectées mais aucune correspondance
- Log "❌ Mot-clé NON trouvé dans cette table"

**Solutions:**
1. Vérifier que le mot-clé de la table Flowise est présent dans la colonne **Description**

2. Le mot-clé peut être n'importe où dans le texte de Description

3. La recherche est insensible à la casse

4. Exemple valide:
   ```
   | Rubrique | Description |
   |----------|-------------|
   | Test | Ceci concerne la Gestion stratégique |
   ```

### Problème E: Endpoint n8n Inaccessible

**Symptômes:**
- Erreur "Failed to fetch"
- Erreur CORS
- Timeout

**Solutions:**

1. **Démarrer n8n:**
   ```bash
   npm run n8n
   # ou
   n8n start
   ```

2. **Vérifier que n8n est accessible:**
   - Ouvrir http://localhost:5678
   - Vous devriez voir l'interface n8n

3. **Activer le workflow:**
   - Ouvrir le workflow "htlm_processor"
   - Cliquer sur "Active" en haut à droite

4. **Configurer CORS dans n8n:**
   - Dans le node "Respond to Webhook"
   - Options > Response Headers
   - Ajouter:
     ```
     Access-Control-Allow-Origin: *
     Access-Control-Allow-Methods: POST, OPTIONS
     Access-Control-Allow-Headers: Content-Type
     ```

5. **Vérifier l'URL du webhook:**
   - Doit être: `http://localhost:5678/webhook/htlm_processor`
   - Vérifier dans Flowise.js ligne ~30

### Problème F: MutationObserver Non Actif

**Symptômes:**
- Script chargé mais aucune détection de nouvelles tables

**Solutions:**
1. Vérifier les logs dans la console:
   ```
   👀 MutationObserver activé
   🔍 Nouvelle table détectée
   ```

2. Si absents, le script ne s'initialise pas correctement

3. Vérifier les erreurs JavaScript dans la console

4. Recharger la page

## 📊 Checklist Complète

Avant de demander de l'aide, vérifier:

- [ ] Flowise.js est chargé (visible dans Sources du navigateur)
- [ ] Log "🚀 Initialisation" visible dans la console
- [ ] Table Flowise présente avec mot-clé
- [ ] Tables Rubrique+Description présentes
- [ ] Mot-clé présent dans colonne Description
- [ ] n8n démarré et accessible
- [ ] Workflow htlm_processor actif
- [ ] CORS configuré dans n8n
- [ ] Aucune erreur dans la console

## 🆘 Si le Problème Persiste

1. **Capturer les logs:**
   - Ouvrir la console (F12)
   - Exécuter le diagnostic complet
   - Copier TOUS les logs

2. **Capturer les erreurs:**
   - Noter toutes les erreurs en rouge
   - Noter les warnings en jaune

3. **Partager:**
   - Les logs du diagnostic
   - Les erreurs de la console
   - Une capture d'écran de vos tables
   - La version de votre navigateur

## 🔄 Réinitialisation Complète

Si rien ne fonctionne:

1. **Vider le cache:**
   ```
   Ctrl + Shift + Delete
   Cocher "Cache" et "Cookies"
   Vider
   ```

2. **Redémarrer n8n:**
   ```bash
   # Arrêter n8n
   Ctrl + C
   
   # Redémarrer
   npm run n8n
   ```

3. **Recharger la page:**
   ```
   Ctrl + F5
   ```

4. **Réexécuter le diagnostic**

## 📞 Support

Si après toutes ces étapes le problème persiste, fournir:
- Logs complets du diagnostic
- Erreurs de la console
- Version du navigateur
- Version de n8n
- Capture d'écran des tables

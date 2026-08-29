# ✅ Test de Persistance - Instructions Immédiate

## 🚀 ÉTAPE 1: Redémarrer l'Application (OBLIGATOIRE)

### Arrêter les Serveurs
Si les serveurs tournent, arrêtez-les avec **Ctrl+C** dans chaque terminal.

### Démarrer le Backend
```bash
cd packages/server
python app.py
```

### Démarrer le Frontend (Dans un nouveau terminal)
```bash
npm run dev
```

**⏰ Attendez que les deux serveurs soient complètement démarrés.**

---

## 🔍 ÉTAPE 2: Ouvrir la Console du Navigateur

1. Ouvrir l'application dans le navigateur: `http://localhost:3000`
2. Appuyer sur **F12** (ou Fn+F12 sur certains ordinateurs)
3. Cliquer sur l'onglet **Console**

---

## 👀 ÉTAPE 3: Vérifier les Messages de Chargement

Dans la console, vous devriez voir ces messages:

```
🔗 Démarrage intégration conso.js → IndexedDB
⏳ En attente de claraverseProcessor...
✅ claraverseProcessor détecté, début de l'intégration
🔧 Modification des méthodes de persistance de conso.js
✅ Intégration conso.js → IndexedDB terminée
✅ API de debugging exposée: window.consoIndexedDBIntegration
```

**✅ SI VOUS VOYEZ CES MESSAGES:** L'intégration est chargée, passez à l'étape 4.

**❌ SI VOUS NE VOYEZ PAS CES MESSAGES:**
- Vérifiez que les serveurs sont bien démarrés
- Appuyez sur **Ctrl+Shift+R** pour forcer le rechargement
- Vérifiez les erreurs en rouge dans la console

---

## 🧪 ÉTAPE 4: Diagnostic Automatique (3 secondes)

Après 3 secondes, vous verriez automatiquement un diagnostic complet s'afficher.

**SI LE DIAGNOSTIC NE S'AFFICHE PAS**, copiez cette ligne dans la console et appuyez sur Entrée:

```javascript
window.runDiagnostic()
```

**Copier-coller:** Sélectionnez la ligne ci-dessus → Ctrl+C → Cliquez dans la console → Ctrl+V → Entrée

Le diagnostic va afficher 8 sections. **PRENEZ UNE CAPTURE D'ÉCRAN** ou copiez le résultat complet.

---

## 📊 ÉTAPE 5: Test Rapide (30 secondes)

Copiez cette ligne dans la console et appuyez sur Entrée:

```javascript
consoIndexedDBIntegration.quickTest()
```

Vous devriez voir:

```
🚀 TEST RAPIDE - Intégration IndexedDB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Intégration chargée
✅ SessionId: stable_session_...
✅ X table(s) détectée(s)
✅ Test rapide terminé
```

**✅ SI TOUT EST VERT:** Le système est chargé correctement.

**❌ SI DES CROIX ROUGES OU WARNINGS ORANGES:**
- Copiez le résultat complet
- Passez à l'étape 6 (Test de sauvegarde)

---

## 💾 ÉTAPE 6: Test de Sauvegarde Réel

### A. Générer une Table (si pas déjà fait)

Dans l'application, générez une **Table_conso** ou **Table_Résultat**:
- Utilisez la fonctionnalité de consolidation de votre application
- Ou chargez un document qui génère ces tables

### B. Modifier la Table

1. Trouvez une cellule avec **"Assertion"** ou **"Conclusion"** dans les en-têtes
2. **Cliquez** sur une cellule de cette colonne
3. Un menu déroulant devrait apparaître
4. **Sélectionnez une valeur**

### C. Observer la Console

**Immédiatement après avoir sélectionné une valeur**, vous devriez voir dans la console:

```
💾 [IndexedDB] Début de sauvegarde immédiate
🔑 Keyword extrait: Table_Consolidation
📍 SessionId: stable_session_...
✅ [IndexedDB] Événement de sauvegarde émis pour: Table_Consolidation
💾 [ÉVÉNEMENT] flowise:table:save:request détecté
   Keyword: Table_Consolidation
   SessionId: stable_session_...
   Source: conso
✅ [ÉVÉNEMENT] flowise:table:save:success
   Keyword: Table_Consolidation
✅ [IndexedDB] Sauvegarde confirmée pour: Table_Consolidation
```

**✅ SI VOUS VOYEZ CES MESSAGES:** La sauvegarde fonctionne ! Passez à l'étape 7.

**❌ SI AUCUN MESSAGE:**
- La fonction de sauvegarde n'est pas déclenchée
- **Copiez ce qui s'affiche dans la console et envoyez-le moi**

**⚠️ SI VOUS VOYEZ DES ERREURS ROUGES:**
- **Copiez l'erreur complète et envoyez-la moi**

---

## 🔄 ÉTAPE 7: Test de Restauration (Actualisation)

1. Notez la valeur que vous avez sélectionnée à l'étape 6
2. Appuyez sur **F5** (actualiser la page)
3. Attendez que la page se recharge complètement
4. Retournez voir la table

**✅ SI LA VALEUR EST TOUJOURS LÀ:** SUCCÈS ! La persistance fonctionne !

**❌ SI LA VALEUR A DISPARU:**
- Vérifiez la console après le F5
- Cherchez des messages de restauration: `🔄 [Restauration]`
- Copiez tout ce qui s'affiche et envoyez-le moi

---

## 🔍 ÉTAPE 8: Vérifier IndexedDB

1. Dans les outils de développement (F12)
2. Cliquez sur l'onglet **"Application"** (ou "Storage" dans Firefox)
3. Dans le menu de gauche, trouvez **"IndexedDB"**
4. Cliquez sur **"clara_db"** → **"clara_generated_tables"**
5. Vous devriez voir des entrées dans la liste

**Cliquez sur une entrée** et vérifiez:
- `keyword`: devrait être "Table_Consolidation" ou "Table_Resultat"
- `sessionId`: devrait commencer par "stable_session_"
- `html`: devrait contenir le code HTML de la table

**✅ SI VOUS VOYEZ DES DONNÉES:** Les tables sont bien sauvegardées dans IndexedDB.

**❌ SI AUCUNE DONNÉE:** La sauvegarde ne fonctionne pas.

---

## 📋 RÉSULTATS À M'ENVOYER

Copiez et complétez ce formulaire:

```
=== RÉSULTATS DES TESTS ===

ÉTAPE 3 - Messages de chargement:
[ ] OUI, j'ai vu les messages ✅
[ ] NON, pas de messages

ÉTAPE 4 - Diagnostic automatique:
[ ] S'est affiché automatiquement
[ ] J'ai dû taper window.runDiagnostic()
[ ] N'a pas fonctionné

Résultat du diagnostic:
[Coller ici le résultat complet]

ÉTAPE 5 - Test rapide:
[ ] Tout vert ✅
[ ] Des warnings ⚠️
[ ] Des erreurs ❌

Résultat:
[Coller ici]

ÉTAPE 6 - Test de sauvegarde:
[ ] Messages verts dans console ✅
[ ] Aucun message
[ ] Messages d'erreur

Messages vus:
[Coller ici]

ÉTAPE 7 - Test d'actualisation:
[ ] Valeur conservée après F5 ✅
[ ] Valeur perdue ❌

ÉTAPE 8 - IndexedDB:
[ ] Données présentes ✅
[ ] Aucune donnée ❌

Nombre d'entrées: ___

PROBLÈME PRINCIPAL:
[Décrire en une phrase]
```

---

## 🆘 AIDE RAPIDE

### Si "consoIndexedDBIntegration is not defined"

Le script n'est pas chargé. Vérifiez:
1. Terminal frontend: y a-t-il des erreurs?
2. Console navigateur: Onglet "Réseau" (Network)
3. Filtrer par "conso-indexeddb"
4. Statut doit être 200 (vert)

### Si "claraverseProcessor is not defined"

conso.js n'est pas chargé. Vérifiez:
1. Que le backend tourne bien
2. Rechargez la page (Ctrl+Shift+R)

### Si "flowiseTableBridge is not defined"

Les services TypeScript ne sont pas compilés. Solution:
1. Arrêter le frontend (Ctrl+C)
2. Redémarrer: `npm run dev`

---

## ✅ SUCCÈS = Tous les Points Validés

- [x] Messages de chargement vus
- [x] Test rapide tout vert
- [x] Messages de sauvegarde vus dans console
- [x] Événements flowise:table:save émis
- [x] Valeur conservée après F5
- [x] Données dans IndexedDB

**Si tous cochés → Le problème est résolu ! 🎉**

---

## 📞 AIDE SUPPLÉMENTAIRE

Si un test échoue, **NE PAS CONTINUER**.

**Envoyez-moi:**
1. Le numéro de l'étape qui a échoué
2. Ce qui s'affiche dans la console (copier-coller)
3. Les erreurs en rouge (si il y en a)

Je vous donnerai les corrections précises à faire.

---

*Guide créé le 29 août 2026*
*Durée totale: 5-10 minutes*

# Guide de Test - Nouveaux Modes "Methodo audit" et "Guide des commandes"

## Comment tester les modifications

### 1. Démarrer l'application

```powershell
# Démarrer le frontend
npm run dev

# Ou si vous utilisez le script de démarrage
.\start-claraverse.ps1
```

### 2. Accéder au menu Démarrer

1. Ouvrir l'interface E-audit
2. Cliquer sur le bouton "Démarrer" (icône Play)
3. Naviguer vers **E-audit pro** > **Phase de préparation**

### 3. Vérifier les nouveaux modes

#### Test 1 : Collecte documentaire
1. Cliquer sur "Collecte documentaire"
2. Vérifier que 4 modes sont disponibles :
   - ✅ Normal
   - ✅ Avancé
   - ✅ **Methodo audit** (nouveau)
   - ✅ **Guide des commandes** (nouveau)

#### Test 2 : Vérifier la commande générée

1. Sélectionner le mode "Methodo audit"
2. La commande générée doit contenir :
```
[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = Cartographie des risques
[Etape de mission] = Collecte documentaire
[Modele] : Processus, document, Direction, operationnel
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide Methodo] : Activate
[Nb de lignes] = 30
```

3. Sélectionner le mode "Guide des commandes"
4. La commande générée doit contenir :
```
[Command] = Etape de mission
[Processus] = rapprochements bancaires
[Etape précédente] = Cartographie des risques
[Etape de mission] = Collecte documentaire
[Modele] : Processus, document, Direction, operationnel
[Variable 1] = Contenu de [Variable 1]
[Variable 2] = Contenu de [Variable 2]
[Guide des commandes] : Activate
[Nb de lignes] = 30
```

### 4. Tester toutes les étapes modifiées

#### E-audit pro - Phase de préparation
- [ ] Collecte documentaire
- [ ] Questionnaire prise de connaissance
- [ ] Cartographie des processus
- [ ] Referentiel de controle interne
- [ ] Rapport d'orientation

#### E-revision - Planification
- [ ] Design
- [ ] Implementation

### 5. Vérifier l'insertion dans le chat

1. Sélectionner un mode (ex: "Methodo audit")
2. Cliquer pour insérer la commande
3. Vérifier que la commande apparaît correctement dans la zone de saisie du chat
4. Vérifier que `[Guide Methodo] : Activate` est bien présent AVANT `[Nb de lignes]`

### 6. Test d'intégration complète

1. Insérer une commande avec le mode "Methodo audit"
2. Envoyer la commande au LLM
3. Vérifier que le LLM traite correctement la variable `[Guide Methodo] : Activate`
4. Répéter avec le mode "Guide des commandes"

## Points de vérification

### ✅ Interface utilisateur
- [ ] Les nouveaux modes apparaissent dans la liste
- [ ] Les labels sont corrects ("Methodo audit" et "Guide des commandes")
- [ ] L'ordre des modes est correct (Normal, Avancé, Methodo audit, Guide des commandes)

### ✅ Génération de commandes
- [ ] Les commandes contiennent les bonnes variables
- [ ] `[Guide Methodo] : Activate` est placé avant `[Nb de lignes]`
- [ ] `[Guide des commandes] : Activate` est placé avant `[Nb de lignes]`
- [ ] Toutes les autres variables sont présentes

### ✅ Fonctionnement
- [ ] L'insertion dans le chat fonctionne
- [ ] Pas d'erreurs dans la console
- [ ] Le menu se ferme correctement après sélection

## Résolution de problèmes

### Les nouveaux modes n'apparaissent pas
1. Vérifier que le fichier `DemarrerMenu.tsx` a été sauvegardé
2. Recharger la page (Ctrl+R ou F5)
3. Vider le cache du navigateur (Ctrl+Shift+R)
4. Redémarrer le serveur de développement

### Erreurs dans la console
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs JavaScript
3. Vérifier que le fichier compile sans erreur :
```powershell
npm run build
```

### Les commandes ne s'insèrent pas
1. Vérifier que la fonction `onInsertCommand` fonctionne
2. Tester avec un mode existant (Normal ou Avancé)
3. Vérifier les logs dans la console

## Commandes utiles

```powershell
# Vérifier les erreurs de compilation
npm run build

# Démarrer en mode développement
npm run dev

# Vérifier les diagnostics TypeScript
npx tsc --noEmit

# Redémarrer complètement
.\stop-claraverse.ps1
.\start-claraverse.ps1
```

## Résultat attendu

Après ces tests, vous devriez avoir :
- ✅ 2 nouveaux modes disponibles pour 7 étapes de mission
- ✅ Les commandes générées contiennent les nouvelles variables
- ✅ L'interface fonctionne sans erreur
- ✅ Les commandes s'insèrent correctement dans le chat

---

**Si tous les tests passent, les modifications sont opérationnelles !** ✅

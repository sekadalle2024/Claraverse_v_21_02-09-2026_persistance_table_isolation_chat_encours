# Test de Formatage des Commandes - Menu Démarrer

## Problème Résolu

Le menu démarrer générait des commandes au format normal (sans tirets), ce qui causait l'échec des prompts envoyés vers l'endpoint n8n.

## Solution Implémentée

Une fonction `formatCommandWithBullets()` a été ajoutée dans `DemarrerMenu.tsx` pour convertir automatiquement toutes les commandes au format liste à puces.

## Exemples de Transformation

### Avant (Format Normal - Échoue)
```
[Command] = Couverture
[Processus] = Sécurité trésorerie
[Contrôle] = Verifier l exhaustivite des inventaires de caisse
[Instruction] = Template
[Nb de lignes] = 15
```

### Après (Format Formaté - Réussit)
```
- [Command] = Couverture
- [Processus] = Sécurité trésorerie
- [Contrôle] = Verifier l exhaustivite des inventaires de caisse
- [Instruction] = Template
- [Nb de lignes] = 15
```

## Fonctionnement de la Fonction

La fonction `formatCommandWithBullets()` :
1. Divise la commande en lignes individuelles
2. Pour chaque ligne qui commence par `[`, ajoute un tiret `- ` au début
3. Préserve les lignes vides et les autres formats (comme les objets JSON)
4. Évite de dupliquer les tirets si déjà présents

## Tests à Effectuer

### Test 1 : E-audit pro - Feuille de couverture
1. Ouvrir le menu Démarrer
2. Sélectionner "E-audit pro"
3. Aller dans "Phase de réalisation"
4. Cliquer sur "Feuille couverture"
5. Choisir le mode "Normal"
6. Vérifier que la commande générée contient des tirets devant chaque ligne

### Test 2 : E-revision - Design
1. Ouvrir le menu Démarrer
2. Sélectionner "E-revision"
3. Aller dans "Planification"
4. Cliquer sur "Design"
5. Choisir le mode "Normal" ou "Demo"
6. Vérifier le formatage avec tirets

### Test 3 : E-revision - Programme de contrôle (Cycles)
1. Ouvrir le menu Démarrer
2. Sélectionner "E-revision"
3. Aller dans "Programme de contrôle"
4. Sélectionner un cycle (ex: "Trésorerie")
5. Cliquer sur un test (ex: "AA040 - Rapprochements")
6. Choisir le mode "Normal"
7. Vérifier le formatage avec tirets

## Fichiers Modifiés

- `src/components/Clara_Components/DemarrerMenu.tsx`
  - Ajout de la fonction `formatCommandWithBullets()`
  - Modification de `handleModeClick()` pour appliquer le formatage

## Impact

✅ Toutes les commandes générées par le menu Démarrer sont maintenant au format liste à puces
✅ Les prompts envoyés vers l'endpoint n8n devraient maintenant réussir
✅ Aucun changement dans l'interface utilisateur
✅ Compatibilité maintenue avec tous les logiciels (E-audit pro, E-revision, E-carto, etc.)

## Notes Techniques

- La fonction préserve l'indentation et les espaces
- Les objets JSON complexes (comme dans les commandes Implementation) sont préservés
- Les lignes vides sont maintenues pour la lisibilité
- Pas de duplication de tirets si déjà présents

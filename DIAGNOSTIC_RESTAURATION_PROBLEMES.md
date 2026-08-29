# Diagnostic des Problèmes de Restauration

## Problèmes Identifiés

### 1. Duplications de Tables
- Chaque container restauré contient 3-4 copies identiques de la même table
- Exemple : Container "Cycle" a 4 tables "Cycle, Description" identiques

### 2. Mauvais Positionnement DOM
- Les containers sont insérés dans `.max-w-4xl.mx-auto` 
- Ils devraient être dans `.space-y-5` (le conteneur des messages du chat)
- Résultat : Les tables apparaissent en dehors du flux du chat

### 3. Superposition Entre Chats
- Les tables restaurées apparaissent dans tous les chats (anciens et nouveaux)
- Elles se superposent au-dessus du contenu existant

## Causes Probables

### Duplication
- Le lazy loader appelle `preload()` plusieurs fois pour la même table
- Le système de restauration restaure la même table plusieurs fois
- Pas de vérification si une table est déjà restaurée

### Positionnement
- `findChatContainer()` trouve `.max-w-4xl` au lieu de `.space-y-5`
- Les containers sont créés au mauvais niveau de la hiérarchie DOM

### Superposition
- Les containers restaurés ne sont pas liés à un chat spécifique
- Ils sont ajoutés globalement et apparaissent partout

## Solutions Proposées

### 1. Empêcher les Duplications
- Ajouter un flag `data-restoration-in-progress` pendant la restauration
- Vérifier si une table avec le même ID existe déjà avant de restaurer
- Désactiver le preload forcé dans `createTableWrapper()`

### 2. Corriger le Positionnement
- Ne PAS créer de nouveaux containers lors de la restauration
- Trouver les containers originaux existants dans le chat
- Remplacer le contenu des containers originaux par les versions restaurées

### 3. Éviter la Superposition
- Restaurer uniquement dans le chat actif
- Utiliser les containers existants au lieu d'en créer de nouveaux
- Supprimer les anciens containers avant de restaurer

## Approche Recommandée

**Stratégie : Restauration In-Place**

Au lieu de créer de nouveaux containers, on devrait :
1. Trouver les containers originaux existants (par leur `data-container-id`)
2. Remplacer leur contenu par les versions restaurées
3. Ne jamais créer de nouveaux containers lors de la restauration

Cela éviterait tous les problèmes de positionnement et de duplication.

# 07 - Points d'Attention et Meilleures Pratiques

Ce document résume les points critiques pour la maintenance du script `conso.js` et les standards à respecter pour tout nouveau développement lié aux tables.

## 🚨 Points d'Attention (⚠️ Warning)

### 1. Structure du DOM React
React peut reconstruire l'intégralité du DOM de la conversation à tout moment (ex: nouveau message reçu).
- **Conséquence** : Les éléments injectés hors React (comme la Table de Consolidation ou les modifications de style) disparaîtront.
- **Action** : Le script utilise un `setInterval` et un `MutationObserver` pour redétecter et réinjecter continuellement ce qui manque.

### 2. Le "Piège" du Premier Sélecteur
Ne jamais se fier au premier élément `td` trouvé dans une table pour injecter des données.
- **Risque** : Écraser le titre de la table ou la première colonne d'index (No).
- **Règle** : Toujours utiliser une boucle de validation qui vérifie si le contenu de la cellule contient déjà les en-têtes recherchés.

### 3. Conflits d'IDs
L'utilisation de hash basés sur les en-têtes est sensible au moindre changement de ponctuation ou de casse dans les titres de colonnes.
- **Action** : Si vous changez le nom d'une colonne (ex: de "Assertion" à "Type d'Assertion"), l'ID de la table changera, et les données sauvegardées dans `localStorage` ne seront plus liées tant qu'elles ne seront pas ré-enregistrées.

## ✅ Meilleures Pratiques (Best Practices)

### 1. Utilisation des Classes Claraverse
Toujours utiliser les classes `claraverse-conso-table` pour les tables générées par script. Cela permet aux autres outils (comme `dev.js`) de savoir qu'ils ne doivent pas traiter ces tables comme des sources de données.

### 2. Feedback Visuel Systématique
Le système de bordures clignotantes doit être maintenu. C'est le seul moyen rapide de savoir si le script a trouvé la bonne table dans un environnement aussi dense que le chatbot.
- **Vert** : Succès nominal.
- **Magenta/Orange** : Succès par stratégie de secours (indique une structure DOM non-standard).

### 3. Logique de "Don't Repeat Yourself" (DRY)
Les fonctions de recherche de table doivent être centralisées dans `ClaraverseTableProcessor`. Éviter de ré-implémenter des `querySelector` manuels dans d'autres parties du code pour minimiser les risques de bugs lors de changements de structure.

### 4. Sauvegarde via Custom Events
Pour synchroniser `conso.js` avec le reste du système (notamment `dev.js`), privilégier l'émission d'événements personnalisés :
```javascript
this.notifyTableUpdate(table, "resultat-table-update");
```
Cela permet une propagation propre des données sans dépendances circulaires entre fichiers.

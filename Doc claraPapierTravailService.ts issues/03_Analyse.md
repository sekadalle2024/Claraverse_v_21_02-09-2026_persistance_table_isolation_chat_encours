# Analyse des Causes Racines

### 1. Incompatibilité de Format d'Entrée
Le webhook de n8n renvoie un contenu sous forme de **Markdown brut**. Le composant standard de ClaraVerse (ReactMarkdown) affiche nativement le Markdown avec son thème classique (en-têtes rouges), ce qui est le résultat final souhaité.

### 2. Modélisation Initiale de N8n (Cause Phase 1)
Les tables "Signature Worksheet" et "Feuille de couverture" générées par le webhook disposent leurs données horizontalement (en-têtes de colonnes). Le parseur natif se contente d'afficher ce qu'il reçoit, créant ainsi des tableaux trop larges avec une seule ligne de données et de nombreuses colonnes.

### 3. Effet de Bord de la Génération HTML (Cause Phase 2)
Une première correction tentait de convertir ces tables en passant par le `claraPapierTravailService` pour générer un HTML personnalisé (style bleu, conteneurs, titres). 
- Bien que cela ait réglé le problème des colonnes, le rendu **HTML imposé** remplaçait et désactivait le rendu Markdown natif.
- Résultat : une perte d'harmonie visuelle, car les CSS générés localement par le service entraient en conflit avec le thème standard attendu par l'utilisateur.

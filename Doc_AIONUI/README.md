# CSS des Tables Claraverse pour AIONUI

Ce dossier contient le CSS extrait du projet Claraverse pour les tables du chat, prêt à être intégré dans le projet AIONUI.

## Fichiers

- `claraverse-tables.css` - Styles CSS complets pour les tables

## Utilisation

### 1. Importer le CSS dans votre projet AIONUI

```html
<link rel="stylesheet" href="path/to/claraverse-tables.css">
```

Ou dans votre fichier CSS principal:

```css
@import url('./claraverse-tables.css');
```

### 2. Structure HTML recommandée

```html
<div class="prose prose-base dark:prose-invert max-w-none">
  <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
    <thead>
      <tr>
        <th>Colonne 1</th>
        <th>Colonne 2</th>
        <th>Colonne 3</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Donnée 1</td>
        <td>Donnée 2</td>
        <td>Donnée 3</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 3. Sélecteur CSS JavaScript

Pour cibler les tables avec JavaScript:

```javascript
const chatTables = document.querySelectorAll(
  'div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg'
);
```

## Caractéristiques

- En-têtes rouge bordeaux (#6b1102)
- Ombres portées prononcées
- En-têtes sticky (restent visibles au scroll)
- Support mode sombre
- Effet hover sur les lignes
- Scroll horizontal automatique
- 3 thèmes disponibles: défaut, gris, blanc

## Classes Tailwind requises

Si vous utilisez Tailwind CSS, assurez-vous d'avoir ces classes:
- `prose`, `prose-base`, `dark:prose-invert`, `max-w-none`
- `min-w-full`, `border`, `rounded-lg`
- `border-gray-200`, `dark:border-gray-700`

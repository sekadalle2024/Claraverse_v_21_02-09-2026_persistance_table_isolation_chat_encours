# Pourquoi les Tirets Simples sont Nécessaires dans les Tableaux Markdown

## 🎯 Problème Observé

Les tableaux s'affichaient en une seule ligne sans structure:

```
| Intitule | |──────────────| | Défaut de sécurisation...
```

Au lieu de:

```
┌──────────────────────────────────────────────────────────┐
│ Intitule (EN GRAS)                                       │
├──────────────────────────────────────────────────────────┤
│ Défaut de sécurisation physique des fonds...            │
└──────────────────────────────────────────────────────────┘
```

## 🔍 Cause Racine

Le séparateur utilisait des **caractères Unicode** `─` (U+2500) au lieu de **tirets simples** `-` (U+002D).

### Caractère Incorrect: `─` (U+2500)
- **Nom Unicode:** BOX DRAWINGS LIGHT HORIZONTAL
- **Catégorie:** Caractère de dessin de boîte
- **Usage:** Dessin de bordures et de cadres
- **Problème:** Non reconnu comme séparateur de tableau Markdown

### Caractère Correct: `-` (U+002D)
- **Nom Unicode:** HYPHEN-MINUS
- **Catégorie:** Ponctuation
- **Usage:** Tiret, signe moins, séparateur Markdown
- **Avantage:** Reconnu par tous les parseurs Markdown

## 📖 Spécification Markdown (GFM)

Selon la spécification GitHub Flavored Markdown (GFM), les tableaux doivent utiliser:

### Syntaxe Correcte
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### Règles du Séparateur
1. Le séparateur doit être composé de **tirets simples** `-`
2. Le séparateur doit avoir **au moins 3 tirets** par colonne
3. Les pipes `|` délimitent les colonnes
4. Les espaces autour des pipes sont optionnels

### Exemple Minimal
```markdown
| Header |
|--------|
| Cell   |
```

## 🔧 Code Incorrect vs Correct

### ❌ Code Incorrect (Caractères Unicode)
```typescript
let md = `\n| **${headerText}** |\n`;
md += `|${'─'.repeat(headerText.length + 6)}|\n`;  // ❌ U+2500
md += `| ${cellValue} |\n\n`;
```

**Génère:**
```markdown
| **Intitule** |
|──────────────|  ← Caractères Unicode (non reconnus)
| Défaut de sécurisation... |
```

**Résultat:** Le parseur Markdown ne reconnaît pas `─` comme séparateur et affiche tout en une seule ligne.

### ✅ Code Correct (Tirets Simples)
```typescript
let md = `\n| **${headerText}** |\n`;
md += `|${'-'.repeat(headerText.length + 6)}|\n`;  // ✅ U+002D
md += `| ${cellValue} |\n\n`;
```

**Génère:**
```markdown
| **Intitule** |
|--------------|  ← Tirets simples (reconnus)
| Défaut de sécurisation... |
```

**Résultat:** Le parseur Markdown reconnaît `-` comme séparateur et rend correctement le tableau.

## 🧪 Test de Compatibilité

### Parseurs Markdown Testés

| Parseur | Tirets `-` | Unicode `─` |
|---------|------------|-------------|
| ReactMarkdown | ✅ OK | ❌ Échec |
| GitHub | ✅ OK | ❌ Échec |
| CommonMark | ✅ OK | ❌ Échec |
| Marked | ✅ OK | ❌ Échec |
| Showdown | ✅ OK | ❌ Échec |

**Conclusion:** Tous les parseurs Markdown standard nécessitent des tirets simples `-`.

## 📊 Comparaison Visuelle

### Avec Caractères Unicode `─`
```
Input:  | **Intitule** |
        |──────────────|
        | Défaut... |

Output: | Intitule | |──────────────| | Défaut... |
        ↑ Tout en une seule ligne (cassé)
```

### Avec Tirets Simples `-`
```
Input:  | **Intitule** |
        |--------------|
        | Défaut... |

Output: ┌──────────────────────────────────────┐
        │ Intitule (EN GRAS)                   │
        ├──────────────────────────────────────┤
        │ Défaut de sécurisation...            │
        └──────────────────────────────────────┘
        ↑ Tableau correctement structuré
```

## 🎨 Rendu HTML

### Avec Tirets Simples (Correct)
```html
<table>
  <thead>
    <tr>
      <th><strong>Intitule</strong></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Défaut de sécurisation physique des fonds...</td>
    </tr>
  </tbody>
</table>
```

### Avec Caractères Unicode (Incorrect)
```html
<p>| Intitule | |──────────────| | Défaut de sécurisation...</p>
```
↑ Rendu comme paragraphe au lieu de tableau

## 🔍 Détection du Problème

### Dans le Code Source
```typescript
// ❌ Mauvais: Caractère Unicode
const separator = '─'.repeat(10);  // U+2500

// ✅ Bon: Tiret simple
const separator = '-'.repeat(10);  // U+002D
```

### Dans le Markdown Généré
```markdown
# ❌ Mauvais
|──────────────|

# ✅ Bon
|--------------|
```

### Dans les Logs Console
```javascript
// Vérifier le code Unicode
console.log('─'.charCodeAt(0));  // 9472 (U+2500) ❌
console.log('-'.charCodeAt(0));  // 45 (U+002D) ✅
```

## 📚 Références

### Spécifications Markdown
- **GitHub Flavored Markdown (GFM):** https://github.github.com/gfm/#tables-extension-
- **CommonMark:** https://spec.commonmark.org/
- **Markdown Guide:** https://www.markdownguide.org/extended-syntax/#tables

### Parseurs Markdown
- **ReactMarkdown:** https://github.com/remarkjs/react-markdown
- **remarkGfm:** https://github.com/remarkjs/remark-gfm
- **remark-parse:** https://github.com/remarkjs/remark/tree/main/packages/remark-parse

### Unicode
- **U+2500 (BOX DRAWINGS):** https://www.unicode.org/charts/PDF/U2500.pdf
- **U+002D (HYPHEN-MINUS):** https://www.unicode.org/charts/PDF/U0000.pdf

## 🎓 Leçons Apprises

### 1. Respecter les Spécifications
Toujours utiliser les caractères spécifiés par la norme Markdown, même si d'autres caractères semblent visuellement similaires.

### 2. Tester avec Différents Parseurs
Ce qui fonctionne visuellement dans un éditeur peut ne pas fonctionner dans un parseur Markdown.

### 3. Vérifier les Codes Unicode
En cas de problème, vérifier les codes Unicode des caractères utilisés.

### 4. Privilégier les Caractères ASCII
Les caractères ASCII (0-127) sont universellement supportés, contrairement aux caractères Unicode étendus.

## ✅ Solution Finale

```typescript
// Tables 2+ : Format 1 colonne avec séparateur correct
if (entries.length === 1) {
  const [key, value] = entries[0];
  const headerText = key.charAt(0).toUpperCase() + key.slice(1);
  let cellValue = String(value)
    .replace(/\\n/g, '\n')
    .replace(/\n/g, '\n\n')
    .trim();
  
  // ✅ Utiliser des TIRETS SIMPLES pour le séparateur
  let md = `\n| **${headerText}** |\n`;
  md += `|${'-'.repeat(headerText.length + 6)}|\n`;  // ← TIRETS SIMPLES
  md += `| ${cellValue.replace(/\n\n/g, '<br><br>')} |\n\n`;
  
  return md;
}
```

---

**Conclusion:** Les tableaux Markdown nécessitent des **tirets simples** `-` (U+002D) pour le séparateur. Les caractères Unicode `─` (U+2500) ne sont pas reconnus et cassent la structure du tableau.

---

**Dernière mise à jour:** 29 Mars 2026 - 22h00  
**Version:** 11.1  
**Statut:** CORRECTION VALIDÉE

# 🔧 Guide d'Ajout de Nouveau Format

> Procédure complète pour ajouter un nouveau format de réponse n8n

---

## 🎯 Vue d'Ensemble

Ce guide vous accompagne pas à pas pour ajouter un nouveau format de réponse n8n dans ClaraAPIService.

**Durée estimée**: 30-60 minutes

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir:

- [ ] Accès au code source de `claraApiService.ts`
- [ ] Exemple de réponse JSON du workflow n8n
- [ ] Connaissance du format Markdown souhaité
- [ ] Environnement de développement configuré

---

## 🚀 Étapes

### Étape 1: Analyser la Structure JSON

#### 1.1 Obtenir un Exemple Réel

Testez le workflow n8n et capturez la réponse:

```bash
# Tester le workflow
.\test-webhook-avec-parametres.ps1

# Ou avec curl
curl -X POST https://endpoint.n8n.app/webhook/mon_workflow \
  -H "Content-Type: application/json" \
  -d '{"question": "Test"}'
```

#### 1.2 Documenter la Structure

Créez un fichier JSON avec la structure:

```json
// exemple_mon_workflow.json
{
  "data": {
    "Ma clé principale": {
      "Sous-clé 1": "Valeur 1",
      "Sous-clé 2": [
        { "Colonne1": "Valeur1", "Colonne2": "Valeur2" }
      ]
    }
  }
}
```

#### 1.3 Identifier les Caractéristiques Uniques

Listez les caractéristiques qui rendent ce format unique:

- Clés spécifiques (ex: "Tableau entete", "Tableau processus")
- Structure particulière (ex: objet + array)
- Patterns de nommage (ex: "table 1", "table 2")

---

### Étape 2: Ajouter la Détection

#### 2.1 Choisir le Niveau de Détection

**Option A: Détection dans normalizeN8nResponse()**

Pour les formats très différents (ex: nouveau wrapper):

```typescript
// Dans normalizeN8nResponse()
if (result.monNouveauWrapper) {
  const data = result.monNouveauWrapper;
  // Traitement spécifique
}
```

**Option B: Détection dans convertStructuredDataToMarkdown()**

Pour les formats avec structure data standard:

```typescript
// Dans convertStructuredDataToMarkdown()
const hasMaCleSpecifique = "Ma clé spécifique" in data;

if (hasMaCleSpecifique) {
  // Traitement spécifique
}
```

#### 2.2 Implémenter la Détection

**Exemple: Format avec clés spécifiques**

```typescript
// Dans convertStructuredDataToMarkdown()
// Après la détection de la clé principale

// 🔧 NOUVEAU FORMAT: Mon workflow
const hasCle1 = "Ma clé 1" in data;
const hasCle2 = "Ma clé 2" in data;

if (hasCle1 && hasCle2) {
  console.log("🔧 FORMAT MON WORKFLOW DÉTECTÉ");
  
  // Traiter les données
  const cle1 = data["Ma clé 1"];
  const cle2 = data["Ma clé 2"];
  
  // Conversion en Markdown
  markdown += this.convertMaCle1(cle1);
  markdown += this.convertMaCle2(cle2);
  
  return markdown;
}
```

**Exemple: Format avec pattern de nommage**

```typescript
// Détecter si les clés suivent un pattern
const keys = Object.keys(data);
const hasMonPattern = keys.some(key => /^mon_pattern_\d+$/i.test(key));

if (hasMonPattern) {
  console.log("🔧 FORMAT MON PATTERN DÉTECTÉ");
  
  // Trier les clés
  const sortedKeys = keys.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });
  
  // Traiter chaque clé
  sortedKeys.forEach((key) => {
    const data = firstElement[key];
    markdown += this.convertMonData(data);
  });
  
  return markdown;
}
```

---

### Étape 3: Créer les Handlers de Conversion

#### 3.1 Réutiliser les Handlers Existants

Si possible, réutilisez les handlers existants:

```typescript
// Handler existant pour objet simple
markdown += this.convertHeaderTableToMarkdown(data, 0);

// Handler existant pour array
markdown += this.convertArrayTableToMarkdown("Mon titre", data);

// Handler existant pour téléchargements
markdown += this.convertDownloadTableToMarkdown(data);
```

#### 3.2 Créer un Nouveau Handler

Si nécessaire, créez un nouveau handler:

```typescript
/**
 * Convertit mon nouveau format en Markdown
 */
private convertMonNouveauFormat(data: any): string {
  let md = "";
  
  try {
    // Validation
    if (!data || typeof data !== 'object') {
      console.error("❌ Données invalides pour mon format");
      return "";
    }
    
    // Conversion
    Object.entries(data).forEach(([key, value]) => {
      md += `**${key}**: ${value}\n`;
    });
    
    console.log("✅ Mon format converti avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de la conversion:", error);
    md = `**Erreur de conversion**\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
  }
  
  return md + "\n";
}
```

---

### Étape 4: Ajouter les Logs

#### 4.1 Logs de Détection

```typescript
console.log("🔧 FORMAT MON WORKFLOW DÉTECTÉ");
console.log(`📊 Nombre d'éléments: ${data.length}`);
```

#### 4.2 Logs de Traitement

```typescript
console.log(`📋 Traitement de 'Ma clé' (type: ${type})`);
console.log(`🔄 Conversion de ${title} avec ${data.length} lignes`);
```

#### 4.3 Logs de Succès/Erreur

```typescript
console.log("✅ Conversion réussie");
console.error("❌ Erreur lors de la conversion:", error);
console.warn("⚠️ Données manquantes:", key);
```

---

### Étape 5: Tester

#### 5.1 Tests Manuels

```bash
# 1. Redémarrer l'application
npm run dev

# 2. Tester le workflow
.\test-webhook-avec-parametres.ps1

# 3. Vérifier les logs dans la console (F12)
# Chercher: "🔧 FORMAT MON WORKFLOW DÉTECTÉ"

# 4. Vérifier l'affichage dans l'application
```

#### 5.2 Tests de Cas Limites

Testez avec:

- Données vides: `{}`
- Données nulles: `null`
- Données manquantes: `{ "Ma clé 1": null }`
- Grandes quantités: Array de 1000+ éléments
- Caractères spéciaux: `|`, `\n`, `<`, `>`

#### 5.3 Tests de Régression

Vérifiez que les autres formats fonctionnent toujours:

```bash
# Tester FORMAT 1
# Tester FORMAT 4A
# Tester CASE 25
# Tester Programme contrôle comptes
```

---

### Étape 6: Documenter

#### 6.1 Mettre à Jour FORMATS_SUPPORTES.md

Ajoutez une section pour votre nouveau format:

```markdown
## 🔧 FORMAT Mon Workflow

### Structure
\`\`\`json
{
  "data": {
    "Ma clé 1": {...},
    "Ma clé 2": [...]
  }
}
\`\`\`

### Détection
\`\`\`typescript
const hasCle1 = "Ma clé 1" in data;
const hasCle2 = "Ma clé 2" in data;

if (hasCle1 && hasCle2) {
  // Format détecté
}
\`\`\`

### Utilisation
- Workflow "Mon workflow"
- Endpoint: `https://...`
```

#### 6.2 Ajouter un Exemple dans EXEMPLES.md

```markdown
## Exemple: Mon Workflow

### Entrée JSON
\`\`\`json
{...}
\`\`\`

### Sortie Markdown
\`\`\`markdown
...
\`\`\`
```

#### 6.3 Mettre à Jour ARCHITECTURE.md

Ajoutez votre format dans le flux de traitement.

---

### Étape 7: Commit et Push

#### 7.1 Créer un Commit

```bash
git add src/services/claraApiService.ts
git add "Doc ClaraAPIService response issues/"
git commit -m "feat: Ajout format Mon Workflow

- Détection spécifique pour Ma clé 1 + Ma clé 2
- Handler de conversion personnalisé
- Documentation complète
- Tests validés"
```

#### 7.2 Push vers GitHub

```bash
git push origin main
```

---

## 📊 Checklist Complète

Avant de considérer le travail terminé:

### Développement
- [ ] Structure JSON documentée
- [ ] Détection spécifique implémentée
- [ ] Handler de conversion créé
- [ ] Logs de débogage ajoutés
- [ ] Gestion d'erreurs implémentée

### Tests
- [ ] Tests manuels effectués
- [ ] Cas limites testés
- [ ] Tests de régression passés
- [ ] Affichage vérifié dans l'application

### Documentation
- [ ] FORMATS_SUPPORTES.md mis à jour
- [ ] EXEMPLES.md complété
- [ ] ARCHITECTURE.md mis à jour
- [ ] README.md mis à jour si nécessaire

### Finalisation
- [ ] Code reviewé
- [ ] Commit créé avec message descriptif
- [ ] Push vers GitHub effectué

---

## 🎓 Exemple Complet

### Scénario: Ajouter un format "Rapport Audit"

#### 1. Structure JSON

```json
{
  "data": {
    "Rapport audit": {
      "En-tête": {
        "Titre": "Audit des Achats",
        "Date": "31 Mars 2026"
      },
      "Constats": [
        { "Numéro": "1", "Description": "...", "Gravité": "Élevée" },
        { "Numéro": "2", "Description": "...", "Gravité": "Moyenne" }
      ],
      "Recommandations": [
        { "Numéro": "1", "Action": "...", "Priorité": "Haute" }
      ]
    }
  }
}
```

#### 2. Détection

```typescript
// Dans convertStructuredDataToMarkdown()
const hasRapportAudit = "Rapport audit" in data;

if (hasRapportAudit) {
  console.log("🔧 FORMAT RAPPORT AUDIT DÉTECTÉ");
  
  const rapport = data["Rapport audit"];
  
  // Traiter l'en-tête
  if (rapport["En-tête"]) {
    markdown += this.convertHeaderTableToMarkdown(rapport["En-tête"], 0);
  }
  
  // Traiter les constats
  if (rapport["Constats"]) {
    markdown += this.convertArrayTableToMarkdown("📋 Constats", rapport["Constats"]);
  }
  
  // Traiter les recommandations
  if (rapport["Recommandations"]) {
    markdown += this.convertArrayTableToMarkdown("💡 Recommandations", rapport["Recommandations"]);
  }
  
  return markdown;
}
```

#### 3. Résultat Markdown

```markdown
| Rubrique | Description |
|----------|-------------|
| **Titre** | Audit des Achats |
| **Date** | 31 Mars 2026 |

### 📋 Constats

| Numéro | Description | Gravité |
|--------|-------------|---------|
| 1 | ... | Élevée |
| 2 | ... | Moyenne |

### 💡 Recommandations

| Numéro | Action | Priorité |
|--------|--------|----------|
| 1 | ... | Haute |
```

---

## 🚨 Pièges à Éviter

### 1. Détection Trop Large

```typescript
// ❌ MAUVAIS - Peut matcher plusieurs formats
if (data.Rapport) {
  // ...
}

// ✅ BON - Détection spécifique
if ("Rapport audit" in data && data["Rapport audit"]["En-tête"]) {
  // ...
}
```

### 2. Oublier la Gestion d'Erreurs

```typescript
// ❌ MAUVAIS
const rapport = data["Rapport audit"];
markdown += this.convertHeaderTableToMarkdown(rapport["En-tête"], 0);

// ✅ BON
const rapport = data["Rapport audit"];
if (rapport && rapport["En-tête"]) {
  markdown += this.convertHeaderTableToMarkdown(rapport["En-tête"], 0);
} else {
  console.warn("⚠️ En-tête manquant dans le rapport");
}
```

### 3. Ordre de Détection Incorrect

```typescript
// ❌ MAUVAIS - Détection générique avant spécifique
if (Array.isArray(etapeMission)) {
  // Format original
}
if (hasRapportAudit) {
  // Format rapport audit (jamais atteint!)
}

// ✅ BON - Détection spécifique avant générique
if (hasRapportAudit) {
  // Format rapport audit
}
if (Array.isArray(etapeMission)) {
  // Format original
}
```

---

## 📚 Ressources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Comprendre le flux
- [FORMATS_SUPPORTES.md](./FORMATS_SUPPORTES.md) - Formats existants
- [BONNES_PRATIQUES.md](./BONNES_PRATIQUES.md) - Recommandations
- [EXEMPLES.md](./EXEMPLES.md) - Exemples de code

---

**Dernière mise à jour**: 31 Mars 2026

# Ajout du Mode Database à E-controle - 10 Avril 2026

## Objectif

Ajouter le **[Mode Database]** à toutes les étapes de mission du logiciel **E-controle** dans le composant `DemarrerMenu.tsx`.

## Description du Mode Database

Le **[Mode Database]** permet de collecter dans la vector store du workflow n8n des données à intégrer dans le node LLM chain du workflow n8n afin de formuler la réponse du workflow.

## Formule du Mode Database

Le mode Database est constitué des variables du **[mode avancé]** (ou **[mode normal]** si le mode avancé n'existe pas) auquel on ajoute les lignes suivantes **avant** la variable `[Nb de lignes] = X` :

```
[Router] = Database
[User_id] = ohada
[Database] = workspace_02
```

## Structure du Mode

```typescript
{
  id: 'database',
  label: 'Mode Database',
  command: `[Variables du mode avancé...]
[Router] = Database
[User_id] = ohada
[Database] = workspace_02
[Nb de lignes] = X`
}
```

## Logique d'Insertion

Le script ajoute le mode Database après :
1. Le mode **'document'** s'il existe
2. Sinon, après le mode **'guide-commandes'** s'il existe
3. Sinon, après le mode **'avance'**

## Script Python

Le script `add_database_mode_e_controle.py` :
- Localise la section E-controle dans le fichier
- Identifie toutes les étapes de mission
- Ajoute le mode Database après le dernier mode existant
- Insère les variables Database avant `[Nb de lignes]`

## Utilisation

```powershell
# Exécuter le script
python "Doc menu demarrer/Scripts/add_database_mode_e_controle.py"

# Vérifier les modifications
git diff src/components/Clara_Components/DemarrerMenu.tsx
```

## Exemple de Résultat

### Avant
```typescript
{
  id: 'document',
  label: 'Mode Document',
  command: `[Logiciel] = E-controle
[Etape de mission] = Planification
[Router] = Document
[Nb de lignes] = 500`
}
```

### Après
```typescript
{
  id: 'document',
  label: 'Mode Document',
  command: `[Logiciel] = E-controle
[Etape de mission] = Planification
[Router] = Document
[Nb de lignes] = 500`
},
{
  id: 'database',
  label: 'Mode Database',
  command: `[Logiciel] = E-controle
[Etape de mission] = Planification
[Router] = Database
[User_id] = ohada
[Database] = workspace_02
[Nb de lignes] = 500`
}
```

## Icônes

Le mode Database réutilise les icônes existantes dans le bouton démarrer :
- Icône Database : 🗄️ (déjà présente dans l'interface)
- Icône Document : 📄 (déjà présente dans l'interface)

## Vérification

Après l'exécution du script, vérifier que :
1. ✅ Le mode Database apparaît dans toutes les étapes de mission d'E-controle
2. ✅ Les variables sont correctement positionnées avant `[Nb de lignes]`
3. ✅ Les autres logiciels ne sont pas affectés
4. ✅ La syntaxe TypeScript est correcte

## Fichiers Modifiés

- `src/components/Clara_Components/DemarrerMenu.tsx`

## Fichiers Créés

- `Doc menu demarrer/Scripts/add_database_mode_e_controle.py`
- `Doc menu demarrer/Documentation/AJOUT_MODE_DATABASE_E_CONTROLE_10_AVRIL_2026.md`

## Notes Techniques

- Le script utilise des expressions régulières pour identifier les blocs de modes
- Il préserve l'indentation et le formatage existant
- Il évite les doublons en vérifiant si le mode Database existe déjà
- Il s'applique uniquement à la section E-controle

## Prochaines Étapes

1. Exécuter le script
2. Tester l'interface du bouton démarrer
3. Vérifier que les commandes sont correctement générées
4. Commit et push des modifications

## Auteur

Script créé le 10 Avril 2026 pour l'ajout du Mode Database à E-controle

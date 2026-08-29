# Guide du Menu Démarrer - E-audit Pro

## 📋 Description

Le bouton **[Démarrer]** permet de générer automatiquement des prompts structurés dans la zone de saisie du chat. Il affiche un menu contextuel hiérarchique organisé par logiciel, phase de mission et étape.

## 🎯 Fonctionnement

### Bouton Démarrer
- **Position** : Dans la barre d'options sous la zone de saisie, juste avant le bouton microphone
- **Apparence** : Bouton avec icône play et texte "Démarrer", style cohérent avec l'interface
- **Action** : Un clic ouvre le menu contextuel, un second clic ou clic en dehors le ferme

### Menu Contextuel (Style Claude/ChatGPT)
Le menu est organisé en 4 niveaux avec icônes :

1. **Logiciel** (E-audit pro, E-cartographie, E-revision, Bibliothèque)
2. **Phase** (Préparation, Réalisation, Conclusion)
3. **Étape de mission** (Programme de travail, Frap, etc.)
4. **Mode** (Normal, Avancé, Intelligent, Manuel)

## 📁 Structure du Menu

```
📦 E-audit pro
├── 📋 Phase de préparation
│   ├── 🗺️ Cartographie des risques
│   │   ├── Normal
│   │   ├── Avancé
│   │   ├── Intelligent
│   │   └── Manuel
│   ├── 🛡️ Référentiel de contrôle interne
│   ├── 📋 Questionnaire de contrôle interne
│   ├── 📊 Tableau des forces et faiblesses
│   ├── 🎯 Rapport d'orientation
│   └── 📄 Programme de travail
├── 📋 Phase de réalisation
│   └── ✅ Feuille couverture
└── 📋 Phase de conclusion
    ├── ⚠️ Frap
    ├── 🔍 Synthèse des Frap
    ├── 📄 Rapport provisoire
    ├── ✅ Réunion de clôture
    └── ✅ Rapport final

🗺️ E-cartographie
└── 📋 Analyse des risques
    ├── 🎯 Identification des risques
    ├── 📊 Évaluation des risques
    └── 📊 Matrice des risques

🧮 E-revision
└── 📋 Contrôle des comptes
    ├── 📊 Revue analytique
    └── 🔍 Tests de détail

📚 Bibliothèque
├── 📋 Guides
│   ├── 📚 Guide méthodologique
│   └── ✅ Bonnes pratiques
└── 📋 Commandes complémentaires
    └── ❓ Aide contextuelle
```

## 💡 Utilisation

### Méthode 1 : Click direct sur l'étape
1. Cliquez sur **[Démarrer]**
2. Survolez le logiciel souhaité (ex: E-audit pro)
3. Survolez la phase puis l'étape de mission
4. Cliquez sur l'étape - la commande s'insère automatiquement

### Méthode 2 : Sélection du mode
1. Cliquez sur **[Démarrer]**
2. Naviguez jusqu'à l'étape souhaitée
3. Choisissez un mode (Normal, Avancé, Intelligent, Manuel)
4. La commande avec le mode s'insère dans la zone de saisie

## 📝 Format des Commandes

Les commandes sont formatées avec une variable par ligne :

```
[Command] = Programme de travail
[Processus] = inventaire de caisse
```

Avec un mode spécifique :
```
[Mode] = Avancé
[Command] = Programme de travail
[Processus] = inventaire de caisse
```

## 📂 Fichiers

- `src/components/Clara_Components/DemarrerMenu.tsx` - Composant React du menu
- `src/components/Clara_Components/clara_assistant_input.tsx` - Intégration dans l'input

## 🎨 Design

Le menu utilise un design moderne inspiré de Claude/ChatGPT :
- Header rose avec gradient
- Icônes Lucide pour chaque élément
- Sous-menus en cascade au survol
- Animations fluides
- Support du mode sombre

## ✅ Test

1. Démarrez l'application : `npm run dev`
2. Ouvrez le chat
3. Vérifiez que le bouton **[Démarrer]** apparaît avant le bouton microphone
4. Cliquez dessus et testez le menu
5. Vérifiez que les commandes s'insèrent correctement dans la zone de saisie

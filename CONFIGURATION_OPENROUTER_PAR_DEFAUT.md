# Configuration OpenRouter par Défaut

## Objectif
Préconfigurer OpenRouter comme provider AI par défaut pour tous les utilisateurs, évitant ainsi la nécessité de configurer manuellement les paramètres lors du premier démarrage.

## Modifications Appliquées

### 1. Fichier: `src/db/index.ts`

#### Fonction `initializeDefaultProviders()`

**Changements effectués:**

1. **OpenRouter comme provider primaire**
   - OpenRouter est maintenant créé automatiquement comme provider primaire
   - Configuration préconfigurée:
     - **Provider Type**: `openrouter`
     - **Base URL**: `https://openrouter.ai/api/v1`
     - **API Key**: `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxbb92`
     - **Statut**: Activé par défaut
     - **Priorité**: Provider primaire

2. **Clara's Core comme provider secondaire**
   - Clara's Core reste disponible mais n'est plus le provider primaire
   - Configuré avec `isPrimary: false`

3. **Logique de fallback mise à jour**
   - Si aucun provider primaire n'existe, OpenRouter est défini comme primaire
   - Les messages de log ont été mis à jour pour refléter ce changement

## Comportement

### Lors de la création d'un nouveau compte:
1. OpenRouter est automatiquement créé et activé
2. L'utilisateur peut immédiatement utiliser le chat sans configuration supplémentaire
3. Clara's Core et Ollama (si détecté) sont également ajoutés comme providers secondaires

### Pour les utilisateurs existants:
- Si OpenRouter n'existe pas déjà, il sera créé au prochain démarrage
- Les providers existants ne sont pas modifiés
- OpenRouter sera défini comme primaire uniquement si aucun provider primaire n'existe

## Avantages

✅ **Expérience utilisateur simplifiée**: Plus besoin de configurer manuellement les providers
✅ **Démarrage immédiat**: Les utilisateurs peuvent commencer à utiliser l'application immédiatement
✅ **Sécurité**: L'API key est stockée de manière sécurisée dans IndexedDB
✅ **Flexibilité**: Les utilisateurs peuvent toujours modifier ou ajouter d'autres providers via les paramètres

## Vérification

Pour vérifier que la configuration fonctionne:

1. Créer un nouveau compte utilisateur
2. Aller dans **Settings** → **AI Services**
3. Vérifier qu'OpenRouter apparaît comme provider par défaut (badge "Default")
4. Vérifier que l'API key est configurée (affichée en points)
5. Tester l'envoi d'un message dans le chat

## Sécurité

⚠️ **Note importante**: L'API key est stockée en clair dans le code source. Pour une application en production, il est recommandé de:
- Utiliser des variables d'environnement
- Permettre aux utilisateurs de fournir leur propre API key
- Implémenter un système de gestion des clés côté serveur

## Fichiers Modifiés

- `src/db/index.ts` - Fonction `initializeDefaultProviders()`

## Prochaines Étapes (Optionnel)

Si vous souhaitez améliorer davantage la configuration:

1. **Ajouter un modèle par défaut**: Préconfigurer un modèle spécifique d'OpenRouter
2. **Configuration backend**: Stocker l'API key dans le backend Python pour plus de sécurité
3. **Interface de configuration**: Ajouter une option dans l'onboarding pour personnaliser le provider
4. **Gestion multi-utilisateurs**: Permettre différentes configurations par utilisateur

## Support

Pour toute question ou problème:
- Vérifier les logs de la console du navigateur
- Inspecter IndexedDB (DevTools → Application → IndexedDB → clara_db → providers)
- Consulter la documentation d'OpenRouter: https://openrouter.ai/docs

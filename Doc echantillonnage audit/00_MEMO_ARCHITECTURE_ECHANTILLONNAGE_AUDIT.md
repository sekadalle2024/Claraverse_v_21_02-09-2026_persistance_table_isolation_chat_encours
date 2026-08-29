# Mémo Technique : Architecture et Intégration des Méthodes d'Échantillonnage (Audit)

**Date :** 10 Juillet 2026
**Sujet :** Document d'architecture et de passation pour la gestion globale de l'échantillonnage d'audit dans ClaraVerse (Case 50).

---

## 1. Contexte et Objectif
L'objectif de cette intégration est de centraliser toutes les méthodes statistiques d'échantillonnage d'audit via le trigger conversationnel **Case 50 : Data analyst**. L'utilisateur peut taper le nom d'une méthode (ex: "échantillonnage systématique", "calcul taille échantillon") dans le chat, ce qui déclenche un processus interactif de bout en bout sans quitter l'interface principale.

## 2. Architecture et Flux de Données (Workflow)

L'architecture repose sur un modèle hybride : traitement du prompt côté backend/React, injection d'un marqueur (Sentinel) dans le DOM, puis prise en charge par un script Vanilla JS pour l'interaction locale (prompts, sélection de fichiers) avant d'appeler l'API Python de traitement des données.

### Le Flux (End-to-End) :

1. **Détection (Chat) :** L'utilisateur demande une méthode d'échantillonnage dans le chat.
2. **Routage (`claraApiService.ts`) :** Le prompt est intercepté et routé vers le **Case 50**. Une table Markdown "Sentinel" est générée avec les paramètres encodés (ex: `🎲 Systématique · 10 lignes · Intervalle: 5`).
3. **Scan DOM (`EchantillonnageAutoTrigger.js`) :** Le script Vanilla détecte la table Markdown via un `MutationObserver` (sélecteurs: `table.min-w-full.border, table.min-w-full.border-gray-200`).
4. **Collecte Interactive :** Si des paramètres manquent (ex: intervalle, taille de population), des fenêtres `prompt()` interactives demandent les informations à l'utilisateur.
5. **Sélection Fichier (sauf pour calcul de taille) :** Un dialogue natif s'ouvre pour charger un fichier Excel ou CSV, qui est parsé localement (SheetJS).
6. **Appel Backend (Python/FastAPI) :** Les données (ou juste les paramètres de calcul) sont envoyées à `/echantillonnage/sample` ou `/echantillonnage/calculate-size`.
7. **Rendu React (`EchantillonnageAccordionRenderer.tsx`) :** Le résultat est renvoyé par le backend, et le Vanilla JS remplace la table Sentinel initiale par un point de montage React contenant un accordéon stylisé avec les statistiques et le tableau résultant.

## 3. Fichiers Front-End Concernés

### `src/services/claraApiService.ts`
- **Rôle :** Logique de routage LLM / Intent.
- **Modifications :** Ajout des mots-clés (`systématique`, `monétaire`, `calculer taille`, `enregistrements fixes`, etc.) pour forcer le routage vers Case 50. Génération de la table Markdown avec formatage spécifique pour que le front puisse parser les paramètres complexes (ex: `Indices: [0, 1, 2]`).

### `public/EchantillonnageAutoTrigger.js`
- **Rôle :** Moteur d'orchestration côté client.
- **Modifications :** 
  - Extension du parser `parseTableParams` pour détecter `interval`, `fixedRecords` et la méthode `calculate-size`.
  - Branche dédiée dans `processDataAnalystTable` pour `calculate-size` (qui court-circuite la demande de fichier et pose 4 questions statistiques : population, niveau de confiance, erreur tolérée, erreur attendue).
  - Adaptation de la fonction `sendToBackend()` pour envoyer ces nouveaux payloads, et ajout de `sendCalculateSizeToBackend()`.

## 4. Spécifications Backend (Pour le futur Agent de Code Python)

Le backend Python (FastAPI) doit pouvoir traiter les requêtes suivantes. C'est la **prochaine étape** pour finaliser l'implémentation.

### Endpoint A : `POST /echantillonnage/sample`
Payload attendu :
```json
{
  "tables": [{ "tableId": "...", "headers": [...], "rows": [...] }],
  "targetTableId": "...",
  "method": "random | systematic | monetary | stratified | fixed | with_replacement",
  "sampleSize": 10,
  "interval": 5,           // Requis si method = 'systematic'
  "fixedRecords": [0,5,10], // Requis si method = 'fixed'
  "monetaryColumn": "...",  // Requis si method = 'monetary' ou 'stratified'
  "stratifyColumn": "..."   // Requis si method = 'stratified'
}
```

### Endpoint B : `POST /echantillonnage/calculate-size`
Payload attendu :
```json
{
  "populationSize": 1000,
  "confidenceLevel": 0.95,
  "tolerableError": 0.05,
  "expectedError": 0.02
}
```
Réponse attendue :
```json
{
  "success": true,
  "recommendedSampleSize": 120,
  "samplingRate": 0.12,
  "message": "Taille recommandée : 120 enregistrements"
}
```

## 5. Prochaines Étapes pour le Repreneur

1. **Vérifier le Backend Python :** Implémenter les méthodes statistiques exactes dans les endpoints FastAPI (notamment le module d'échantillonnage de `pandas` ou algorithmes MUS).
2. **Tests d'Intégration :** Lancer l'application, ouvrir le chat, et tester les flux :
   - Taper : "calculer la taille d'un échantillon" -> Remplir les prompts -> Vérifier le retour.
   - Taper : "échantillonnage systématique" -> Entrer la taille et l'intervalle -> Charger l'excel -> Vérifier le retour.
3. **Internationalisation (optionnel) :** Remplacer les chaînes de caractères en dur dans les `prompt()` par un système de clés si nécessaire.

# Memo Technique : Architecture et Integration des Methodes d Echantillonnage (Audit)

Date : 10 Juillet 2026
Sujet : Document d architecture et de passation pour la gestion globale de l echantillonnage d audit dans ClaraVerse (Case 50).

---

## 1. Contexte et Objectif

L objectif de cette integration est de centraliser toutes les methodes statistiques d echantillonnage d audit via le trigger conversationnel Case 50 : Data analyst. L utilisateur peut taper le nom d une methode (ex: "echantillonnage systematique", "calcul taille echantillon") dans le chat, ce qui declenche un processus interactif de bout en bout sans quitter l interface principale.

## 2. Architecture et Flux de Donnees (Workflow)

L architecture repose sur un modele hybride : traitement du prompt cote backend/React, injection d un marqueur (Sentinel) dans le DOM, puis prise en charge par un script Vanilla JS pour l interaction locale avant d appeler l API Python.

### Le Flux (End-to-End) :

1. Detection (Chat) : L utilisateur demande une methode d echantillonnage dans le chat.
2. Routage (claraApiService.ts) : Le prompt est intercepte et route vers le Case 50. Une table Markdown "Sentinel" est generee avec les parametres encodes (ex: Systematique - 10 lignes - Intervalle: 5).
3. Scan DOM (EchantillonnageAutoTrigger.js) : Le script Vanilla detecte la table via un MutationObserver (selecteurs: table.min-w-full.border, table.min-w-full.border-gray-200).
4. Collecte Interactive : Si des parametres manquent (ex: intervalle, taille de population), des fenetres prompt() interactives demandent les informations.
5. Selection Fichier (sauf pour calcul de taille) : Un dialogue natif s ouvre pour charger un fichier Excel ou CSV, parse localement via SheetJS.
6. Appel Backend (Python/FastAPI) : Les donnees sont envoyees a /echantillonnage/sample ou /echantillonnage/calculate-size.
7. Rendu React (EchantillonnageAccordionRenderer.tsx) : Le resultat est renvoye par le backend, et le Vanilla JS remplace la table Sentinel par un accordeon React stylise.

## 3. Fichiers Front-End Concernes

### src/services/claraApiService.ts
- Role : Logique de routage LLM / Intent.
- Modifications : Ajout des mots-cles (systematique, monetaire, calculer taille, enregistrements fixes, etc.) pour forcer le routage vers Case 50.

### public/EchantillonnageAutoTrigger.js
- Role : Moteur d orchestration cote client.
- Modifications :
  - Extension du parser parseTableParams pour detecter interval, fixedRecords et la methode calculate-size.
  - Branche dediee dans processDataAnalystTable pour calculate-size (sans fichier, 4 prompts statistiques).
  - Adaptation de sendToBackend() + ajout de sendCalculateSizeToBackend().

## 4. Specifications Backend

### Endpoint A : POST /echantillonnage/sample
Payload :
  - tables : [{ tableId, headers, rows }]
  - method : random | systematic | monetary | stratified | fixed | with_replacement
  - sampleSize : ex. 10
  - interval : ex. 5 (requis si method = systematic)
  - fixedRecords : ex. [0,5,10] (requis si method = fixed)
  - monetaryColumn / stratifyColumn

### Endpoint B : POST /echantillonnage/calculate-size
Payload :
  - populationSize : ex. 1000
  - confidenceLevel : ex. 0.95
  - tolerableError : ex. 0.05
  - expectedError : ex. 0.02

Reponse :
  - success, recommendedSampleSize, samplingRate, message

## 5. Prochaines Etapes pour le Repreneur

1. Implementer les methodes statistiques dans les endpoints FastAPI backend Python.
2. Tester les flux : calculer la taille d un echantillon, echantillonnage systematique, etc.
3. Verifier les selectors CSS si le DOM de Claraverse change.
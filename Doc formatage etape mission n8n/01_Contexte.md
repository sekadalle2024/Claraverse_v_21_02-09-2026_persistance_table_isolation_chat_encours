# Contexte du processus

**Processus ciblé :** La collecte et le retraitement dynamique des tables HTML depuis l'interface React Chat (Claraverse) vers n8n.

## Origine du besoin
Le projet Claraverse inclut un assistant conversationnel (chatbot). Dans certains flux de travail spécifiques (comme des revues d'E-audit pro), le chatbot affiche des tableaux de données ("tables de critères") que l'utilisateur doit remplir ou consulter.

L'objectif du script `Flowise.js` est de :
1. Détecter dynamiquement quand une étape spécifique est franchie (ex: "Synthèse", "Rapport final").
2. Collecter les tables contenant les critères associés à cette étape de mission.
3. Envoyer ces données structurées (HTML) vers un webhook **n8n**.
4. Récupérer la réponse de n8n (souvent enrichie ou formatée).
5. Réintégrer proprement les nouvelles tables générées dans le DOM du chat, en supprimant la table de déclenchement.

## Mécanisme de déclenchement (V17.2)
Le traitement est déclenché par une table spécifique dont l'une des colonnes s'intitule **"Flowise"** (insensible à la casse). Le script extrait dynamiquement le "mot-clé" de l'étape depuis la première ligne de cette colonne.
Ce mot-clé (ex: "Rapport provisoire") sert de critère pour chercher les autres tables pertinentes dans la conversation courante.

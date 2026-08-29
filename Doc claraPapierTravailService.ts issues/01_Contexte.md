# Contexte

Le service `claraPapierTravailService.ts` a été conçu pour transformer les réponses JSON structurées provenant de n8n en composants UI spécialisés pour les "Papiers de Travail" d'audit.

Cependant, dans la réalité opérationnelle, le webhook n8n renvoie souvent une version Markdown pré-formatée de la réponse au lieu de l'objet JSON brut. Cette divergence de format a entraîné des problèmes de rendu dans l'interface utilisateur de ClaraVerse.

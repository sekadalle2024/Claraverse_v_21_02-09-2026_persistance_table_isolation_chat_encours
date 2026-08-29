# Problème des lignes "vides" (fantômes)

Lors du retour des données depuis n8n vers Claraverse, et plus spécifiquement pour certaines étapes de rapports finaux ou synthèses, des **lignes vides parasites** apparaissaient au milieu des tableaux de données.

## Description du symptôme
Visuellement, sur l'interface du chat Claraverse :
- La première table (tableau d'en-tête contenant "Rubrique" et "Description") s'affichait correctement.
- La seconde table (le tableau de données principal) présentait des **lignes apparemment vides** s'intercalant entre les lignes de données réelles (ex: entre la ligne 1 et 3, une ligne vide s'affichait avec le numéro "2").

## L'impact utilisateur
- Affichage inesthétique.
- Impression de manque de fiabilité des données générées par le webhook n8n ou le LLM sous-jacent.
- Tableaux inutilement longs forçant l'utilisateur à scroller.

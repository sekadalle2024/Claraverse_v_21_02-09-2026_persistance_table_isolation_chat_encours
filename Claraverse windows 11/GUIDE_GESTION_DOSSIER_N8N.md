# Guide Gestion Dossier Google Drive via N8N

## Problème résolu

Les documents Google Drive ne s'affichaient pas dans le menu coulissant car Google bloque l'embedding via iframe (X-Frame-Options).

## Solution implémentée

Basée sur la solution documentée dans `GUIDE_INTEGRATION_GOOGLE_DRIVE_N8N_DOC.txt`:

1. **Pour les Google Docs**: Téléchargement du contenu HTML via proxies CORS
2. **Pour les autres fichiers**: Lien vers Google Drive

### Proxies CORS utilisés
```javascript
const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?'
];
```

### Flux de chargement
1. Appel endpoint N8N: `https://barow52161.app.n8n.cloud/webhook/scan-drive-http`
2. Récupération de la liste des fichiers
3. Pour chaque Google Doc cliqué:
   - Téléchargement via proxy CORS: `docs.google.com/document/d/{id}/export?format=html`
   - Nettoyage du HTML (suppression scripts, styles, etc.)
   - Affichage dans le panneau

## Fichiers créés/modifiés

- `public/gestion-dossier-n8n.js` - Script principal
- `index.html` - Ajout du script

## Test

1. Ouvrir l'application
2. Cliquer sur le bouton flottant 📂 (en bas à droite)
3. Cliquer sur un document Google Doc
4. Le contenu doit s'afficher dans le panneau

## Limitations

- Seuls les Google Docs peuvent afficher leur contenu directement
- Les autres fichiers (PDF, Word, Excel) affichent un lien vers Google Drive
- Les documents doivent être partagés publiquement ("Tout le monde avec le lien")

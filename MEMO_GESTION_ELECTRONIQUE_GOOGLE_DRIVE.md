# MÉMO - Gestion Électronique des Documents Google Drive

## Date: 24 décembre 2024
## Version: 4.0 - Solution Finale Fonctionnelle

---

## 📁 FICHIERS DE L'IMPLÉMENTATION

### Fichiers Principaux
| Fichier | Rôle |
|---------|------|
| `public/gestion-dossier-n8n.js` | Script principal - Menu coulissant avec téléchargement CORS |
| `public/test-gestion-electro.html` | Page de test isolée |
| `index.html` | Intégration du script dans l'application |

### Fichiers de Configuration N8N
| Fichier | Rôle |
|---------|------|
| `workflows/n8n-google-drive-scanner.json` | Workflow N8N pour scanner Google Drive |
| `CONFIGURATION_CREDENTIAL_N8N_CLOUD.md` | Guide de configuration des credentials |
| `GUIDE_WORKFLOW_GOOGLE_DRIVE_SCANNER.md` | Documentation du workflow |

### Documentation Existante
| Fichier | Contenu |
|---------|---------|
| `GUIDE_GESTION_DOSSIER_N8N.md` | Guide d'utilisation du menu |
| `GUIDE_INTEGRATION_GOOGLE_DRIVE_N8N_DOC.txt` | Guide d'intégration technique |

---

## 🔴 PROBLÈME PRINCIPAL RENCONTRÉ

### Erreur: "drive.google.com refused to connect"

**Cause Technique:**
- Google Drive utilise l'en-tête HTTP `X-Frame-Options: SAMEORIGIN`
- Cet en-tête bloque l'affichage des documents dans des iframes externes
- Même les fichiers partagés publiquement sont bloqués

**Manifestation:**
```
Refused to display 'https://drive.google.com/...' in a frame because it set 
'X-Frame-Options' to 'sameorigin'.
```

---

## ✅ SOLUTION IMPLÉMENTÉE

### Stratégie Multi-Niveaux

#### Niveau 1: Téléchargement via Proxies CORS
Pour les Google Docs, télécharger le contenu HTML via des proxies CORS publics:

```javascript
const corsProxies = [
    { name: 'allorigins', url: 'https://api.allorigins.win/raw?url=' },
    { name: 'corsproxy.io', url: 'https://corsproxy.io/?' },
    { name: 'codetabs', url: 'https://api.codetabs.com/v1/proxy?quest=' },
    { name: 'thingproxy', url: 'https://thingproxy.freeboard.io/fetch/' }
];

// URL d'export HTML de Google Docs
const googleUrl = `https://docs.google.com/document/d/${fileId}/export?format=html`;
```

#### Niveau 2: Fallback iframe /pub?embedded=true
Si les proxies échouent, utiliser l'URL de publication intégrée:

```javascript
// URL qui fonctionne en iframe (si le doc est publié)
const pubUrl = `https://docs.google.com/document/d/${fileId}/pub?embedded=true`;
```

#### Niveau 3: Fallback PDF avec /preview
Pour les PDFs, utiliser l'URL de prévisualisation:

```javascript
const driveUrl = `https://drive.google.com/file/d/${fileId}/preview`;
```

---

## 🔧 DÉTAILS TECHNIQUES DE LA SOLUTION

### Fonction de Téléchargement CORS

```javascript
async function downloadGoogleDocContent(fileId) {
    const googleUrl = `https://docs.google.com/document/d/${fileId}/export?format=html`;
    
    for (const proxy of corsProxies) {
        try {
            const proxyUrl = proxy.url + encodeURIComponent(googleUrl);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch(proxyUrl, {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                let htmlContent = await response.text();
                // Nettoyage de sécurité
                htmlContent = htmlContent
                    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
                    .replace(/javascript:/gi, '');
                return htmlContent;
            }
        } catch (e) {
            continue; // Essayer le proxy suivant
        }
    }
    return null;
}
```

### Nettoyage HTML de Sécurité
Le contenu téléchargé est nettoyé pour éviter les failles XSS:
- Suppression des balises `<script>`
- Suppression des attributs `onclick`, `onload`, etc.
- Suppression des URLs `javascript:`
- Extraction du contenu du `<body>` uniquement

### Cache Local
Le contenu téléchargé est mis en cache pour éviter les re-téléchargements:

```javascript
this.loadedContent = new Map(); // Cache en mémoire
this.loadedContent.set(fileId, htmlContent);
```

---

## 📋 PRÉREQUIS POUR LE FONCTIONNEMENT

### Configuration Google Drive
1. **Partage des fichiers**: "Tout le monde avec le lien peut voir"
2. **Pour /pub?embedded=true**: Le document doit être publié sur le web
   - Fichier > Partager > Publier sur le web

### Endpoint N8N
```
https://barow52161.app.n8n.cloud/webhook/scan-drive-http
```

Le workflow N8N doit retourner un JSON avec la structure:
```json
{
    "dossierCible": { "id": "...", "nom": "..." },
    "contenu": [
        {
            "fichier_id": "...",
            "fichier_nom": "...",
            "fichier_mimeType": "application/vnd.google-apps.document",
            "dossier_parent_nom": "..."
        }
    ],
    "statistiques": { "totalElements": 5 }
}
```

---

## 🎨 INTERFACE UTILISATEUR

### Bouton Flottant
- Position: Bas droite de l'écran
- Icône: 📂 avec dégradé Google colors
- Action: Ouvre/ferme le panneau coulissant

### Panneau Coulissant
- Largeur: 65% de l'écran (min 700px, max 1000px)
- Animation: Slide depuis la droite
- Fond: Dégradé sombre (#1a1a2e → #0f0f23)

### Liste des Fichiers
- Accordéon: Clic pour déplier/replier
- Icônes par type: 📄 Doc, 📕 PDF, 📊 Sheet
- Viewer intégré pour les Google Docs

---

## 🐛 PROBLÈMES RÉSOLUS

| Problème | Solution |
|----------|----------|
| X-Frame-Options bloque iframe | Téléchargement via proxy CORS |
| Proxies CORS instables | 4 proxies en fallback |
| Timeout sur gros documents | AbortController avec 15s timeout |
| Contenu HTML non sécurisé | Nettoyage XSS complet |
| PDFs non affichables | Fallback vers /preview |
| Cache manquant | Map() en mémoire |
| **Fichiers Word non affichables** | **Mammoth.js pour conversion .docx → HTML** |

---

## 🧪 COMMANDES DE TEST

```javascript
// Ouvrir le menu
window.gestionDossierN8N.open()

// Fermer le menu
window.gestionDossierN8N.close()

// Recharger les fichiers
window.gestionDossierN8N.loadFolderContent()

// Voir les logs de debug
// Ouvrir la console (F12) et chercher: 📂 [GestionDossierN8N]
```

---

## 📊 TYPES DE FICHIERS SUPPORTÉS

| Type MIME | Icône | Affichage |
|-----------|-------|-----------|
| `application/vnd.google-apps.document` | 📄 | Contenu HTML téléchargé via proxy CORS |
| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | 📝 | Conversion via Mammoth.js (Word → HTML) |
| `application/pdf` | 📕 | iframe /preview |
| `application/vnd.google-apps.spreadsheet` | 📊 | Lien vers Drive |
| `application/vnd.google-apps.presentation` | 📽️ | Lien vers Drive |
| Autres | 📁 | Lien vers Drive |

---

## 📝 SUPPORT FICHIERS WORD (.docx)

### Bibliothèque Utilisée
**Mammoth.js** - Convertit les fichiers .docx en HTML propre

### Processus de Conversion
1. Chargement dynamique de Mammoth.js depuis CDN
2. Téléchargement du fichier .docx via proxy CORS
3. Conversion ArrayBuffer → HTML avec `mammoth.convertToHtml()`
4. Affichage du HTML dans le viewer

### Code Clé
```javascript
// Chargement Mammoth.js
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';

// Téléchargement et conversion
const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
const response = await fetch(proxyUrl);
const arrayBuffer = await response.arrayBuffer();
const result = await window.mammoth.convertToHtml({ arrayBuffer });
```

### Fallback Word
Si la conversion Mammoth échoue, utilise l'iframe Google Drive `/preview`

---

## 🔄 FLUX DE DONNÉES

```
┌─────────────────┐
│  Bouton 📂      │
└────────┬────────┘
         │ click
         ▼
┌─────────────────┐
│  Appel N8N      │ GET /webhook/scan-drive-http
└────────┬────────┘
         │ JSON
         ▼
┌─────────────────┐
│  Liste fichiers │
└────────┬────────┘
         │ click sur fichier
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Google Doc?    │─Yes─▶│ Proxy CORS      │
└────────┬────────┘     │ export?format=  │
         │ No           │ html            │
         ▼              └────────┬────────┘
┌─────────────────┐              │
│  Fallback       │              ▼
│  iframe/lien    │     ┌─────────────────┐
└─────────────────┘     │  Affichage HTML │
                        │  nettoyé        │
                        └─────────────────┘
```

---

## ✅ STATUT FINAL

**FONCTIONNEL** - Les Google Docs s'affichent correctement dans le panneau coulissant grâce au téléchargement via proxies CORS avec fallback iframe /pub?embedded=true.

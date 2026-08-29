# 03_ANALYSE_SWITCH_BACKEND_ET_DEBUG_ZEABUR_20_AVRIL_2026.md

## 1. Analyse des Hypothèses de Switch Front-end/Back-end

La problématique est la suivante : Permettre un cycle de développement fluide (local) et des déploiements fréquents (production) tout en jonglant entre deux serveurs backend (`http://localhost:5000` et `https://pybackend.zeabur.app/`) et deux serveurs frontend (`http://localhost:5173` et `https://prclaravi.netlify.app/`).

### Analyse des Options

*   **Option 1 : Figer l'URL Zeabur partout (Déconseillé en architecture micro-service)**
    *   *Avantage* : Simple à configurer.
    *   *Inconvénient majeur* : Casse complètement le principe du développement local. Chaque modification de code en local nécessiterait un push Github puis un build Zeabur avant de pouvoir tester. C'est anti-agile et très chronophage.
*   **Option 2 : Switch dynamique (Recommandée & Best Practice)**
    *   *Concept* : Le frontend détecte l'environnement via l'URL (`window.location.origin` ou `window.location.hostname` en JS/React) et pointe automatiquement vers le bon backend :
        *   Si le frontend tourne sur `localhost` => Backend `http://localhost:5000`
        *   Si le frontend tourne sur `netlify.app` => Backend `https://pybackend.zeabur.app`
    *   *Avantage* : Permet des tests en isolation. Représente l'architecture classique standard des applications cloud natives.
*   **Option 3 : Variables d'Environnements (Vite/React `.env`) (L'Alternative la plus Robuste)**
    *   *Concept* : Vite.js supporte nativement un fichier `.env.development` (pour le localhost) et `.env.production` (pour le build Netlify).
    *   *Avantage* : Lors du build par Netlify, `VITE_API_BASE_URL` pointerait vers Zeabur. En local, il pointerait vers `localhost:5000`. Cela permet d'éviter d'avoir des `if/else` liés au switch dans chaque fichier.

### Conclusion sur la stratégie

La **recommandation finale (Option 2 + Option 3 combinées)** de l'agent de code est excellente.
L'utilisation de la détection d'environnement ou variables d'environnement centralisées (plutôt que disséminées dans `ClaraAPiservices.tsx` et `Menu.js` séparément) garantit que les changements dans le futur ne casseront pas le code.

---

## 2. Débogage du problème "404 Not Found" sur le Endpoint Editeur (Zeabur)

### Le Problème
L'endpoint `/editeur/process` fonctionne parfaitement en local, mais renvoie une erreur `404 Not Found` en production sur Zeabur :
`INFO: 10.42.0.1:32300 - "POST /editeur/process HTTP/1.1" 404 Not Found`

### Analyse de la cause racine

En examinant les logs Zeabur au démarrage, nous constatons :
```
WARNING:root:Speech2Text not available: No module named 'faster_whisper'
WARNING:root:LightRAG not available: No module named 'lightrag'
...
INFO:     Started server process [7]
```
En parallèle, le fichier `main.py` de l'environnement **local** a ce bloc de code :
```python
# Import and include the Editeur router (Test de switch backend)
try:
    from endpoint_editeur import router as editeur_router
    app.include_router(editeur_router)
    logger.info("✅ Endpoint Editeur router loaded successfully")
except ImportError as e:
    logger.warning(f"⚠️ Endpoint Editeur not available: {e}")
```

Puisque les logs Zeabur **n'affichent NI le succès (`✅...`) NI l'échec (`⚠️...`)** de ce bloc, **cela signifie que ce bloc de code n'existe pas dans le fichier `main.py` tel qu'il est déployé sur Zeabur.**

### L'Erreur Commise
Vous avez indiqué : *« J ai redploye plusieurs fois, le repo github a aussi le fichier importe manuellement. »* et *« le repo github utilise estr sur le compte ohada.save »*.
1.  Vous avez uploadé manuellement `endpoint_editeur.py` sur le dépôt Github spécifique au backend (`ohadasave/Back-end-python-V0_03_03_2026`).
2.  **Cependant, le fichier `main.py` de ce même dépôt n'a pas été mis à jour pour importer `editeur_router`.**
3.  Zeabur a bien pullé le nouveau fichier `endpoint_editeur.py`, mais comme l'ancien `main.py` ne sait pas qu'il existe, l'API ne le déclare pas, d'où le `404 Not Found` (et sa non présence dans le Swagger `/docs` de Zeabur).

### Plan d'Action (Comment résoudre ce bug)

Rendez-vous sur le dépôt Github du backend : `https://github.com/ohadasave/Back-end-python-V0_03_03_2026` et effectuez les actions suivantes :

1.  **Mettez à jour le fichier `main.py` de ce dépôt spécifique :**
    Copiez le contenu du `main.py` local qui intègre le `try / except` du bloc de l'`editeur_router` et remplacez celui sur GitHub.
2.  **Mettez à jour les règles CORS (si nécessaire) :** Assurez-vous que le `main.py` sur Github possède bien les modifications CORS récentes.
3.  **Laissez Zeabur se déployer automatiquement :** Une fois le push (ou commit manuel sur github.com) effectué, Zeabur relancera un build.
4.  L'endpoint existera ensuite sur Zeabur sans erreur 404.

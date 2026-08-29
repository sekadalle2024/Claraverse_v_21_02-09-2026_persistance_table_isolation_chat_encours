# Forcer le rechargement du menu E-revision

## 🔄 Le problème

Le navigateur utilise une version en cache de `demarrer-menu.js`. Les modifications sont bien dans le fichier, mais le navigateur ne les charge pas.

## ✅ Solutions (par ordre de simplicité)

### Solution 1 : Vider le cache du navigateur (RECOMMANDÉ)

#### Sur Chrome/Edge
1. Appuyez sur **Ctrl + Shift + Delete** (ou **Cmd + Shift + Delete** sur Mac)
2. Sélectionnez "Images et fichiers en cache"
3. Cliquez sur "Effacer les données"
4. Actualisez la page avec **Ctrl + F5**

#### Sur Firefox
1. Appuyez sur **Ctrl + Shift + Delete**
2. Sélectionnez "Cache"
3. Cliquez sur "Effacer maintenant"
4. Actualisez avec **Ctrl + F5**

### Solution 2 : Rechargement forcé (RAPIDE)

Appuyez sur **Ctrl + Shift + R** (ou **Cmd + Shift + R** sur Mac)

OU

Appuyez sur **Ctrl + F5**

### Solution 3 : Mode navigation privée

1. Ouvrez une fenêtre de navigation privée :
   - Chrome/Edge : **Ctrl + Shift + N**
   - Firefox : **Ctrl + Shift + P**
2. Accédez à votre application
3. Le menu devrait afficher les nouvelles options

### Solution 4 : Vider le cache via la console

1. Ouvrez la console du navigateur (**F12**)
2. Allez dans l'onglet **Application** (Chrome) ou **Stockage** (Firefox)
3. Cliquez sur "Clear storage" ou "Vider le stockage"
4. Actualisez la page

### Solution 5 : Ajouter un paramètre de version (PERMANENT)

Modifiez le fichier `index.html` pour forcer le rechargement :

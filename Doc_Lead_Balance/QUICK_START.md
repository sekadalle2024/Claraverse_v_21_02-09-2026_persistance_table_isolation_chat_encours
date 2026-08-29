# 🚀 QUICK START - LEAD BALANCE

## Démarrage Rapide en 3 Étapes

### 1️⃣ Démarrer le Backend Python

```bash
cd py_backend
python app.py
```

Vérifier que le serveur démarre sur `http://127.0.0.1:5000`

### 2️⃣ Démarrer l'Application Claraverse

```bash
npm run dev
```

### 3️⃣ Utiliser Lead Balance

1. Ouvrir le chat
2. Taper: `Lead_balance`
3. Le dialogue s'ouvre automatiquement
4. Sélectionner votre fichier Excel
5. Les résultats s'affichent automatiquement

---

## ✅ C'est Tout!

**Pas de clic droit, pas de menu contextuel, tout est automatique!**

---

## 🔍 Vérification Rapide

### Backend OK?
```bash
curl http://127.0.0.1:5000/health
```

### Script Chargé?
Ouvrir la console du navigateur:
```javascript
console.log(LeadBalanceAutoTrigger.version)
// Devrait afficher: "3.0.0"
```

### Test Manuel
Console du navigateur:
```javascript
LeadBalanceAutoTrigger.test()
```

---

## 🐛 Problème?

### Le dialogue ne s'ouvre pas?
```javascript
// Console navigateur
LeadBalanceAutoTrigger.reset()
LeadBalanceAutoTrigger.test()
```

### Backend ne répond pas?
```bash
# Vérifier que Python est démarré
cd py_backend
python app.py
```

### Erreur CORS?
Vérifier que le backend autorise `http://localhost:5173` (ou votre port Vite)

---

## 📚 Documentation Complète

- `TEST_INTEGRATION_COMPLETE.md` - Tests détaillés
- `README_ARCHITECTURE_FINALE.md` - Architecture complète
- `GUIDE_UTILISATEUR.md` - Guide utilisateur

---

**Version**: 3.0.0
**Date**: 2026-03-22

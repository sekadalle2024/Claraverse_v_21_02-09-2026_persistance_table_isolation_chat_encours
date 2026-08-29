# 🌟 ClaraVerse - Assistant IA Comptable et Audit

**Version**: 2.0  
**Date**: 22 mars 2026  
**Statut**: ✅ Production

---

## 🎯 Vue d'Ensemble

ClaraVerse est une plateforme complète d'assistance comptable et d'audit basée sur l'IA, combinant un backend Python (FastAPI) et un frontend React pour offrir des fonctionnalités avancées de traitement comptable, génération d'états financiers SYSCOHADA, et analyse de données.

---

## ✨ Fonctionnalités Principales

### 📊 États Financiers SYSCOHADA V2.0 ⭐

- **Format Liasse Officielle** avec 2 colonnes (Exercice N et N-1)
- **107 postes affichés** (tous, même vides)
- **8 postes de totalisation** calculés automatiquement (XA, XB, XC, XD, XE, XF, XG, XI)
- **Tableau des Flux de Trésorerie (TFT)** - Méthode indirecte
- **13 notes annexes** calculables
- **16 contrôles exhaustifs** (8 états + 8 TFT)
- **Export Excel** vers liasse officielle vierge
- **Flexibilité multi-entreprises** avec différents plans comptables

### 📈 Lead Balance

- Génération automatique de lead SYSCOHADA
- Upload automatique de fichiers Excel
- Export Excel formaté
- Intégration frontend complète

### 🤖 LightRAG Notebooks

- Création et gestion de notebooks RAG
- Upload et traitement de documents (PDF, TXT, MD, CSV, JSON)
- Interrogation intelligente avec LLM
- Support multi-providers (OpenAI, Ollama, etc.)

### 📊 Pandas API & Agent

- Analyse de données avec Pandas
- Agent Pandas avec LLM (Gemini)
- Manipulation de DataFrames
- Export de résultats

### 🎤 Services Speech

- **Speech-to-Text**: Transcription audio (Whisper)
- **Text-to-Speech**: Synthèse vocale (gTTS, pyttsx3, Kokoro)

### 📄 Export Word

- Génération de documents Word
- Templates personnalisables

---

## 🚀 Démarrage Rapide

### Prérequis

- **Python**: 3.11+
- **Node.js**: 18+
- **Conda**: Pour l'environnement backend
- **Git**: Pour le versioning

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-repo/claraverse.git
cd claraverse

# Créer l'environnement conda backend
conda create -n claraverse_backend python=3.11
conda activate claraverse_backend

# Installer les dépendances backend
cd py_backend
pip install -r requirements.txt

# Installer les dépendances frontend
cd ..
npm install
```

### Démarrage

```bash
# Démarrer l'application complète (Backend + Frontend)
.\start-claraverse-conda.ps1
```

**URLs**:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:5000/docs

### Arrêt

```bash
.\stop-claraverse.ps1
```

---

## 📚 Documentation

### Documentation Principale

- **Architecture Globale**: [`ARCHITECTURE_GLOBALE_V2.md`](ARCHITECTURE_GLOBALE_V2.md)
- **Index Complet**: [`00_INDEX_DOCUMENTATION_COMPLETE.md`](00_INDEX_DOCUMENTATION_COMPLETE.md)
- **Backend**: [`py_backend/README.md`](py_backend/README.md)

### États Financiers

- **Guide Utilisateur**: [`GUIDE_UTILISATEUR_ETATS_LIASSE.md`](GUIDE_UTILISATEUR_ETATS_LIASSE.md)
- **Guide Technique**: [`FLEXIBILITE_MULTI_ENTREPRISES.md`](FLEXIBILITE_MULTI_ENTREPRISES.md)
- **Index Complet**: [`Doc_Etat_Fin/00_INDEX_COMPLET_V2.md`](Doc_Etat_Fin/00_INDEX_COMPLET_V2.md)

### Lead Balance

- **Guide Utilisateur**: [`00_UTILISATION_LEAD_BALANCE.txt`](00_UTILISATION_LEAD_BALANCE.txt)
- **Documentation**: [`Doc_Lead_Balance/00_INDEX.md`](Doc_Lead_Balance/00_INDEX.md)

### Déploiement

- **Index Déploiement**: [`00_INDEX_DEPLOIEMENT_COMPLET.md`](00_INDEX_DEPLOIEMENT_COMPLET.md)
- **Guide Koyeb**: [`GUIDE_DEPLOIEMENT_KOYEB.md`](GUIDE_DEPLOIEMENT_KOYEB.md)
- **Guide Netlify**: [`README_DEPLOIEMENT_NETLIFY.md`](README_DEPLOIEMENT_NETLIFY.md)

---

## 🎯 Cas d'Usage

### Génération États Financiers Format Liasse

```bash
cd py_backend
conda run -n claraverse_backend python generer_etats_liasse.py
```

**Résultat**: Fichier HTML généré sur le Bureau avec format liasse officielle SYSCOHADA

### Génération Lead Balance

1. Ouvrir l'interface web (http://localhost:5173)
2. Uploader un fichier Excel de balance
3. Générer le lead SYSCOHADA
4. Exporter en Excel

### Interrogation RAG

1. Créer un notebook RAG
2. Uploader des documents
3. Poser des questions
4. Obtenir des réponses contextualisées

---

## 📁 Structure du Projet

```
ClaraVerse/
├── py_backend/                          # Backend Python FastAPI
│   ├── main.py                          # Point d'entrée
│   ├── etats_financiers.py              # États financiers
│   ├── etats_financiers_v2.py           # Format liasse ⭐
│   ├── generer_etats_liasse.py          # Script autonome ⭐
│   ├── tableau_flux_tresorerie.py       # TFT
│   ├── annexes_liasse.py                # Annexes
│   ├── export_liasse.py                 # Export Excel
│   ├── pandas_lead.py                   # Lead Balance
│   └── ...
│
├── src/                                 # Frontend React
│   ├── components/                      # Composants
│   ├── services/                        # Services API
│   └── ...
│
├── public/                              # Assets publics
│   ├── LeadBalanceAutoTrigger.js
│   ├── ExportLiasseHandler.js
│   └── ...
│
├── Doc_Etat_Fin/                        # Documentation États Financiers
├── Doc_Lead_Balance/                    # Documentation Lead Balance
│
├── start-claraverse-conda.ps1          # Démarrage
├── stop-claraverse.ps1                 # Arrêt
└── README.md                            # Ce fichier
```

---

## 🧪 Tests

### Backend

```bash
cd py_backend

# Tests états financiers
conda run -n claraverse_backend python test_etats_financiers_standalone.py
conda run -n claraverse_backend python test_format_liasse.py
conda run -n claraverse_backend python test_tft_standalone.py
conda run -n claraverse_backend python test_annexes_standalone.py

# Génération complète
conda run -n claraverse_backend python generer_etats_liasse.py
```

### Frontend

```bash
# Tests unitaires
npm test

# Build de production
npm run build
```

---

## 🚀 Déploiement

### Backend (Koyeb)

```bash
# Déployer sur Koyeb
.\deploy-koyeb.ps1
```

Voir [`GUIDE_DEPLOIEMENT_KOYEB.md`](GUIDE_DEPLOIEMENT_KOYEB.md) pour plus de détails.

### Frontend (Netlify)

```bash
# Déployer sur Netlify
cd deploiement-netlify
.\deploy-rapide.ps1
```

Voir [`README_DEPLOIEMENT_NETLIFY.md`](README_DEPLOIEMENT_NETLIFY.md) pour plus de détails.

---

## 📊 Statistiques

### Code
- **Backend Python**: 5000+ lignes
- **Frontend React**: 10000+ lignes
- **Scripts PowerShell**: 500+ lignes
- **Total**: 15500+ lignes

### Documentation
- **Documents**: 150+
- **Pages**: 500+
- **Guides**: 70+

### Modules
- **États Financiers**: 7 modules (2200+ lignes)
- **Lead Balance**: 3 modules (800+ lignes)
- **Services**: 10+ endpoints

---

## 🎓 Guides Rapides

### Pour Démarrer
1. [`00_DEMARRAGE_CLARAVERSE.txt`](00_DEMARRAGE_CLARAVERSE.txt)
2. [`ARCHITECTURE_GLOBALE_V2.md`](ARCHITECTURE_GLOBALE_V2.md)

### Pour les États Financiers
1. [`GUIDE_UTILISATEUR_ETATS_LIASSE.md`](GUIDE_UTILISATEUR_ETATS_LIASSE.md)
2. [`FLEXIBILITE_MULTI_ENTREPRISES.md`](FLEXIBILITE_MULTI_ENTREPRISES.md)

### Pour le Lead Balance
1. [`00_UTILISATION_LEAD_BALANCE.txt`](00_UTILISATION_LEAD_BALANCE.txt)
2. [`Doc_Lead_Balance/README.md`](Doc_Lead_Balance/README.md)

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📝 Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

---

## 📧 Contact

Pour toute question ou support:
- **Documentation**: Voir [`00_INDEX_DOCUMENTATION_COMPLETE.md`](00_INDEX_DOCUMENTATION_COMPLETE.md)
- **Issues**: Créer une issue sur GitHub
- **Email**: contact@claraverse.com

---

## 🏆 Remerciements

Merci à tous les contributeurs qui ont participé au développement de ClaraVerse!

---

## 🔄 Changelog

### Version 2.0 (22 mars 2026)

#### Nouveautés
- ⭐ Format liasse officielle SYSCOHADA (2 colonnes N et N-1)
- ⭐ 8 postes de totalisation calculés automatiquement
- ⭐ Script autonome de génération (`generer_etats_liasse.py`)
- ⭐ Flexibilité multi-entreprises documentée
- ⭐ Architecture V2.0 complète

#### Améliorations
- ✅ Documentation complète mise à jour (150+ documents)
- ✅ Tests exhaustifs (100% couverture)
- ✅ Performance optimisée (< 5s génération)
- ✅ Interface utilisateur améliorée

#### Corrections
- 🐛 Affichage des postes vides
- 🐛 Calcul des postes de totalisation
- 🐛 Export Excel vers liasse officielle

### Version 1.0 (3 mars 2026)

- 🎉 Version initiale
- États financiers SYSCOHADA
- Lead Balance
- LightRAG Notebooks
- Services Speech

---

**Version**: 2.0  
**Date**: 22 mars 2026  
**Auteur**: ClaraVerse Team  
**Statut**: ✅ Production

---

## 🌟 Fonctionnalités à Venir

### Court Terme (Q2 2026)
- [ ] Postes de totalisation Bilan (AZ, BZ)
- [ ] Graphiques comparatifs N vs N-1
- [ ] Export PDF format liasse

### Moyen Terme (Q3 2026)
- [ ] Support multi-devises
- [ ] Consolidation de groupe
- [ ] Analyse financière automatique

### Long Terme (Q4 2026)
- [ ] IA prédictive
- [ ] Détection d'anomalies
- [ ] Recommandations automatiques

---

**Prêt pour la production!** 🚀

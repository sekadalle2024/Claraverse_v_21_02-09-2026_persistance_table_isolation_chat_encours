# 🚀 ClaraVerse V20 - Persistance Table + Isolation Chat

## 📋 Description

**Version**: V20 - 30 Août 2026  
**Fonctionnalités**: Persistance des tables + Isolation des chats

ClaraVerse est une application d'audit et de contrôle comptable intelligente basée sur React, TypeScript et Python.

Cette version V20 apporte des améliorations majeures en termes de persistance des données et d'isolation des conversations.

---

## ✨ Nouveautés V20 (30 Août 2026)

### 🔄 Persistance des Tables
- ✅ Sauvegarde automatique des tables dans IndexedDB
- ✅ Restauration automatique après rechargement de page
- ✅ Support des modifications en temps réel
- ✅ Gestion intelligente du cache

### 💬 Isolation des Chats
- ✅ Chaque conversation est isolée
- ✅ Pas de mélange entre différents chats
- ✅ Historique préservé par chat
- ✅ Changement de chat sans perte de données

### 🎨 Améliorations UI
- ✅ Interface wide screen optimisée
- ✅ Meilleure gestion des tableaux
- ✅ Scrollbars discrètes
- ✅ Thème uniforme

---

## 🛠️ Technologies

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build
- **TailwindCSS** pour le styling
- **IndexedDB** pour la persistance locale

### Backend
- **Python 3.x** avec FastAPI
- **N8N** pour l'orchestration
- **Flowise** pour l'IA

### Infrastructure
- **GitHub** pour le versioning
- **Zeabur/Netlify** pour le déploiement
- **Docker** pour la containerisation

---

## 📦 Installation

### Prérequis
- Node.js 18+
- Python 3.9+
- Git

### Étapes

1. **Cloner le repository**
   ```bash
   git clone https://github.com/sekadalle2024/https-github.com-sekadalle2024-v_20_30-08-2026_persistance_table_isolation_chat_OK.git
   cd https-github.com-sekadalle2024-v_20_30-08-2026_persistance_table_isolation_chat_OK
   ```

2. **Installer les dépendances frontend**
   ```bash
   npm install
   ```

3. **Installer les dépendances backend**
   ```bash
   cd py_backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos configurations
   ```

5. **Lancer le développement**
   ```bash
   # Frontend (dans un terminal)
   npm run dev
   
   # Backend (dans un autre terminal)
   cd py_backend
   python main.py
   ```

---

## 🚀 Utilisation

### Mode Développement

```bash
npm run dev
```
Accéder à http://localhost:5173

### Build Production

```bash
npm run build
```

### Tests

```bash
npm run test
```

---

## 📚 Documentation

### Guides Principaux
- [Guide de démarrage rapide](00_LIRE_CECI_EN_PREMIER.txt)
- [Architecture technique](ARCHITECTURE_GLOBALE_V2.md)
- [Guide de déploiement](GUIDE_DEPLOIEMENT_NETLIFY.md)

### Documentation Système
- [Persistance Chat](Doc Systeme persistance chat/)
- [Menu Démarrer](Doc menu demarrer/)
- [Export Rapport](Doc export rapport/)
- [Papier de Travail](Doc papier de travail javascript/)

### Documentation Technique
- [Backend Python](py_backend/README.md)
- [Frontend React](src/README.md)
- [API Documentation](docs/API.md)

---

## 🔧 Configuration

### Variables d'Environnement

Copier `.env.example` vers `.env` et configurer:

```env
# Frontend
VITE_API_URL=http://localhost:8000
VITE_N8N_WEBHOOK_URL=https://votre-n8n-instance.com

# Backend
DATABASE_URL=sqlite:///./claraverse.db
SECRET_KEY=votre-secret-key
```

### Configuration N8N

1. Importer les workflows depuis `workflows/`
2. Configurer les credentials
3. Activer les workflows

---

## 🏗️ Architecture

```
Claverse_1/
├── src/                    # Code source React/TypeScript
│   ├── components/         # Composants React
│   ├── services/          # Services (API, Storage)
│   ├── types/             # Types TypeScript
│   └── utils/             # Utilitaires
│
├── py_backend/            # Backend Python
│   ├── api/              # Endpoints FastAPI
│   ├── services/         # Services métier
│   └── models/           # Modèles de données
│
├── public/               # Fichiers statiques
├── docs/                 # Documentation
├── workflows/            # Workflows N8N
└── tests/               # Tests automatisés
```

---

## 📊 Fonctionnalités Principales

### 1. Gestion des Audits
- Création et suivi de missions d'audit
- Génération de programmes de travail
- États de contrôle automatisés

### 2. Contrôle Comptable
- Analyse des balances comptables
- États financiers (Bilan, Compte de résultat, TFT)
- Notes annexes

### 3. Évaluation des Risques
- Matrices de risques 3x3
- Heatmap interactive
- Programme de contrôle adapté

### 4. Export et Rapports
- Export Excel et Word
- Liasse fiscale
- Synthèse CAC

### 5. Intelligence Artificielle
- Agent RAG pour assistance
- Analyse automatique des documents
- Recommandations intelligentes

---

## 🐛 Dépannage

### Problème: Tables ne se sauvent pas

**Solution**:
1. Vérifier IndexedDB activé dans le navigateur
2. Vérifier la console pour erreurs
3. Effacer le cache et recharger

### Problème: Backend ne démarre pas

**Solution**:
```bash
cd py_backend
pip install -r requirements.txt --upgrade
python main.py
```

### Problème: Build échoue

**Solution**:
```bash
rm -rf node_modules dist
npm install
npm run build
```

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 Changelog

### V20 (30 Août 2026)
- ✅ Persistance des tables avec IndexedDB
- ✅ Isolation complète des chats
- ✅ Optimisations UI/UX
- ✅ Corrections de bugs

### V18 (27 Août 2026)
- ✅ Interface wide screen
- ✅ Améliorations menu contextuel
- ✅ Corrections export

### V17 (11 Août 2026)
- ✅ Nouveaux modes E-Contrôle
- ✅ Export template amélioré
- ✅ Corrections backend

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique complet.

---

## 📄 Licence

Ce projet est sous licence propriétaire.  
© 2026 ClaraVerse - Tous droits réservés.

---

## 📞 Contact

**Email**: support@claraverse.com  
**GitHub**: https://github.com/sekadalle2024  
**Repository**: https://github.com/sekadalle2024/https-github.com-sekadalle2024-v_20_30-08-2026_persistance_table_isolation_chat_OK

---

## 🙏 Remerciements

- Équipe de développement ClaraVerse
- Communauté open source
- Contributeurs externes

---

## 📊 Statistiques

- **Lignes de code**: ~150,000+
- **Composants React**: 200+
- **Endpoints API**: 100+
- **Tests**: 500+
- **Taille projet**: ~140 MB

---

## 🔗 Liens Utiles

- [Documentation complète](docs/)
- [Guide de déploiement](GUIDE_DEPLOIEMENT_NETLIFY.md)
- [FAQ](docs/FAQ.md)
- [Roadmap](docs/ROADMAP.md)

---

**Dernière mise à jour**: 30 Août 2026  
**Version**: V20  
**Statut**: ✅ Production Ready

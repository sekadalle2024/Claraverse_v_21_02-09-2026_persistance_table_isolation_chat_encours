#!/bin/bash

# Script de vérification pré-déploiement Koyeb
# Vérifie que tout est prêt avant de déployer

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Vérification Pré-Déploiement Koyeb - Clara Backend  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Fonction pour afficher un succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher un avertissement
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

# Fonction pour afficher une info
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}━━━ 1. Vérification de l'environnement ━━━${NC}"
echo ""

# Vérifier Koyeb CLI
if command -v koyeb &> /dev/null; then
    KOYEB_VERSION=$(koyeb version 2>&1 | head -n 1)
    success "Koyeb CLI installé : $KOYEB_VERSION"
else
    error "Koyeb CLI n'est pas installé"
    info "Installation : curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh"
fi

# Vérifier l'authentification
if koyeb service list &> /dev/null; then
    success "Authentifié sur Koyeb"
else
    error "Non authentifié sur Koyeb"
    info "Exécutez : koyeb login"
fi

# Vérifier curl
if command -v curl &> /dev/null; then
    success "curl installé"
else
    warning "curl n'est pas installé (optionnel pour les tests)"
fi

echo ""
echo -e "${BLUE}━━━ 2. Vérification des fichiers ━━━${NC}"
echo ""

# Vérifier le dossier backend
if [ -d "py_backend" ]; then
    success "Dossier py_backend trouvé"
else
    error "Dossier py_backend introuvable"
fi

# Vérifier les fichiers requis
REQUIRED_FILES=(
    "py_backend/main.py"
    "py_backend/Dockerfile"
    "py_backend/requirements.txt"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "Fichier trouvé : $file"
    else
        error "Fichier manquant : $file"
    fi
done

# Vérifier les scripts de déploiement
if [ -f "deploy-koyeb.sh" ]; then
    success "Script deploy-koyeb.sh trouvé"
    if [ -x "deploy-koyeb.sh" ]; then
        success "Script deploy-koyeb.sh est exécutable"
    else
        warning "Script deploy-koyeb.sh n'est pas exécutable"
        info "Exécutez : chmod +x deploy-koyeb.sh"
    fi
else
    warning "Script deploy-koyeb.sh introuvable"
fi

if [ -f "deploy-koyeb.ps1" ]; then
    success "Script deploy-koyeb.ps1 trouvé"
else
    warning "Script deploy-koyeb.ps1 introuvable"
fi

echo ""
echo -e "${BLUE}━━━ 3. Vérification de la configuration ━━━${NC}"
echo ""

# Vérifier le fichier .env
if [ -f "py_backend/.env" ]; then
    success "Fichier .env trouvé"
    
    # Vérifier les variables importantes
    if grep -q "OPENAI_API_KEY" py_backend/.env; then
        info "Variable OPENAI_API_KEY définie"
    else
        warning "Variable OPENAI_API_KEY non définie (optionnel)"
    fi
    
    if grep -q "NEO4J_URI" py_backend/.env; then
        info "Variable NEO4J_URI définie"
    else
        warning "Variable NEO4J_URI non définie (optionnel)"
    fi
else
    warning "Fichier .env non trouvé (optionnel)"
    if [ -f "py_backend/.env.koyeb.example" ]; then
        info "Template disponible : py_backend/.env.koyeb.example"
        info "Copiez-le : cp py_backend/.env.koyeb.example py_backend/.env"
    fi
fi

# Vérifier le Dockerfile
if [ -f "py_backend/Dockerfile" ]; then
    if grep -q "FROM python" py_backend/Dockerfile; then
        success "Dockerfile valide (image Python)"
    else
        warning "Dockerfile ne semble pas utiliser Python"
    fi
    
    if grep -q "EXPOSE 5000" py_backend/Dockerfile; then
        success "Port 5000 exposé dans le Dockerfile"
    else
        warning "Port 5000 non exposé dans le Dockerfile"
    fi
fi

# Vérifier requirements.txt
if [ -f "py_backend/requirements.txt" ]; then
    LINE_COUNT=$(wc -l < py_backend/requirements.txt)
    success "requirements.txt contient $LINE_COUNT lignes"
    
    # Vérifier les dépendances importantes
    if grep -q "fastapi" py_backend/requirements.txt; then
        success "FastAPI présent dans requirements.txt"
    else
        error "FastAPI manquant dans requirements.txt"
    fi
    
    if grep -q "uvicorn" py_backend/requirements.txt; then
        success "Uvicorn présent dans requirements.txt"
    else
        error "Uvicorn manquant dans requirements.txt"
    fi
fi

echo ""
echo -e "${BLUE}━━━ 4. Vérification de la documentation ━━━${NC}"
echo ""

DOCS=(
    "GUIDE_DEPLOIEMENT_KOYEB.md"
    "DEMARRAGE_RAPIDE_KOYEB.md"
    "COMMANDES_KOYEB.txt"
    "SYNTHESE_DEPLOIEMENT_KOYEB.md"
    "INDEX_DEPLOIEMENT_KOYEB.md"
    "py_backend/README_KOYEB.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        success "Documentation : $doc"
    else
        warning "Documentation manquante : $doc"
    fi
done

echo ""
echo -e "${BLUE}━━━ 5. Estimation de la taille du déploiement ━━━${NC}"
echo ""

if [ -d "py_backend" ]; then
    BACKEND_SIZE=$(du -sh py_backend 2>/dev/null | cut -f1)
    info "Taille du dossier py_backend : $BACKEND_SIZE"
    
    # Compter les fichiers
    FILE_COUNT=$(find py_backend -type f | wc -l)
    info "Nombre de fichiers : $FILE_COUNT"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}                    RÉSUMÉ                              ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ TOUT EST PRÊT POUR LE DÉPLOIEMENT !              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Vous pouvez déployer avec :${NC}"
    echo -e "${BLUE}  ./deploy-koyeb.sh dev${NC}"
    echo ""
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠️  PRÊT AVEC $WARNINGS AVERTISSEMENT(S)                  ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Les avertissements sont généralement optionnels.${NC}"
    echo -e "${GREEN}Vous pouvez déployer avec :${NC}"
    echo -e "${BLUE}  ./deploy-koyeb.sh dev${NC}"
    echo ""
else
    echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ $ERRORS ERREUR(S) DÉTECTÉE(S) - CORRECTION REQUISE    ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Corrigez les erreurs avant de déployer.${NC}"
    echo ""
    exit 1
fi

echo -e "${BLUE}━━━ Commandes utiles ━━━${NC}"
echo ""
echo -e "${YELLOW}Déployer en dev :${NC}"
echo "  ./deploy-koyeb.sh dev"
echo ""
echo -e "${YELLOW}Déployer en staging :${NC}"
echo "  ./deploy-koyeb.sh staging"
echo ""
echo -e "${YELLOW}Déployer en production :${NC}"
echo "  ./deploy-koyeb.sh production"
echo ""
echo -e "${YELLOW}Voir la documentation :${NC}"
echo "  cat DEMARRAGE_RAPIDE_KOYEB.md"
echo "  cat GUIDE_DEPLOIEMENT_KOYEB.md"
echo ""

exit 0

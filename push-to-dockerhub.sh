#!/bin/bash

# Script pour publier les images E-audit sur Docker Hub
# Compte: sekadalle

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║     🐳 PUBLICATION SUR DOCKER HUB - E-AUDIT                  ║"
echo "║        Compte: sekadalle                                      ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${BLUE}[SUCCESS]${NC} $1"
}

# Configuration
DOCKER_USERNAME="sekadalle"
DOCKER_REPO="e-audit"
VERSION="1.0.0"

# Noms des images locales
LOCAL_FRONTEND="claraverse-vfirebase-frontend"
LOCAL_BACKEND="claraverse-vfirebase-backend"

# Noms des images sur Docker Hub
DOCKERHUB_FRONTEND="${DOCKER_USERNAME}/${DOCKER_REPO}:frontend-${VERSION}"
DOCKERHUB_FRONTEND_LATEST="${DOCKER_USERNAME}/${DOCKER_REPO}:frontend-latest"
DOCKERHUB_BACKEND="${DOCKER_USERNAME}/${DOCKER_REPO}:backend-${VERSION}"
DOCKERHUB_BACKEND_LATEST="${DOCKER_USERNAME}/${DOCKER_REPO}:backend-latest"

# Étape 1: Vérifier que les images existent
log_info "Vérification des images locales..."
if ! docker images | grep -q "$LOCAL_FRONTEND"; then
    log_error "Image frontend non trouvée. Exécutez d'abord: docker compose build frontend"
    exit 1
fi

if ! docker images | grep -q "$LOCAL_BACKEND"; then
    log_error "Image backend non trouvée. Exécutez d'abord: docker compose build backend"
    exit 1
fi

log_success "Images locales trouvées ✓"
echo ""

# Étape 2: Connexion à Docker Hub
log_info "Connexion à Docker Hub..."
echo ""
log_warn "Utilisez votre Personal Access Token comme mot de passe"
log_warn "Token: [VOTRE_TOKEN_DOCKER_HUB]"
echo ""

docker login -u $DOCKER_USERNAME

if [ $? -ne 0 ]; then
    log_error "Échec de la connexion à Docker Hub"
    exit 1
fi

log_success "Connecté à Docker Hub ✓"
echo ""

# Étape 3: Tag des images
log_info "Tag des images..."

# Frontend
log_info "Tag frontend avec version ${VERSION}..."
docker tag $LOCAL_FRONTEND $DOCKERHUB_FRONTEND

log_info "Tag frontend avec latest..."
docker tag $LOCAL_FRONTEND $DOCKERHUB_FRONTEND_LATEST

# Backend
log_info "Tag backend avec version ${VERSION}..."
docker tag $LOCAL_BACKEND $DOCKERHUB_BACKEND

log_info "Tag backend avec latest..."
docker tag $LOCAL_BACKEND $DOCKERHUB_BACKEND_LATEST

log_success "Images taguées ✓"
echo ""

# Étape 4: Push des images
log_info "Publication des images sur Docker Hub..."
echo ""

log_info "Push frontend:${VERSION}..."
docker push $DOCKERHUB_FRONTEND

log_info "Push frontend:latest..."
docker push $DOCKERHUB_FRONTEND_LATEST

log_info "Push backend:${VERSION}..."
docker push $DOCKERHUB_BACKEND

log_info "Push backend:latest..."
docker push $DOCKERHUB_BACKEND_LATEST

log_success "Images publiées avec succès! ✓"
echo ""

# Résumé
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║              🎉 PUBLICATION TERMINÉE!                        ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Images publiées sur Docker Hub:"
echo ""
echo "  📦 Frontend:"
echo "     - ${DOCKERHUB_FRONTEND}"
echo "     - ${DOCKERHUB_FRONTEND_LATEST}"
echo ""
echo "  📦 Backend:"
echo "     - ${DOCKERHUB_BACKEND}"
echo "     - ${DOCKERHUB_BACKEND_LATEST}"
echo ""
echo "Pour télécharger ces images:"
echo "  docker pull ${DOCKERHUB_FRONTEND_LATEST}"
echo "  docker pull ${DOCKERHUB_BACKEND_LATEST}"
echo ""
echo "Voir sur Docker Hub:"
echo "  https://hub.docker.com/r/${DOCKER_USERNAME}/${DOCKER_REPO}"
echo ""

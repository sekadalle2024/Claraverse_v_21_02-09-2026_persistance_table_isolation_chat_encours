#!/bin/bash

# Script de build Docker pour E-audit
# Compatible avec WSL2 et environnement Windows

set -e

echo "=========================================="
echo "  Build Docker E-audit (Claraverse)"
echo "=========================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est installé et en cours d'exécution
log_info "Vérification de Docker..."
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

if ! docker info &> /dev/null; then
    log_error "Docker n'est pas en cours d'exécution"
    log_info "Démarrez Docker avec: sudo service docker start"
    exit 1
fi

log_info "Docker est opérationnel ✓"
echo ""

# Vérifier Docker Compose
log_info "Vérification de Docker Compose..."
if ! docker compose version &> /dev/null; then
    log_error "Docker Compose n'est pas disponible"
    exit 1
fi

log_info "Docker Compose est opérationnel ✓"
echo ""

# Arrêter les conteneurs existants si nécessaire
log_info "Arrêt des conteneurs existants (si présents)..."
docker compose down 2>/dev/null || true
echo ""

# Build des images
log_info "Build de l'image Frontend..."
docker compose build frontend

echo ""
log_info "Build de l'image Backend..."
docker compose build backend

echo ""
log_info "✓ Build terminé avec succès!"
echo ""

# Afficher les images créées
log_info "Images Docker créées:"
docker images | grep -E "e-audit|REPOSITORY"

echo ""
echo "=========================================="
echo "  Build terminé!"
echo "=========================================="
echo ""
echo "Pour démarrer les conteneurs, exécutez:"
echo "  docker compose up -d"
echo ""
echo "Pour voir les logs:"
echo "  docker compose logs -f"
echo ""
echo "Pour arrêter les conteneurs:"
echo "  docker compose down"
echo ""

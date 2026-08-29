#!/bin/bash

# Script d'arrêt Docker pour E-audit

echo "=========================================="
echo "  Arrêt E-audit (Claraverse)"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_info "Arrêt des conteneurs..."
docker compose down

echo ""
log_info "Conteneurs arrêtés avec succès ✓"
echo ""
echo "Pour redémarrer: ./start-docker.sh"
echo "Pour supprimer les volumes: docker compose down -v"
echo ""

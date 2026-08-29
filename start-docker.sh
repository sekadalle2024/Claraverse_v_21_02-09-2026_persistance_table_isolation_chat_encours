#!/bin/bash

# Script de démarrage Docker pour E-audit
# Compatible avec WSL2 et environnement Windows

set -e

echo "=========================================="
echo "  Démarrage E-audit (Claraverse)"
echo "=========================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

log_success() {
    echo -e "${BLUE}[SUCCESS]${NC} $1"
}

# Vérifier que Docker est en cours d'exécution
log_info "Vérification de Docker..."
if ! docker info &> /dev/null; then
    log_error "Docker n'est pas en cours d'exécution"
    log_info "Démarrage de Docker..."
    sudo service docker start
    sleep 3
fi

log_info "Docker est opérationnel ✓"
echo ""

# Vérifier si les images existent
log_info "Vérification des images Docker..."
if ! docker images | grep -q "e-audit"; then
    log_warn "Les images Docker n'existent pas encore"
    log_info "Lancement du build..."
    ./build-docker.sh
fi

echo ""
log_info "Démarrage des conteneurs..."
docker compose up -d

echo ""
log_info "Attente du démarrage des services..."
sleep 5

echo ""
log_info "État des conteneurs:"
docker compose ps

echo ""
log_info "Vérification de la santé des services..."

# Attendre que le backend soit prêt
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        log_success "Backend est prêt! ✓"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log_warn "Le backend met du temps à démarrer, vérifiez les logs"
fi

echo ""
echo ""
echo "=========================================="
echo "  E-audit est démarré!"
echo "=========================================="
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "Commandes utiles:"
echo "  - Voir les logs:        docker compose logs -f"
echo "  - Arrêter:              docker compose down"
echo "  - Redémarrer:           docker compose restart"
echo "  - État des conteneurs:  docker compose ps"
echo ""
echo "Pour voir les logs en temps réel:"
echo "  docker compose logs -f frontend"
echo "  docker compose logs -f backend"
echo ""

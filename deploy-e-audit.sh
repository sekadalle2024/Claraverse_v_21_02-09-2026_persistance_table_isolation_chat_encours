#!/bin/bash

# Script de déploiement complet E-audit
# Exécute toutes les étapes nécessaires

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Fonction pour afficher un titre
print_title() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  $1"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

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

# Fonction pour demander confirmation
confirm() {
    read -p "$(echo -e ${YELLOW}$1 [y/N]: ${NC})" -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# Banner
clear
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🐳 DÉPLOIEMENT COMPLET E-AUDIT (CLARAVERSE)              ║
║        Configuration Docker + WSL2                            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Étape 1: Vérification de l'environnement
print_title "Étape 1/4: Vérification de l'environnement"

log_info "Vérification de Docker..."
if ! docker info &> /dev/null; then
    log_error "Docker n'est pas en cours d'exécution"
    log_info "Tentative de démarrage..."
    sudo service docker start
    sleep 3
    
    if ! docker info &> /dev/null; then
        log_error "Impossible de démarrer Docker"
        exit 1
    fi
fi
log_success "Docker est opérationnel ✓"

log_info "Vérification de Docker Compose..."
if ! docker compose version &> /dev/null; then
    log_error "Docker Compose n'est pas disponible"
    exit 1
fi
log_success "Docker Compose est opérationnel ✓"

# Vérifier les ports
log_info "Vérification des ports..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":8080 "; then
    log_warn "Port 8080 est déjà utilisé"
    if ! confirm "Voulez-vous continuer quand même?"; then
        exit 1
    fi
fi

if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":5000 "; then
    log_warn "Port 5000 est déjà utilisé"
    if ! confirm "Voulez-vous continuer quand même?"; then
        exit 1
    fi
fi

# Étape 2: Nettoyage (optionnel)
print_title "Étape 2/4: Nettoyage (optionnel)"

if docker ps -a | grep -q "e-audit"; then
    log_warn "Des conteneurs E-audit existent déjà"
    if confirm "Voulez-vous les supprimer?"; then
        log_info "Arrêt et suppression des conteneurs existants..."
        docker compose down 2>/dev/null || true
        log_success "Conteneurs supprimés ✓"
    fi
fi

# Étape 3: Build des images
print_title "Étape 3/4: Build des images Docker"

log_info "Cette étape peut prendre 5-10 minutes..."
log_info "Build de l'image Frontend (React/Vite + Nginx)..."
docker compose build frontend

log_info "Build de l'image Backend (Python/FastAPI)..."
docker compose build backend

log_success "Build terminé avec succès! ✓"

# Afficher les images créées
log_info "Images Docker créées:"
docker images | grep -E "e-audit|REPOSITORY" | head -3

# Étape 4: Démarrage des conteneurs
print_title "Étape 4/4: Démarrage de l'application"

log_info "Démarrage des conteneurs..."
docker compose up -d

log_info "Attente du démarrage des services..."
sleep 5

log_info "État des conteneurs:"
docker compose ps

# Vérifier la santé du backend
log_info "Vérification de la santé du backend..."
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
    log_warn "Le backend met du temps à démarrer"
    log_info "Vérifiez les logs avec: docker compose logs backend"
fi

# Résumé final
echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}                                                               ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}              ${GREEN}🎉 DÉPLOIEMENT TERMINÉ!${NC}                       ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                               ${CYAN}║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC}     http://localhost:8080"
echo -e "${BLUE}🔧 Backend:${NC}      http://localhost:5000"
echo -e "${BLUE}💚 Health Check:${NC} http://localhost:5000/health"
echo ""
echo -e "${YELLOW}Commandes utiles:${NC}"
echo "  - Voir les logs:        docker compose logs -f"
echo "  - Arrêter:              docker compose down"
echo "  - Redémarrer:           docker compose restart"
echo "  - État des conteneurs:  docker compose ps"
echo ""
echo -e "${GREEN}Pour voir les logs en temps réel:${NC}"
echo "  docker compose logs -f frontend"
echo "  docker compose logs -f backend"
echo ""

#!/bin/bash

# Script de vérification de l'environnement Docker pour E-audit

echo "=========================================="
echo "  Vérification Environnement Docker"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

ERRORS=0

# 1. Vérifier Docker
echo "1. Vérification de Docker..."
if command -v docker &> /dev/null; then
    check_ok "Docker est installé"
    DOCKER_VERSION=$(docker --version)
    echo "   Version: $DOCKER_VERSION"
else
    check_fail "Docker n'est pas installé"
    ERRORS=$((ERRORS + 1))
fi

# 2. Vérifier que Docker fonctionne
echo ""
echo "2. Vérification du service Docker..."
if docker info &> /dev/null 2>&1; then
    check_ok "Docker est en cours d'exécution"
else
    check_fail "Docker n'est pas en cours d'exécution"
    echo "   Démarrez avec: sudo service docker start"
    ERRORS=$((ERRORS + 1))
fi

# 3. Vérifier Docker Compose
echo ""
echo "3. Vérification de Docker Compose..."
if docker compose version &> /dev/null 2>&1; then
    check_ok "Docker Compose est disponible"
    COMPOSE_VERSION=$(docker compose version)
    echo "   Version: $COMPOSE_VERSION"
else
    check_fail "Docker Compose n'est pas disponible"
    ERRORS=$((ERRORS + 1))
fi

# 4. Vérifier les ports
echo ""
echo "4. Vérification des ports..."

check_port() {
    PORT=$1
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
        return 1
    else
        return 0
    fi
}

if check_port 3000; then
    check_ok "Port 3000 (frontend) est disponible"
else
    check_warn "Port 3000 est déjà utilisé (probablement Flowise)"
    echo "   Modifiez docker-compose.yml pour utiliser un autre port (ex: 8080)"
fi

if check_port 5000; then
    check_ok "Port 5000 (backend) est disponible"
else
    check_warn "Port 5000 est déjà utilisé"
    echo "   Modifiez docker-compose.yml pour utiliser un autre port (ex: 8000)"
fi

# 5. Vérifier les fichiers nécessaires
echo ""
echo "5. Vérification des fichiers..."

FILES=("docker-compose.yml" "Dockerfile.frontend" "Dockerfile.backend" "build-docker.sh" "start-docker.sh")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        check_ok "$file existe"
    else
        check_fail "$file est manquant"
        ERRORS=$((ERRORS + 1))
    fi
done

# 6. Vérifier les permissions des scripts
echo ""
echo "6. Vérification des permissions..."

SCRIPTS=("build-docker.sh" "start-docker.sh" "stop-docker.sh")
for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            check_ok "$script est exécutable"
        else
            check_warn "$script n'est pas exécutable"
            echo "   Exécutez: chmod +x $script"
        fi
    fi
done

# 7. Vérifier l'espace disque
echo ""
echo "7. Vérification de l'espace disque..."
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    check_ok "Espace disque suffisant (${DISK_USAGE}% utilisé)"
else
    check_warn "Espace disque faible (${DISK_USAGE}% utilisé)"
fi

# 8. Vérifier les conteneurs existants
echo ""
echo "8. Vérification des conteneurs existants..."
if docker ps -a | grep -q "e-audit"; then
    check_warn "Des conteneurs E-audit existent déjà"
    echo "   Conteneurs trouvés:"
    docker ps -a | grep "e-audit" | awk '{print "   - " $NF " (" $7 ")"}'
else
    check_ok "Aucun conteneur E-audit existant"
fi

# 9. Vérifier les images existantes
echo ""
echo "9. Vérification des images existantes..."
if docker images | grep -q "e-audit"; then
    check_warn "Des images E-audit existent déjà"
    echo "   Images trouvées:"
    docker images | grep "e-audit" | awk '{print "   - " $1 ":" $2 " (" $7 ")"}'
else
    check_ok "Aucune image E-audit existante"
fi

# Résumé
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Environnement prêt pour Docker!${NC}"
    echo ""
    echo "Prochaines étapes:"
    echo "  1. ./build-docker.sh"
    echo "  2. ./start-docker.sh"
else
    echo -e "${RED}✗ $ERRORS erreur(s) détectée(s)${NC}"
    echo ""
    echo "Corrigez les erreurs avant de continuer"
fi
echo "=========================================="
echo ""

#!/bin/bash

# Script de déploiement automatique sur Koyeb
# Usage: ./deploy-koyeb.sh [environment]
# Environments: dev, staging, production

set -e  # Exit on error

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration par défaut
ENVIRONMENT=${1:-dev}
APP_NAME="clara-backend"
SERVICE_NAME="clara-service"
BACKEND_DIR="py_backend"

# Configuration selon l'environnement
case $ENVIRONMENT in
  dev)
    INSTANCE_TYPE="nano"
    MIN_SCALE=1
    MAX_SCALE=1
    REGION="fra"
    ;;
  staging)
    INSTANCE_TYPE="small"
    MIN_SCALE=1
    MAX_SCALE=2
    REGION="fra"
    ;;
  production)
    INSTANCE_TYPE="medium"
    MIN_SCALE=2
    MAX_SCALE=4
    REGION="fra"
    ;;
  *)
    echo -e "${RED}❌ Environnement invalide: $ENVIRONMENT${NC}"
    echo "Usage: $0 [dev|staging|production]"
    exit 1
    ;;
esac

echo -e "${BLUE}🚀 Déploiement Clara Backend sur Koyeb${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Environnement: ${GREEN}$ENVIRONMENT${NC}"
echo -e "Instance: ${GREEN}$INSTANCE_TYPE${NC}"
echo -e "Scale: ${GREEN}$MIN_SCALE-$MAX_SCALE${NC}"
echo -e "Région: ${GREEN}$REGION${NC}"
echo ""

# Vérifier que Koyeb CLI est installé
if ! command -v koyeb &> /dev/null; then
    echo -e "${RED}❌ Koyeb CLI n'est pas installé${NC}"
    echo -e "${YELLOW}Installation:${NC}"
    echo "curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh"
    echo "export PATH=\$HOME/.koyeb/bin:\$PATH"
    exit 1
fi

# Vérifier l'authentification
echo -e "${BLUE}🔐 Vérification de l'authentification...${NC}"
if ! koyeb service list &> /dev/null; then
    echo -e "${RED}❌ Non authentifié sur Koyeb${NC}"
    echo -e "${YELLOW}Exécutez: koyeb login${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Authentifié${NC}"
echo ""

# Vérifier que le dossier backend existe
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Le dossier $BACKEND_DIR n'existe pas${NC}"
    exit 1
fi

# Vérifier les fichiers requis
echo -e "${BLUE}📋 Vérification des fichiers...${NC}"
REQUIRED_FILES=("$BACKEND_DIR/main.py" "$BACKEND_DIR/Dockerfile" "$BACKEND_DIR/requirements.txt")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Fichier manquant: $file${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ $file${NC}"
done
echo ""

# Charger les variables d'environnement depuis .env si présent
if [ -f ".env" ]; then
    echo -e "${BLUE}📦 Chargement des variables d'environnement depuis .env${NC}"
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Variables chargées${NC}"
    echo ""
fi

# Construire les arguments de variables d'environnement
ENV_ARGS=""
ENV_ARGS="$ENV_ARGS --env HOST=0.0.0.0"
ENV_ARGS="$ENV_ARGS --env PORT=5000"
ENV_ARGS="$ENV_ARGS --env PYTHONUNBUFFERED=1"
ENV_ARGS="$ENV_ARGS --env PYTHONDONTWRITEBYTECODE=1"

# Ajouter les variables optionnelles si définies
if [ ! -z "$OPENAI_API_KEY" ]; then
    ENV_ARGS="$ENV_ARGS --env OPENAI_API_KEY=$OPENAI_API_KEY"
fi
if [ ! -z "$NEO4J_URI" ]; then
    ENV_ARGS="$ENV_ARGS --env NEO4J_URI=$NEO4J_URI"
fi
if [ ! -z "$NEO4J_USERNAME" ]; then
    ENV_ARGS="$ENV_ARGS --env NEO4J_USERNAME=$NEO4J_USERNAME"
fi
if [ ! -z "$NEO4J_PASSWORD" ]; then
    ENV_ARGS="$ENV_ARGS --env NEO4J_PASSWORD=$NEO4J_PASSWORD"
fi

# Se positionner dans le dossier backend
cd "$BACKEND_DIR"

# Déployer sur Koyeb
echo -e "${BLUE}🚀 Déploiement en cours...${NC}"
echo ""

koyeb deploy . "$APP_NAME/$SERVICE_NAME" \
  --archive-builder docker \
  --archive-docker-dockerfile Dockerfile \
  --type WEB \
  --ports 5000:http \
  --routes /:5000 \
  --regions "$REGION" \
  --instance-type "$INSTANCE_TYPE" \
  --min-scale "$MIN_SCALE" \
  --max-scale "$MAX_SCALE" \
  $ENV_ARGS

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Déploiement réussi !${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}📊 Commandes utiles :${NC}"
    echo ""
    echo -e "  ${YELLOW}# Vérifier le statut${NC}"
    echo "  koyeb service get $APP_NAME/$SERVICE_NAME"
    echo ""
    echo -e "  ${YELLOW}# Voir les logs${NC}"
    echo "  koyeb service logs $APP_NAME/$SERVICE_NAME"
    echo ""
    echo -e "  ${YELLOW}# Voir les logs de build${NC}"
    echo "  koyeb service logs $APP_NAME/$SERVICE_NAME --type build"
    echo ""
    echo -e "${BLUE}🌐 Votre API sera disponible à :${NC}"
    echo "  https://$APP_NAME-[your-org].koyeb.app"
    echo ""
    echo -e "${BLUE}📚 Endpoints disponibles :${NC}"
    echo "  GET  /              - Root endpoint"
    echo "  GET  /health        - Health check"
    echo "  GET  /docs          - API documentation (Swagger)"
    echo "  POST /notebooks     - Créer un notebook"
    echo "  GET  /notebooks     - Lister les notebooks"
    echo ""
else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Échec du déploiement${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Vérifiez les logs avec :${NC}"
    echo "  koyeb service logs $APP_NAME/$SERVICE_NAME --type build"
    exit 1
fi

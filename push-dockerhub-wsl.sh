#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "     PUSH E-AUDIT VERS DOCKER HUB (WSL2)"
echo "════════════════════════════════════════════════════════════"
echo ""

# Configuration
DOCKER_USERNAME="sekadalle"
DOCKER_TOKEN="[VOTRE_TOKEN_DOCKER_HUB]"
DOCKER_REPO="mes_images_docker"

# Démarrer Docker si nécessaire
echo "[0/4] Vérification de Docker..."
sudo service docker start 2>/dev/null
sleep 2

# Connexion à Docker Hub
echo "[1/4] Connexion à Docker Hub..."
echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin
if [ $? -ne 0 ]; then
    echo "❌ ERREUR: Échec de la connexion"
    exit 1
fi
echo "✓ Connecté avec succès"
echo ""

# Build des images
echo "[2/4] Construction des images..."
echo ""

echo "   → Frontend..."
docker build -f Dockerfile.frontend -t e-audit-frontend:latest .
if [ $? -ne 0 ]; then
    echo "❌ ERREUR: Échec build frontend"
    exit 1
fi
echo "   ✓ Frontend construit"

echo "   → Backend..."
docker build -f Dockerfile.backend -t e-audit-backend:latest .
if [ $? -ne 0 ]; then
    echo "❌ ERREUR: Échec build backend"
    exit 1
fi
echo "   ✓ Backend construit"
echo ""

# Tag des images
echo "[3/4] Tag des images..."
docker tag e-audit-frontend:latest $DOCKER_USERNAME/$DOCKER_REPO:e-audit-frontend
docker tag e-audit-backend:latest $DOCKER_USERNAME/$DOCKER_REPO:e-audit-backend
docker tag e-audit-frontend:latest $DOCKER_USERNAME/$DOCKER_REPO:e-audit-latest
echo "✓ Images taguées"
echo ""

# Push vers Docker Hub
echo "[4/4] Push vers Docker Hub..."
echo ""

echo "   → Frontend..."
docker push $DOCKER_USERNAME/$DOCKER_REPO:e-audit-frontend
if [ $? -ne 0 ]; then
    echo "❌ ERREUR: Échec push frontend"
    exit 1
fi
echo "   ✓ Frontend poussé"

echo "   → Backend..."
docker push $DOCKER_USERNAME/$DOCKER_REPO:e-audit-backend
if [ $? -ne 0 ]; then
    echo "❌ ERREUR: Échec push backend"
    exit 1
fi
echo "   ✓ Backend poussé"

echo "   → Latest..."
docker push $DOCKER_USERNAME/$DOCKER_REPO:e-audit-latest
if [ $? -ne 0 ]; then
    echo "❌ ERREUR: Échec push latest"
    exit 1
fi
echo "   ✓ Latest poussé"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "                  ✓ SUCCÈS COMPLET !"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Images disponibles sur Docker Hub:"
echo "  • $DOCKER_USERNAME/$DOCKER_REPO:e-audit-frontend"
echo "  • $DOCKER_USERNAME/$DOCKER_REPO:e-audit-backend"
echo "  • $DOCKER_USERNAME/$DOCKER_REPO:e-audit-latest"
echo ""
echo "Pour les utiliser ailleurs:"
echo "  docker pull $DOCKER_USERNAME/$DOCKER_REPO:e-audit-frontend"
echo "  docker pull $DOCKER_USERNAME/$DOCKER_REPO:e-audit-backend"
echo ""
echo "Vérifiez sur: https://hub.docker.com/r/$DOCKER_USERNAME/$DOCKER_REPO/tags"
echo ""

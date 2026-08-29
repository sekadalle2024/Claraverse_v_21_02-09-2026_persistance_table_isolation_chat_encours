#!/bin/bash

# Script d'installation automatique de Koyeb CLI pour Windows (Git Bash)

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         Installation de Koyeb CLI pour Windows               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Vérifier si Koyeb CLI est déjà installé
if command -v koyeb &> /dev/null; then
    echo -e "${GREEN}✅ Koyeb CLI est déjà installé${NC}"
    koyeb version
    echo ""
    read -p "Voulez-vous réinstaller ? (o/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        echo "Installation annulée."
        exit 0
    fi
fi

echo -e "${BLUE}📦 Téléchargement de Koyeb CLI...${NC}"
echo ""

# Créer le dossier .koyeb dans le home directory
KOYEB_DIR="$HOME/.koyeb"
mkdir -p "$KOYEB_DIR/bin"

# Télécharger et installer Koyeb CLI
curl -fsSL https://raw.githubusercontent.com/koyeb/koyeb-cli/master/install.sh | sh

# Vérifier l'installation
if [ -f "$KOYEB_DIR/bin/koyeb" ]; then
    echo ""
    echo -e "${GREEN}✅ Koyeb CLI installé avec succès !${NC}"
    echo ""
    
    # Ajouter au PATH pour la session actuelle
    export PATH="$KOYEB_DIR/bin:$PATH"
    
    # Vérifier la version
    echo -e "${BLUE}Version installée :${NC}"
    "$KOYEB_DIR/bin/koyeb" version
    echo ""
    
    # Instructions pour ajouter au PATH permanent
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}IMPORTANT : Ajouter Koyeb CLI au PATH${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Pour utiliser Koyeb CLI dans toutes les sessions, ajoutez cette ligne"
    echo "à votre fichier de configuration shell :"
    echo ""
    echo -e "${GREEN}export PATH=\"\$HOME/.koyeb/bin:\$PATH\"${NC}"
    echo ""
    echo "Fichiers de configuration possibles :"
    echo "  • ~/.bashrc (Git Bash)"
    echo "  • ~/.bash_profile (Git Bash)"
    echo "  • ~/.zshrc (si vous utilisez Zsh)"
    echo ""
    
    # Proposer d'ajouter automatiquement au .bashrc
    if [ -f "$HOME/.bashrc" ]; then
        echo -e "${BLUE}Voulez-vous ajouter automatiquement au ~/.bashrc ? (o/N)${NC}"
        read -p "> " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Oo]$ ]]; then
            # Vérifier si la ligne existe déjà
            if ! grep -q "\.koyeb/bin" "$HOME/.bashrc"; then
                echo "" >> "$HOME/.bashrc"
                echo "# Koyeb CLI" >> "$HOME/.bashrc"
                echo "export PATH=\"\$HOME/.koyeb/bin:\$PATH\"" >> "$HOME/.bashrc"
                echo -e "${GREEN}✅ Ajouté à ~/.bashrc${NC}"
                echo ""
                echo -e "${YELLOW}Rechargez votre shell avec : source ~/.bashrc${NC}"
            else
                echo -e "${YELLOW}⚠️  Déjà présent dans ~/.bashrc${NC}"
            fi
        fi
    fi
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Prochaines étapes :${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "1. Recharger votre shell (ou ouvrir un nouveau terminal)"
    echo "2. Se connecter à Koyeb :"
    echo -e "   ${GREEN}koyeb login${NC}"
    echo ""
    echo "3. Vérifier que tout est prêt :"
    echo -e "   ${GREEN}./check-koyeb-ready.sh${NC}"
    echo ""
    echo "4. Déployer le backend :"
    echo -e "   ${GREEN}./deploy-koyeb.sh dev${NC}"
    echo ""
    
else
    echo ""
    echo -e "${RED}❌ Erreur lors de l'installation${NC}"
    echo ""
    echo "Essayez l'installation manuelle :"
    echo "1. Téléchargez depuis : https://github.com/koyeb/koyeb-cli/releases"
    echo "2. Consultez : INSTALLATION_KOYEB_WINDOWS.md"
    exit 1
fi

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Installation terminée avec succès !              ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"

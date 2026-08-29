#!/bin/bash
# Script pour déplacer tous les fichiers de test HTML dans un dossier dédié
# Auteur: Script automatique pour nettoyer le projet ClaraVerse
# Date: 2026-03-02

echo "========================================"
echo "  Nettoyage des fichiers de test HTML  "
echo "========================================"
echo ""

# Créer le dossier de destination
TEST_FOLDER="tests-html"
if [ ! -d "$TEST_FOLDER" ]; then
    mkdir -p "$TEST_FOLDER"
    echo "[OK] Dossier '$TEST_FOLDER' créé"
else
    echo "[INFO] Dossier '$TEST_FOLDER' existe déjà"
fi

# Compteurs
MOVED_COUNT=0
ERROR_COUNT=0

# Fonction pour déplacer un fichier
move_test_file() {
    local file_path=$1
    local file_name=$(basename "$file_path")
    local dest_path="$TEST_FOLDER/$file_name"
    
    if [ -f "$dest_path" ]; then
        echo "  [SKIP] $file_name (existe déjà)"
        return 1
    fi
    
    if mv "$file_path" "$dest_path" 2>/dev/null; then
        echo "  [OK] $file_name déplacé"
        return 0
    else
        echo "  [ERREUR] $file_name"
        return 2
    fi
}

echo ""
echo "Recherche des fichiers de test..."
echo ""

# Déplacer les fichiers de la racine
echo "1. Fichiers à la racine du projet:"
for pattern in test-*.html TEST_*.html debug*.html diagnostic*.html recovery.html solution-*.html fix-*.html; do
    for file in $pattern 2>/dev/null; do
        if [ -f "$file" ]; then
            move_test_file "$file"
            case $? in
                0) ((MOVED_COUNT++)) ;;
                2) ((ERROR_COUNT++)) ;;
            esac
        fi
    done
done

# Déplacer les fichiers du dossier public
echo ""
echo "2. Fichiers dans le dossier 'public':"
if [ -d "public" ]; then
    for pattern in test-*.html TEST_*.html debug*.html diagnostic*.html fix-*.html; do
        for file in public/$pattern 2>/dev/null; do
            if [ -f "$file" ]; then
                move_test_file "$file"
                case $? in
                    0) ((MOVED_COUNT++)) ;;
                    2) ((ERROR_COUNT++)) ;;
                esac
            fi
        done
    done
fi

# Déplacer les fichiers du dossier electron
echo ""
echo "3. Fichiers dans le dossier 'electron':"
if [ -d "electron" ]; then
    for file in electron/featureSelection.html electron/loading.html electron/splash.html; do
        if [ -f "$file" ]; then
            move_test_file "$file"
            case $? in
                0) ((MOVED_COUNT++)) ;;
                2) ((ERROR_COUNT++)) ;;
            esac
        fi
    done
fi

# Déplacer les fichiers du dossier ressource
echo ""
echo "4. Fichiers dans le dossier 'ressource':"
if [ -d "ressource" ]; then
    for file in ressource/*.html 2>/dev/null; do
        if [ -f "$file" ]; then
            move_test_file "$file"
            case $? in
                0) ((MOVED_COUNT++)) ;;
                2) ((ERROR_COUNT++)) ;;
            esac
        fi
    done
fi

# Déplacer les fichiers du dossier sdk
echo ""
echo "5. Fichiers dans le dossier 'sdk':"
if [ -d "sdk" ]; then
    for file in sdk/test-*.html 2>/dev/null; do
        if [ -f "$file" ]; then
            move_test_file "$file"
            case $? in
                0) ((MOVED_COUNT++)) ;;
                2) ((ERROR_COUNT++)) ;;
            esac
        fi
    done
fi

# Déplacer les fichiers du dossier test-configs
echo ""
echo "6. Fichiers dans le dossier 'test-configs':"
if [ -d "test-configs" ]; then
    for file in test-configs/*.html 2>/dev/null; do
        if [ -f "$file" ]; then
            move_test_file "$file"
            case $? in
                0) ((MOVED_COUNT++)) ;;
                2) ((ERROR_COUNT++)) ;;
            esac
        fi
    done
fi

# Déplacer les fichiers du dossier src/components
echo ""
echo "7. Fichiers dans le dossier 'src/components':"
if [ -d "src/components" ]; then
    for file in src/components/*.html 2>/dev/null; do
        if [ -f "$file" ]; then
            move_test_file "$file"
            case $? in
                0) ((MOVED_COUNT++)) ;;
                2) ((ERROR_COUNT++)) ;;
            esac
        fi
    done
fi

# Résumé
echo ""
echo "========================================"
echo "           RÉSUMÉ DU NETTOYAGE          "
echo "========================================"
echo ""
echo "Fichiers déplacés : $MOVED_COUNT"
if [ $ERROR_COUNT -gt 0 ]; then
    echo "Erreurs rencontrées : $ERROR_COUNT"
fi
echo ""
echo "Tous les fichiers de test sont maintenant dans le dossier '$TEST_FOLDER'"
echo ""

# Créer un fichier README dans le dossier tests-html
cat > "$TEST_FOLDER/README.md" << EOF
# Fichiers de Test HTML - ClaraVerse

Ce dossier contient tous les fichiers HTML de test qui ont été déplacés depuis la racine du projet.

## Raison du déplacement

Ces fichiers causaient des erreurs lors du scan de dépendances par Vite au démarrage de l'application.
En les déplaçant ici, ils restent accessibles pour les tests mais n'interfèrent plus avec le build.

## Utilisation

Pour utiliser ces fichiers de test :
1. Ouvrez-les directement dans votre navigateur
2. Ou utilisez un serveur HTTP local : \`python -m http.server 8000\`

## Date de déplacement

$(date '+%Y-%m-%d %H:%M:%S')

## Fichiers déplacés

$MOVED_COUNT fichiers au total
EOF

echo "[OK] Fichier README.md créé dans '$TEST_FOLDER'"
echo ""
echo "Vous pouvez maintenant relancer l'application avec : npm run dev"
echo ""

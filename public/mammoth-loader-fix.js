/**
 * SOLUTION CONFLIT MAMMOTH.JS + AMD/RequireJS
 * Charge Mammoth.js en isolant le système de modules AMD
 */

(function () {
    'use strict';

    // Fonction pour charger Mammoth.js sans conflit AMD
    window.loadMammothSafe = function () {
        return new Promise((resolve, reject) => {
            // Si déjà chargé, retourner immédiatement
            if (window.mammoth && typeof window.mammoth.convertToHtml === 'function') {
                console.log('✅ Mammoth.js déjà disponible');
                resolve(window.mammoth);
                return;
            }

            console.log('⏳ Chargement sécurisé de Mammoth.js...');

            // Sauvegarder les références AMD/RequireJS
            const savedDefine = window.define;
            const savedRequire = window.require;

            // Désactiver temporairement AMD
            if (window.define) {
                window.define = undefined;
            }
            if (window.require) {
                window.require = undefined;
            }

            // Créer le script
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';

            script.onload = function () {
                // Restaurer AMD/RequireJS
                if (savedDefine) {
                    window.define = savedDefine;
                }
                if (savedRequire) {
                    window.require = savedRequire;
                }

                // Vérifier que Mammoth est bien chargé
                if (window.mammoth && typeof window.mammoth.convertToHtml === 'function') {
                    console.log('✅ Mammoth.js chargé avec succès (mode sécurisé)');
                    resolve(window.mammoth);
                } else {
                    console.error('❌ Mammoth.js chargé mais API non disponible');
                    reject(new Error('Mammoth API non disponible'));
                }
            };

            script.onerror = function () {
                // Restaurer AMD/RequireJS même en cas d'erreur
                if (savedDefine) {
                    window.define = savedDefine;
                }
                if (savedRequire) {
                    window.require = savedRequire;
                }
                console.error('❌ Erreur de chargement de Mammoth.js');
                reject(new Error('Échec du chargement de Mammoth.js'));
            };

            document.head.appendChild(script);
        });
    };

    // Cache pour éviter de reconvertir les mêmes fichiers
    const conversionCache = new Map();

    // Fonction utilitaire pour convertir un fichier Word
    window.convertWordToHtml = async function (docxPath, options = {}) {
        try {
            // Vérifier le cache
            if (conversionCache.has(docxPath) && !options.forceReload) {
                console.log('✅ Utilisation du cache pour:', docxPath);
                return conversionCache.get(docxPath);
            }

            // Charger Mammoth si nécessaire
            await window.loadMammothSafe();

            // Charger le fichier
            console.log('📦 Chargement du fichier:', docxPath);
            const response = await fetch(docxPath);
            const arrayBuffer = await response.arrayBuffer();
            console.log('📦 Fichier chargé, taille:', arrayBuffer.byteLength, 'bytes');

            // Convertir avec Mammoth (en morceaux pour éviter le blocage)
            console.log('⏳ Conversion en cours... (peut prendre quelques secondes)');

            // Utiliser setTimeout pour libérer le thread principal
            const result = await new Promise((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        const convertResult = await window.mammoth.convertToHtml({
                            arrayBuffer: arrayBuffer
                        });
                        resolve(convertResult);
                    } catch (err) {
                        reject(err);
                    }
                }, 100); // Petit délai pour libérer le thread
            });

            console.log('✅ Conversion réussie!');

            const finalResult = {
                html: result.value,
                messages: result.messages
            };

            // Mettre en cache
            conversionCache.set(docxPath, finalResult);

            return finalResult;
        } catch (error) {
            console.error('❌ Erreur lors de la conversion:', error);
            throw error;
        }
    };

    // Fonction pour vider le cache si nécessaire
    window.clearWordConversionCache = function () {
        conversionCache.clear();
        console.log('🗑️ Cache de conversion vidé');
    };

    console.log('✅ Mammoth Loader Fix initialisé');
})();

/**
 * Script d'injection HTML pour Claraverse - Version Debug
 * Nom : html_template.js
 * Objectif : Injecter du contenu HTML structuré dans la page de chat
 */

(function() {
    'use strict';
    
    console.log('🚀 Script HTML Template Claraverse chargé');

    // Configuration
    const CONFIG = {
        // Différents sélecteurs à essayer
        selectors: [
            // Sélecteur spécifique des tables Claraverse
            'table.min-w-full.border.border-gray-200',
            'table.min-w-full',
            'div.prose table',
            'table',
            // Sélecteur des divs prose
            'div.prose',
            'div[class*="prose"]'
        ],
        injectionDelay: 1000,
        processedClass: 'html-template-injected',
        maxRetries: 10,
        retryInterval: 2000
    };

    let retryCount = 0;

    /**
     * Contenu HTML simplifié pour test
     */
    const HTML_TEMPLATE = `
        <div class="html-template-wrapper" style="margin: 40px auto; max-width: 900px; background: #e5e7eb; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
            <style>
                .html-template-wrapper {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-height: 800px;
                    overflow-y: auto;
                    scroll-behavior: smooth;
                }
                .html-template-wrapper::-webkit-scrollbar {
                    width: 10px;
                }
                .html-template-wrapper::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .html-template-wrapper::-webkit-scrollbar-thumb {
                    background: #667eea;
                    border-radius: 10px;
                }
                .html-template-wrapper::-webkit-scrollbar-thumb:hover {
                    background: #5568d3;
                }
                .template-slide {
                    background: white;
                    padding: 40px;
                    margin: 15px 0;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    min-height: 500px;
                    max-height: 700px;
                    page-break-after: always;
                }
                .template-slide.gradient {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%), url('/src/assets/B10.jpg');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    color: white;
                }
                .template-slide.gradient-alt {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%), url('/src/assets/B41.JPG');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    color: white;
                }
                .template-slide.with-bg {
                    background: url('/src/assets/B10.jpg');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    position: relative;
                }
                .template-slide.with-bg::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 8px;
                }
                .template-slide.with-bg > * {
                    position: relative;
                    z-index: 1;
                }
                .template-title {
                    font-size: 48px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                .template-subtitle {
                    font-size: 24px;
                    text-align: center;
                    opacity: 0.95;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                }
                .template-card {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px;
                    margin: 20px 0;
                    backdrop-filter: blur(5px);
                }
                .template-card h3 {
                    font-size: 36px;
                    margin-bottom: 15px;
                }
                .template-command {
                    background: #2d3748;
                    color: #68d391;
                    padding: 20px;
                    border-radius: 8px;
                    font-family: 'Courier New', monospace;
                    margin: 15px 0;
                }
                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                }
            </style>

            <!-- Slide 1: Titre -->
            <div class="template-slide gradient">
                <div class="template-title">E-AUDIT PRO 2.0</div>
                <div class="template-subtitle">GUIDE PRATIQUE</div>
                <div style="text-align: center; margin-top: 20px; font-size: 18px; opacity: 0.9;">
                    Guide des Commandes utilisateur
                </div>
            </div>

            <!-- Slide 2: Sommaire -->
            <div class="template-slide with-bg">
                <h2 style="color: #667eea; font-size: 36px; border-bottom: 3px solid #667eea; padding-bottom: 10px;">SOMMAIRE</h2>
                <ul style="list-style: none; font-size: 20px; line-height: 2; margin-top: 30px;">
                    <li style="padding-left: 30px; position: relative;">
                        <span style="position: absolute; left: 0; color: #667eea; font-size: 24px;">•</span>
                        Avant-propos
                    </li>
                    <li style="padding-left: 30px; position: relative;">
                        <span style="position: absolute; left: 0; color: #667eea; font-size: 24px;">•</span>
                        Principe de base - P3
                    </li>
                    <li style="padding-left: 30px; position: relative;">
                        <span style="position: absolute; left: 0; color: #667eea; font-size: 24px;">•</span>
                        Cartographie des risques - P5
                    </li>
                    <li style="padding-left: 30px; position: relative;">
                        <span style="position: absolute; left: 0; color: #667eea; font-size: 24px;">•</span>
                        Interfaces - P8
                    </li>
                </ul>
            </div>

            <!-- Slide 3: Principes -->
            <div class="template-slide with-bg">
                <h2 style="color: #667eea; font-size: 36px; border-bottom: 3px solid #667eea; padding-bottom: 10px;">Principe de base</h2>
                
                <div class="template-grid">
                    <div class="template-card">
                        <h3>1</h3>
                        <p>Un programme de travail constitue les travaux d'audit à accomplir pour atteindre les objectifs d'audit</p>
                    </div>
                    <div class="template-card">
                        <h3>2</h3>
                        <p>Les objectifs d'audit de la mission et les risques associés doivent être annexés à tout programme de travail</p>
                    </div>
                    <div class="template-card">
                        <h3>3</h3>
                        <p>E-audit a adopté une interface de type intelligence artificielle avec les mêmes principes d'interaction</p>
                    </div>
                </div>

                <div style="background: #f8f9fa; border: 3px solid #667eea; border-radius: 10px; padding: 30px; margin-top: 30px;">
                    <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">RISQUES → SCENARIO → ÉCART</p>
                    <p style="font-size: 16px;">Le logiciel propose la rédaction automatisée de l'étape clés de mission :</p>
                    <p style="font-size: 16px; margin-top: 10px;">○ Cartographie des risques</p>
                </div>
            </div>

            <!-- Slide 4: Commandes -->
            <div class="template-slide with-bg">
                <h2 style="color: #667eea; font-size: 36px; border-bottom: 3px solid #667eea; padding-bottom: 10px;">Les Commandes</h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px;">
                    <div style="background: #f8f9fa; border: 3px solid #667eea; border-radius: 10px; padding: 25px;">
                        <h4 style="color: #667eea; font-size: 22px; margin-bottom: 15px;">La commande elle-même</h4>
                        <p style="margin-bottom: 15px;">Il y a la commande en elle même qui représente une étape de mission.</p>
                        <p style="font-weight: bold; margin-bottom: 10px;">Exemple :</p>
                        <div class="template-command">
                            <code>[Command] = /Cartographie</code>
                        </div>
                    </div>
                    
                    <div style="background: #f8f9fa; border: 3px solid #667eea; border-radius: 10px; padding: 25px;">
                        <h4 style="color: #667eea; font-size: 22px; margin-bottom: 15px;">Les paramètres</h4>
                        <p style="margin-bottom: 15px;">Les paramètres permettent de rendre dynamique la commande selon les besoins.</p>
                        <p style="font-weight: bold; margin-bottom: 10px;">Exemple :</p>
                        <div class="template-command">
                            <code>[Command] = /Cartographie</code><br>
                            <code>[Processus] = inventaire de caisse</code><br>
                            <code>[Objectif] = conformité</code>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Slide 5: Fonctionnalités -->
            <div class="template-slide with-bg">
                <h2 style="color: #667eea; font-size: 36px; border-bottom: 3px solid #667eea; padding-bottom: 10px;">Fonctionnalités</h2>
                
                <h3 style="color: #667eea; font-size: 28px; margin: 30px 0 20px;">1. Cartographie des risques</h3>
                
                <div class="template-command" style="font-size: 16px;">
                    <code>[Command] = /Cartographie</code><br>
                    <code>[Secteur d'activité] = industrie</code><br>
                    <code>[Cycle] = trésorerie</code><br>
                    <code>[Processus] = élaboration des rapprochements bancaire</code>
                </div>
                
                <div style="text-align: center; margin-top: 40px; font-size: 18px; color: #666;">
                    COMMANDE USER → INTERFACE → E-AUDIT PRO
                </div>
            </div>

            <!-- Slide 6: Final -->
            <div class="template-slide gradient-alt">
                <div class="template-title" style="font-size: 64px;">E-Audit</div>
                <div class="template-subtitle" style="font-size: 28px;">V2.0</div>
                <div style="text-align: center; margin-top: 30px; font-size: 20px; opacity: 0.95; letter-spacing: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
                    CREATIVE & CLEAN TEMPLATE
                </div>
            </div>
        </div>
    `;

    /**
     * Fonction de débogage pour afficher les éléments trouvés
     */
    function debugElements() {
        console.log('🔍 Débogage des éléments présents dans la page:');
        
        CONFIG.selectors.forEach((selector, index) => {
            try {
                const elements = document.querySelectorAll(selector);
                console.log(`  ${index + 1}. Sélecteur: "${selector}" → ${elements.length} élément(s) trouvé(s)`);
                
                if (elements.length > 0) {
                    console.log('     Premier élément:', elements[0]);
                }
            } catch (e) {
                console.log(`  ${index + 1}. Sélecteur: "${selector}" → ERREUR: ${e.message}`);
            }
        });

        // Vérifier les divs générales
        const allDivs = document.querySelectorAll('div');
        console.log(`  📦 Total divs dans la page: ${allDivs.length}`);
        
        const allTables = document.querySelectorAll('table');
        console.log(`  📊 Total tables dans la page: ${allTables.length}`);
    }

    /**
     * Trouve le conteneur d'injection avec plusieurs stratégies
     */
    function findInjectionTarget() {
        console.log('🎯 Recherche du conteneur d\'injection...');

        // Stratégie 1: Trouver la dernière table
        for (const selector of CONFIG.selectors.filter(s => s.includes('table'))) {
            const tables = document.querySelectorAll(selector);
            if (tables.length > 0) {
                const lastTable = tables[tables.length - 1];
                console.log('✅ Table trouvée avec:', selector);
                
                // Chercher le conteneur parent
                let parent = lastTable.closest('div');
                if (parent) {
                    console.log('✅ Conteneur parent trouvé');
                    return parent;
                }
                
                // Sinon, utiliser le parent direct
                return lastTable.parentElement;
            }
        }

        // Stratégie 2: Trouver une div prose ou similaire
        for (const selector of CONFIG.selectors.filter(s => s.includes('div'))) {
            const divs = document.querySelectorAll(selector);
            if (divs.length > 0) {
                const lastDiv = divs[divs.length - 1];
                console.log('✅ Div trouvée avec:', selector);
                return lastDiv;
            }
        }

        // Stratégie 3: Utiliser le body comme dernier recours
        console.log('⚠️ Aucun conteneur spécifique trouvé, utilisation du body');
        return document.body;
    }

    /**
     * Injecte le template HTML
     */
    function injectTemplate(container) {
        if (!container) {
            console.error('❌ Aucun conteneur fourni pour l\'injection');
            return false;
        }

        // Vérifier si déjà traité
        if (container.querySelector('.html-template-wrapper')) {
            console.log('ℹ️ Template déjà présent, injection annulée');
            return false;
        }

        try {
            // Créer un élément temporaire
            const temp = document.createElement('div');
            temp.innerHTML = HTML_TEMPLATE;

            // Insérer le contenu
            const templateContent = temp.firstElementChild;
            container.appendChild(templateContent);

            console.log('✅ Template injecté avec succès !');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de l\'injection:', error);
            return false;
        }
    }

    /**
     * Fonction principale d'exécution
     */
    function execute() {
        console.log(`\n🔄 Tentative d'injection ${retryCount + 1}/${CONFIG.maxRetries}`);
        
        // Débogage
        debugElements();

        // Trouver et injecter
        const target = findInjectionTarget();
        const success = injectTemplate(target);

        if (!success && retryCount < CONFIG.maxRetries) {
            retryCount++;
            console.log(`⏳ Nouvelle tentative dans ${CONFIG.retryInterval}ms...`);
            setTimeout(execute, CONFIG.retryInterval);
        } else if (success) {
            console.log('🎉 Injection terminée avec succès !');
        } else {
            console.log('❌ Nombre maximum de tentatives atteint');
        }
    }

    /**
     * Initialisation
     */
    function initialize() {
        console.log('⚙️ Initialisation du script...');

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(execute, CONFIG.injectionDelay);
            });
        } else {
            setTimeout(execute, CONFIG.injectionDelay);
        }
    }

    /**
     * Observer pour détecter les changements
     */
    function setupObserver() {
        const observer = new MutationObserver((mutations) => {
            const hasNewTable = mutations.some(mutation => 
                Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && (
                        node.tagName === 'TABLE' || 
                        node.querySelector('table')
                    )
                )
            );

            if (hasNewTable) {
                console.log('📊 Nouvelle table détectée !');
                retryCount = 0;
                execute();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('👀 Observer activé');
    }

    // Démarrage
    initialize();
    setupObserver();

    // API globale
    window.ClaraverseHTML = {
        inject: execute,
        debug: debugElements,
        version: '2.0.0'
    };

    console.log('✅ Script initialisé. Utilisez window.ClaraverseHTML.inject() pour forcer l\'injection');
    console.log('✅ Utilisez window.ClaraverseHTML.debug() pour voir les éléments disponibles');

})();
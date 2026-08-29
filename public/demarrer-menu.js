/**
 * Menu Démarrer - E-audit Pro
 * 
 * Ce script gère le bouton [Démarrer] et son menu contextuel hiérarchique
 * pour automatiser les prompts dans la zone de saisie du chat.
 * 
 * @version 1.0.0
 * @author E-audit Team
 */

(function () {
    'use strict';

    // ============================================================
    // CONFIGURATION DU MENU
    // ============================================================

    const MENU_CONFIG = {
        // E-audit Pro
        'E-audit pro': {
            'Phase de préparation': {
                'Cartographie des risques': {
                    command: `[Command] = Cartographie des risques
[Processus] = inventaire de caisse
[Risques critiques] = fraude
[Objectif] = couvrir la fraude`,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Référentiel de contrôle interne': {
                    command: `[Command] = Référentiel de contrôle interne
[Processus] = 
[Objectif] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Questionnaire de contrôle interne': {
                    command: `[Command] = Questionnaire de contrôle interne
[Processus] = 
[Objectif] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Tableau des forces et faiblesses apparentes': {
                    command: `[Command] = Tableau des forces et faiblesses apparentes
[Processus] = 
[Objectif] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Rapport d\'orientation': {
                    command: `[Command] = Rapport d'orientation
[Processus] = 
[Objectif] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Programme de travail': {
                    command: `[Command] = Programme de travail
[Processus] = inventaire de caisse`,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                }
            },
            'Phase de réalisation': {
                'Feuille couverture': {
                    command: `[Command] = Feuille couverture
[Processus] = 
[Objectif] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                }
            },
            'Phase de conclusion': {
                'Frap': {
                    command: `[Command] = Frap
[Processus] = 
[Constat] = 
[Recommandation] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Synthèse des Frap': {
                    command: `[Command] = Synthèse des Frap
[Processus] = 
[Objectif] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Rapport provisoire': {
                    command: `[Command] = Rapport provisoire
[Processus] = 
[Objectif] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Réunion de clôture': {
                    command: `[Command] = Réunion de clôture
[Processus] = 
[Objectif] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Rapport final': {
                    command: `[Command] = Rapport final
[Processus] = 
[Objectif] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                }
            }
        },
        // E-cartographie
        'E-cartographie': {
            'Analyse des risques': {
                'Identification des risques': {
                    command: `[Command] = Identification des risques
[Domaine] = 
[Périmètre] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Évaluation des risques': {
                    command: `[Command] = Évaluation des risques
[Domaine] = 
[Critères] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Matrice des risques': {
                    command: `[Command] = Matrice des risques
[Domaine] = 
[Format] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                }
            }
        },
        // E-revision
        'E-revision': {
            'Revue analytique': {
                'Revue analytique générale': {
                    command: `[Command] = Revue analytique
[Processus] = 
[Période] = 
[Objectif] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Analyse des variations': {
                    command: `[Command] = Analyse des variations
[Compte] = 
[Période] = 
[Seuil] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                }
            },
            'Contrôle des comptes': {
                // CYCLE TRÉSORERIE
                'Trésorerie': {
                    'AA040 - test sur la validation du compte caisse': {
                        command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA040
[reference] = test sur la validation du compte caisse
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'AA145 - Test sur les décaissements après la clôture': {
                        command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA145
[reference] = Test sur les décaissements après la clôture
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'AA160 - Test sur les décaissements avant la clôture': {
                        command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA160
[reference] = Test sur les décaissements avant la clôture
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'AA200 - Caisse': {
                        command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA200
[reference] = Caisse
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'AA400 - Suspens Banque': {
                        command: `[Command] = /feuille couverture
[Processus] = Trésorerie
[test] = AA400
[reference] = Suspens Banque
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    }
                },
                // CYCLE VENTES
                'Ventes': {
                    'BB040 - Rapprochement CA': {
                        command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB040
[reference] = Rapprochement CA
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'BB145 - Test de séparation des exercices ventes': {
                        command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB145
[reference] = Test de séparation des exercices ventes
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'BB160 - Test de séparation des exercices avoir': {
                        command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB160
[reference] = Test de séparation des exercices avoir
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'BB300 - Test de validation analytique': {
                        command: `[Command] = /feuille couverture
[Processus] = VENTES
[test] = BB300
[reference] = Test de validation analytique
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    }
                },
                // CYCLE STOCKS
                'Stocks': {
                    'CC20 - Test sur la centralisation': {
                        command: `[Command] = /feuille couverture
[Processus] = Stock
[test] = CC20
[reference] = Test sur la centralisation
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'CC30 - Test Stock Physique Inventorié': {
                        command: `[Command] = /feuille couverture
[Processus] = Stock
[test] = CC30
[reference] = Test Stock Physique Inventorié
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'CC104 - Test la variation stock': {
                        command: `[Command] = /feuille couverture
[Processus] = Stock
[test] = CC104
[reference] = Test la variation stock
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'CC145 - Valorisation en CUMP': {
                        command: `[Command] = /feuille couverture
[Processus] = Stock
[test] = CC145
[reference] = Valorisation en CUMP
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'CC300 - Provisions Dépréciation': {
                        command: `[Command] = /feuille couverture
[Processus] = Stock
[test] = CC300
[reference] = Provisions Dépréciation
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    }
                },
                // CYCLE IMMOBILISATIONS
                'Immobilisations': {
                    'DD040 - Tableau Mouvement immobilisations': {
                        command: `[Command] = /feuille couverture
[Processus] = IMMOBILISATIONS
[test] = DD040
[reference] = Tableau Mouvement immobilisations
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'DD104 - Test acquisitions': {
                        command: `[Command] = /feuille couverture
[Processus] = IMMOBILISATIONS
[test] = DD104
[reference] = Test acquisitions
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'DD120 - Test sur les cessions': {
                        command: `[Command] = /feuille couverture
[Processus] = IMMOBILISATIONS
[test] = DD120
[reference] = Test sur les cessions
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'DD145 - Test dotation aux amortissements': {
                        command: `[Command] = /feuille couverture
[Processus] = IMMOBILISATIONS
[test] = DD145
[reference] = Test dotation aux amortissements
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'DD180 - Test entretien charges': {
                        command: `[Command] = /feuille couverture
[Processus] = IMMOBILISATIONS
[test] = DD180
[reference] = Test entretien charges
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    }
                },
                // CYCLE CLIENTS
                'Clients': {
                    'FE040 - Circularisation client': {
                        command: `[Command] = /feuille couverture
[Processus] = client
[test] = FE040
[reference] = Circularisation client
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FE200 - Procédure alternative': {
                        command: `[Command] = /feuille couverture
[Processus] = client
[test] = FE200
[reference] = Procédure alternative
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FE300 - Test de séparation des exercices Client': {
                        command: `[Command] = /feuille couverture
[Processus] = client
[test] = FE300
[reference] = Test de séparation des exercices Client
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FE345 - Créances provisionnées': {
                        command: `[Command] = /feuille couverture
[Processus] = client
[test] = FE345
[reference] = Créances provisionnées
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FE360 - Revue Balance agée': {
                        command: `[Command] = /feuille couverture
[Processus] = client
[test] = FE360
[reference] = Revue Balance agée
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    }
                },
                // CYCLE FOURNISSEURS
                'Fournisseurs': {
                    'FF040 - Circularisation fournisseurs': {
                        command: `[Command] = /feuille couverture
[Processus] = fournisseur
[test] = FF040
[reference] = Circularisation fournisseurs
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FF200 - Procédure alternative FRS': {
                        command: `[Command] = /feuille couverture
[Processus] = fournisseur
[test] = FF200
[reference] = Procédure alternative FRS
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FF300 - Test de séparation des exercices Fournisseurs': {
                        command: `[Command] = /feuille couverture
[Processus] = fournisseur
[test] = FF300
[reference] = Test de séparation des exercices Fournisseurs
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FF400 - Test PCA CCA': {
                        command: `[Command] = /feuille couverture
[Processus] = fournisseur
[test] = FF400
[reference] = Test PCA CCA
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FF445 - Test charges récurrentes': {
                        command: `[Command] = /feuille couverture
[Processus] = fournisseur
[test] = FF445
[reference] = Test charges récurrentes
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    }
                },
                // CYCLE PERSONNEL
                'Personnel': {
                    'FP040 - Test Cotisations Fiscales': {
                        command: `[Command] = /feuille couverture
[Processus] = personnel
[test] = FP040
[reference] = Test Cotisations Fiscales
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FP45 - Rapprochement de solde BG-livre de paie': {
                        command: `[Command] = /feuille couverture
[Processus] = personnel
[test] = FP45
[reference] = Rapprochement de solde BG-livre de paie
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FP104 - Test Cotisations sociales': {
                        command: `[Command] = /feuille couverture
[Processus] = personnel
[test] = FP104
[reference] = Test Cotisations sociales
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FP130 - Validation base imposable': {
                        command: `[Command] = /feuille couverture
[Processus] = personnel
[test] = FP130
[reference] = Validation base imposable
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FP145 - Travaux analytiques salaire': {
                        command: `[Command] = /feuille couverture
[Processus] = personnel
[test] = FP145
[reference] = Travaux analytiques salaire
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    }
                },
                // CYCLE CAPITAUX PROPRES
                'Capitaux propres': {
                    'FQ200 - Emprunts et dettes': {
                        command: `[Command] = /feuille couverture
[Processus] = capitaux propres
[test] = FQ200
[reference] = Emprunts et dettes
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FQ300 - Tableau provision RC': {
                        command: `[Command] = /feuille couverture
[Processus] = capitaux propres
[test] = FQ300
[reference] = Tableau provision RC
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'FQ400 - Subventions': {
                        command: `[Command] = /feuille couverture
[Processus] = capitaux propres
[test] = FQ400
[reference] = Subventions
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    }
                },
                // CYCLE CHARGES D'EXPLOITATION
                'Charges d\'exploitation': {
                    'MM042 - TEST DETAIL PUB': {
                        command: `[Command] = /feuille couverture
[Processus] = charge d'exploitation
[test] = MM042
[reference] = TEST DETAIL PUB
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'MM200 - Test sur les charges prestations': {
                        command: `[Command] = /feuille couverture
[Processus] = charge d'exploitation
[test] = MM200
[reference] = Test sur les charges prestations
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'MM245 - Test TSE': {
                        command: `[Command] = /feuille couverture
[Processus] = charge d'exploitation
[test] = MM245
[reference] = Test TSE
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'MM300 - Test patentes': {
                        command: `[Command] = /feuille couverture
[Processus] = charge d'exploitation
[test] = MM300
[reference] = Test patentes
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'MM400 - Test impôt Foncier': {
                        command: `[Command] = /feuille couverture
[Processus] = charge d'exploitation
[test] = MM400
[reference] = Test impôt Foncier
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    }
                },
                // CYCLE IMPÔTS ET TAXES
                'Impôts et taxes': {
                    'NN040 - Rapprochement de solde TVA - CA': {
                        command: `[Command] = /feuille couverture
[Processus] = impôt et taxes
[test] = NN040
[reference] = Rapprochement de solde TVA - CA
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'NN200 - Test CN': {
                        command: `[Command] = /feuille couverture
[Processus] = impôt et taxes
[test] = NN200
[reference] = Test CN
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'NN220 - Test IGR': {
                        command: `[Command] = /feuille couverture
[Processus] = impôt et taxes
[test] = NN220
[reference] = Test IGR
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'NN245 - Test IRC': {
                        command: `[Command] = /feuille couverture
[Processus] = impôt et taxes
[test] = NN245
[reference] = Test IRC
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    },
                    'NN300 - Test IRVM': {
                        command: `[Command] = /feuille couverture
[Processus] = impôt et taxes
[test] = NN300
[reference] = Test IRVM
[Nb de lignes] = 10`,
                        submenu: ['Normal', 'Demo']
                    }
                }
            },
            'Synthèse de mission': {
                'Synthèse des travaux': {
                    command: `[Command] = Synthèse des travaux
[Mission] = 
[Période] = 
[Conclusions] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Points d\'attention': {
                    command: `[Command] = Points d'attention
[Domaine] = 
[Risque] = 
[Recommandation] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Rapport de synthèse': {
                    command: `[Command] = Rapport de synthèse
[Mission] = 
[Conclusions] = 
[Recommandations] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                }
            }
        },
        // Bibliothèque
        'Bibliothèque': {
            'Guides': {
                'Guide méthodologique': {
                    command: `[Command] = Guide méthodologique
[Thème] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                },
                'Bonnes pratiques': {
                    command: `[Command] = Bonnes pratiques
[Domaine] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                }
            },
            'Commandes complémentaires': {
                'Aide contextuelle': {
                    command: `[Command] = Aide
[Sujet] = `,
                    submenu: ['Normal', 'Avancé', 'Intelligent', 'Manuel']
                }
            }
        },
        // États Financiers SYSCOHADA
        'États Financiers': {
            'Import Balance': {
                '📊 Importer Balance Excel': {
                    command: '__IMPORT_ETATS_FINANCIERS__',
                    submenu: [],
                    action: 'importEtatsFinanciers'
                }
            },
            'Affichage': {
                '🏦 Afficher Bilan': {
                    command: '__SHOW_BILAN__',
                    submenu: [],
                    action: 'showBilan'
                },
                '📈 Afficher Compte de Résultat': {
                    command: '__SHOW_COMPTE_RESULTAT__',
                    submenu: [],
                    action: 'showCompteResultat'
                }
            }
        }
    };

    // ============================================================
    // VARIABLES GLOBALES
    // ============================================================

    let menuContainer = null;
    let isMenuOpen = false;
    let demarrerButton = null;

    // ============================================================
    // STYLES CSS
    // ============================================================

    const MENU_STYLES = `
        /* Bouton Démarrer */
        .demarrer-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
            color: white;
            border: none;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3);
        }
        
        .demarrer-btn:hover {
            background: linear-gradient(135deg, #db2777 0%, #ec4899 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);
        }
        
        .demarrer-btn:active {
            transform: translateY(0);
        }
        
        .demarrer-btn.active {
            background: linear-gradient(135deg, #be185d 0%, #db2777 100%);
        }
        
        .demarrer-btn svg {
            width: 16px;
            height: 16px;
        }

        /* Container du menu */
        .demarrer-menu-container {
            position: fixed;
            z-index: 9999;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(0, 0, 0, 0.08);
            min-width: 280px;
            max-width: 350px;
            max-height: 70vh;
            overflow-y: auto;
            animation: menuSlideIn 0.2s ease-out;
        }
        
        .dark .demarrer-menu-container {
            background: #1f2937;
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }
        
        @keyframes menuSlideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* En-tête du menu */
        .demarrer-menu-header {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            font-weight: 600;
            font-size: 14px;
            color: #374151;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .dark .demarrer-menu-header {
            color: #f3f4f6;
            border-color: rgba(255, 255, 255, 0.1);
        }

        /* Section du menu (logiciel) */
        .demarrer-menu-section {
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .dark .demarrer-menu-section {
            border-color: rgba(255, 255, 255, 0.05);
        }
        
        .demarrer-menu-section:last-child {
            border-bottom: none;
        }

        /* Titre de section (logiciel) */
        .demarrer-section-title {
            padding: 10px 16px;
            font-weight: 600;
            font-size: 13px;
            color: #ec4899;
            background: rgba(236, 72, 153, 0.05);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: background 0.15s ease;
        }
        
        .demarrer-section-title:hover {
            background: rgba(236, 72, 153, 0.1);
        }
        
        .demarrer-section-title svg {
            width: 14px;
            height: 14px;
            transition: transform 0.2s ease;
        }
        
        .demarrer-section-title.expanded svg {
            transform: rotate(180deg);
        }

        /* Contenu de section */
        .demarrer-section-content {
            display: none;
            padding: 4px 0;
        }
        
        .demarrer-section-content.expanded {
            display: block;
        }

        /* Phase (sous-section) */
        .demarrer-phase {
            padding: 8px 16px 8px 24px;
            font-weight: 500;
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .dark .demarrer-phase {
            color: #9ca3af;
        }

        /* Item du menu (étape de mission) */
        .demarrer-menu-item {
            padding: 8px 16px 8px 32px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 13px;
            color: #374151;
            transition: all 0.15s ease;
        }
        
        .dark .demarrer-menu-item {
            color: #e5e7eb;
        }
        
        .demarrer-menu-item:hover {
            background: rgba(236, 72, 153, 0.08);
            color: #ec4899;
        }
        
        .demarrer-menu-item svg {
            width: 12px;
            height: 12px;
            opacity: 0.5;
        }

        /* Sous-menu (Normal, Avancé, etc.) */
        .demarrer-submenu {
            display: none;
            padding: 4px 0 4px 40px;
            background: rgba(0, 0, 0, 0.02);
        }
        
        .dark .demarrer-submenu {
            background: rgba(255, 255, 255, 0.02);
        }
        
        .demarrer-submenu.expanded {
            display: block;
        }

        /* Item du sous-menu */
        .demarrer-submenu-item {
            padding: 6px 16px;
            cursor: pointer;
            font-size: 12px;
            color: #6b7280;
            border-radius: 4px;
            margin: 2px 8px;
            transition: all 0.15s ease;
        }
        
        .dark .demarrer-submenu-item {
            color: #9ca3af;
        }
        
        .demarrer-submenu-item:hover {
            background: rgba(236, 72, 153, 0.1);
            color: #ec4899;
        }
        
        .demarrer-submenu-item.active {
            background: #ec4899;
            color: white;
        }

        /* Scrollbar personnalisée */
        .demarrer-menu-container::-webkit-scrollbar {
            width: 6px;
        }
        
        .demarrer-menu-container::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .demarrer-menu-container::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
        }
        
        .dark .demarrer-menu-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
        }
        
        /* Animations pour notifications */
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
    `;

    // ============================================================
    // FONCTIONS UTILITAIRES
    // ============================================================

    /**
     * Injecte les styles CSS dans le document
     */
    function injectStyles() {
        if (document.getElementById('demarrer-menu-styles')) return;

        const styleElement = document.createElement('style');
        styleElement.id = 'demarrer-menu-styles';
        styleElement.textContent = MENU_STYLES;
        document.head.appendChild(styleElement);
    }

    /**
     * Crée l'icône SVG pour le bouton
     */
    function createPlayIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>`;
    }

    /**
     * Crée l'icône chevron
     */
    function createChevronIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>`;
    }

    /**
     * Crée l'icône flèche droite
     */
    function createArrowRightIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>`;
    }

    /**
     * Trouve la zone de saisie du chat
     */
    function findChatInput() {
        // Chercher par data attribute
        let input = document.querySelector('textarea[data-chat-input="true"]');
        if (input) return input;

        // Chercher par placeholder
        input = document.querySelector('textarea[placeholder*="Demarrer"]');
        if (input) return input;

        // Chercher dans le composant Clara
        input = document.querySelector('.clara-input textarea');
        if (input) return input;

        // Fallback: premier textarea visible
        const textareas = document.querySelectorAll('textarea');
        for (const ta of textareas) {
            if (ta.offsetParent !== null) return ta;
        }

        return null;
    }

    /**
     * Insère le texte dans la zone de saisie
     */
    function insertTextInChat(text) {
        const input = findChatInput();
        if (!input) {
            console.error('[Démarrer Menu] Zone de saisie non trouvée');
            return false;
        }

        // Définir la valeur
        input.value = text;

        // Déclencher les événements React
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(input, text);

        // Événement input
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        input.dispatchEvent(inputEvent);

        // Événement change
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        input.dispatchEvent(changeEvent);

        // Focus sur l'input
        input.focus();

        // Ajuster la hauteur si nécessaire
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 200) + 'px';

        console.log('[Démarrer Menu] Texte inséré:', text);
        return true;
    }

    // ============================================================
    // CONSTRUCTION DU MENU
    // ============================================================

    /**
     * Construit le HTML du menu
     */
    function buildMenuHTML() {
        let html = `
            <div class="demarrer-menu-header">
                ${createPlayIcon()}
                <span>Menu Démarrer</span>
            </div>
        `;

        // Parcourir les logiciels
        for (const [software, phases] of Object.entries(MENU_CONFIG)) {
            html += `
                <div class="demarrer-menu-section" data-software="${software}">
                    <div class="demarrer-section-title" data-toggle="section">
                        <span>${software}</span>
                        ${createChevronIcon()}
                    </div>
                    <div class="demarrer-section-content">
            `;

            // Parcourir les phases
            for (const [phase, items] of Object.entries(phases)) {
                html += `<div class="demarrer-phase">${phase}</div>`;

                // Parcourir les items
                for (const [itemName, itemConfig] of Object.entries(items)) {
                    const itemId = `${software}-${phase}-${itemName}`.replace(/\s+/g, '-').toLowerCase();
                    const hasAction = itemConfig.action ? `data-action="${itemConfig.action}"` : '';

                    html += `
                        <div class="demarrer-menu-item" data-item-id="${itemId}" data-command="${encodeURIComponent(itemConfig.command)}" ${hasAction}>
                            <span>${itemName}</span>
                            ${itemConfig.submenu && itemConfig.submenu.length > 0 ? createArrowRightIcon() : ''}
                        </div>
                    `;

                    if (itemConfig.submenu && itemConfig.submenu.length > 0) {
                        html += `<div class="demarrer-submenu" data-submenu-for="${itemId}">`;

                        // Sous-menu (Normal, Avancé, etc.)
                        for (const subItem of itemConfig.submenu) {
                            html += `
                                <div class="demarrer-submenu-item" data-mode="${subItem}" data-command="${encodeURIComponent(itemConfig.command)}">
                                    ${subItem}
                                </div>
                            `;
                        }

                        html += `</div>`;
                    }
                }
            }

            html += `
                    </div>
                </div>
            `;
        }

        return html;
    }

    /**
     * Crée et affiche le menu
     */
    function showMenu() {
        if (menuContainer) {
            hideMenu();
            return;
        }

        // Créer le container
        menuContainer = document.createElement('div');
        menuContainer.className = 'demarrer-menu-container';
        menuContainer.innerHTML = buildMenuHTML();

        // Positionner le menu
        if (demarrerButton) {
            const rect = demarrerButton.getBoundingClientRect();
            menuContainer.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
            menuContainer.style.left = rect.left + 'px';
        }

        // Ajouter au DOM
        document.body.appendChild(menuContainer);
        isMenuOpen = true;

        // Marquer le bouton comme actif
        if (demarrerButton) {
            demarrerButton.classList.add('active');
        }

        // Attacher les événements
        attachMenuEvents();
    }

    /**
     * Cache le menu
     */
    function hideMenu() {
        if (menuContainer) {
            menuContainer.remove();
            menuContainer = null;
        }
        isMenuOpen = false;

        if (demarrerButton) {
            demarrerButton.classList.remove('active');
        }
    }

    /**
     * Attache les événements au menu
     */
    function attachMenuEvents() {
        if (!menuContainer) return;

        // Toggle des sections
        menuContainer.querySelectorAll('.demarrer-section-title').forEach(title => {
            title.addEventListener('click', (e) => {
                e.stopPropagation();
                const section = title.closest('.demarrer-menu-section');
                const content = section.querySelector('.demarrer-section-content');

                title.classList.toggle('expanded');
                content.classList.toggle('expanded');
            });
        });

        // Click sur les items
        menuContainer.querySelectorAll('.demarrer-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = item.dataset.itemId;
                const command = decodeURIComponent(item.dataset.command);
                const action = item.dataset.action;

                // Gérer les actions spéciales
                if (action || command.startsWith('__')) {
                    handleSpecialAction(action || command);
                    hideMenu();
                    return;
                }

                const submenu = menuContainer.querySelector(`[data-submenu-for="${itemId}"]`);

                // Toggle le sous-menu
                if (submenu) {
                    submenu.classList.toggle('expanded');
                }

                // Si click direct sur l'item (pas sur le sous-menu), insérer la commande
                insertTextInChat(command);
                hideMenu();
            });
        });

        // Click sur les sous-items
        menuContainer.querySelectorAll('.demarrer-submenu-item').forEach(subItem => {
            subItem.addEventListener('click', (e) => {
                e.stopPropagation();
                const mode = subItem.dataset.mode;
                let command = decodeURIComponent(subItem.dataset.command);

                // Ajouter le mode selon le type
                if (mode === 'Demo') {
                    command = `${command}\n[Demo] = Activate`;
                } else if (mode !== 'Normal') {
                    command = `[Mode] = ${mode}\n${command}`;
                }

                insertTextInChat(command);
                hideMenu();
            });
        });

        // Fermer le menu si click en dehors
        document.addEventListener('click', handleOutsideClick);
    }

    /**
     * Gère le click en dehors du menu
     */
    function handleOutsideClick(e) {
        if (!menuContainer) return;

        if (!menuContainer.contains(e.target) && !demarrerButton?.contains(e.target)) {
            hideMenu();
            document.removeEventListener('click', handleOutsideClick);
        }
    }

    /**
     * Gère les actions spéciales (import, affichage, etc.)
     */
    function handleSpecialAction(action) {
        console.log('[Démarrer Menu] Action spéciale:', action);

        switch (action) {
            case '__IMPORT_ETATS_FINANCIERS__':
            case 'importEtatsFinanciers':
                importEtatsFinanciers();
                break;
            case '__SHOW_BILAN__':
            case 'showBilan':
                toggleEtatFinancier('bilan');
                break;
            case '__SHOW_COMPTE_RESULTAT__':
            case 'showCompteResultat':
                toggleEtatFinancier('compte-resultat');
                break;
            default:
                console.warn('[Démarrer Menu] Action non reconnue:', action);
        }
    }

    /**
     * Import direct d'un fichier Excel Balance et calcul des États Financiers
     */
    async function importEtatsFinanciers() {
        try {
            // Créer un input file temporaire
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx,.xls,.csv';
            input.style.display = 'none';
            document.body.appendChild(input);

            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    input.remove();
                    return;
                }

                showNotification(`📊 Import de ${file.name}...`, 'info');
                console.log('[États Financiers] Import fichier:', file.name);

                try {
                    // Lire le fichier en base64
                    const fileBase64 = await readFileAsBase64(file);

                    // Envoyer vers l'endpoint États Financiers
                    const response = await fetch('http://127.0.0.1:5000/etats-financiers/calculate-excel', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            file_base64: fileBase64,
                            filename: file.name,
                            exercice_n: "N",
                            exercice_n1: "N-1"
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
                    }

                    const result = await response.json();
                    console.log('[États Financiers] Résultat:', result);

                    if (result.success) {
                        // Afficher les résultats
                        displayEtatsFinanciersResults(result);
                        showNotification('✅ États Financiers calculés avec succès!', 'success');
                    } else {
                        throw new Error(result.message || 'Erreur lors du calcul');
                    }

                } catch (error) {
                    console.error('[États Financiers] Erreur:', error);
                    showNotification(`❌ Erreur: ${error.message}`, 'error');
                }

                input.remove();
            };

            input.click();

        } catch (error) {
            console.error('[États Financiers] Erreur import:', error);
            showNotification(`❌ Erreur: ${error.message}`, 'error');
        }
    }

    /**
     * Lit un fichier en base64
     */
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Affiche les résultats des États Financiers dans le chat
     */
    function displayEtatsFinanciersResults(result) {
        // Supprimer les anciens résultats
        const existing = document.querySelector('.etats-financiers-results');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.className = 'etats-financiers-results';
        container.style.cssText = 'margin: 20px; padding: 16px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 12px; border: 2px solid #dee2e6;';

        // Titre principal
        const title = document.createElement('h2');
        title.innerHTML = '📈 <strong>États Financiers SYSCOHADA Révisé</strong>';
        title.style.cssText = 'margin: 0 0 20px 0; color: #2c3e50; font-size: 20px; text-align: center; padding-bottom: 10px; border-bottom: 2px solid #3498db;';
        container.appendChild(title);

        // Créer les accordéons
        const accordionsHTML = buildEtatsFinanciersAccordions(result);
        const accordionsDiv = document.createElement('div');
        accordionsDiv.innerHTML = accordionsHTML;
        container.appendChild(accordionsDiv);

        // Insérer dans le chat
        const chatContainer = document.querySelector('.prose, [class*="chat-messages"], [class*="message-list"]');
        if (chatContainer) {
            chatContainer.appendChild(container);
        } else {
            // Fallback: insérer dans le body
            const mainContent = document.querySelector('main, .main-content, #app');
            if (mainContent) {
                mainContent.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
        }

        // Activer les accordéons
        setupAccordions(container);

        // Scroll vers les résultats
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Construit le HTML des accordéons
     */
    function buildEtatsFinanciersAccordions(result) {
        const formatMontant = (val) => new Intl.NumberFormat('fr-FR').format(Math.round(val || 0));
        let html = '';

        // BILAN ACTIF
        if (result.bilan_actif && result.bilan_actif.rubriques.length > 0) {
            html += buildAccordionSection('bilan', 'BILAN ACTIF', '🏦', result.bilan_actif, result.exercice_n, result.exercice_n1, formatMontant, '#27ae60');
        }

        // BILAN PASSIF
        if (result.bilan_passif && result.bilan_passif.rubriques.length > 0) {
            html += buildAccordionSection('bilan', 'BILAN PASSIF', '💰', result.bilan_passif, result.exercice_n, result.exercice_n1, formatMontant, '#2980b9');
        }

        // COMPTE DE RÉSULTAT
        if (result.compte_resultat) {
            html += buildCompteResultatAccordion(result.compte_resultat, result.exercice_n, result.exercice_n1, formatMontant);
        }

        if (!html) {
            html = '<div style="padding: 20px; text-align: center; color: #666;">⚠️ Aucune donnée trouvée. Vérifiez que votre Balance contient des comptes SYSCOHADA valides.</div>';
        }

        return html;
    }

    function buildAccordionSection(type, titre, icon, data, exN, exN1, formatMontant, color) {
        let tableRows = '';
        data.rubriques.forEach(r => {
            tableRows += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.code}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.libelle}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: 500;">${formatMontant(r.montant_n)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #666;">${formatMontant(r.montant_n1)}</td>
            </tr>`;
        });

        return `
            <div class="ef-accordion" data-ef-type="${type}" style="margin-bottom: 12px; border-radius: 8px; overflow: hidden; border: 1px solid #ddd;">
                <div class="ef-accordion-header" style="background: ${color}; color: white; padding: 14px 18px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600;">${icon} ${titre}</span>
                    <span class="ef-arrow" style="transition: transform 0.3s;">▼</span>
                </div>
                <div class="ef-accordion-content" style="display: none; background: white;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid ${color};">Code</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid ${color};">Libellé</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid ${color};">${exN}</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid ${color};">${exN1}</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                        <tfoot>
                            <tr style="background: ${color}15; font-weight: bold;">
                                <td colspan="2" style="padding: 10px;">TOTAL</td>
                                <td style="padding: 10px; text-align: right;">${formatMontant(data.total.n)}</td>
                                <td style="padding: 10px; text-align: right;">${formatMontant(data.total.n1)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>`;
    }

    function buildCompteResultatAccordion(cr, exN, exN1, formatMontant) {
        let produitsRows = '', chargesRows = '';

        if (cr.produits && cr.produits.rubriques) {
            cr.produits.rubriques.forEach(r => {
                produitsRows += `<tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.code}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.libelle}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #27ae60;">${formatMontant(r.montant_n)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #666;">${formatMontant(r.montant_n1)}</td>
                </tr>`;
            });
        }

        if (cr.charges && cr.charges.rubriques) {
            cr.charges.rubriques.forEach(r => {
                chargesRows += `<tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.code}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${r.libelle}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #e74c3c;">${formatMontant(r.montant_n)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #666;">${formatMontant(r.montant_n1)}</td>
                </tr>`;
            });
        }

        const resultatN = cr.resultat?.n || 0;
        const resultatN1 = cr.resultat?.n1 || 0;
        const resultatColor = resultatN >= 0 ? '#27ae60' : '#e74c3c';

        return `
            <div class="ef-accordion" data-ef-type="compte-resultat" style="margin-bottom: 12px; border-radius: 8px; overflow: hidden; border: 1px solid #ddd;">
                <div class="ef-accordion-header" style="background: #8e44ad; color: white; padding: 14px 18px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600;">📊 COMPTE DE RÉSULTAT</span>
                    <span class="ef-arrow" style="transition: transform 0.3s;">▼</span>
                </div>
                <div class="ef-accordion-content" style="display: none; background: white;">
                    <div style="padding: 16px;">
                        <h4 style="color: #27ae60; margin: 0 0 10px 0;">📈 PRODUITS</h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                            <thead><tr style="background: #f8f9fa;">
                                <th style="padding: 8px; text-align: left;">Code</th>
                                <th style="padding: 8px; text-align: left;">Libellé</th>
                                <th style="padding: 8px; text-align: right;">${exN}</th>
                                <th style="padding: 8px; text-align: right;">${exN1}</th>
                            </tr></thead>
                            <tbody>${produitsRows || '<tr><td colspan="4" style="padding: 8px; text-align: center; color: #999;">Aucun produit</td></tr>'}</tbody>
                            <tfoot><tr style="background: #d5f5e3; font-weight: bold;">
                                <td colspan="2" style="padding: 8px;">Total Produits</td>
                                <td style="padding: 8px; text-align: right;">${formatMontant(cr.produits?.total?.n || 0)}</td>
                                <td style="padding: 8px; text-align: right;">${formatMontant(cr.produits?.total?.n1 || 0)}</td>
                            </tr></tfoot>
                        </table>

                        <h4 style="color: #e74c3c; margin: 0 0 10px 0;">📉 CHARGES</h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                            <thead><tr style="background: #f8f9fa;">
                                <th style="padding: 8px; text-align: left;">Code</th>
                                <th style="padding: 8px; text-align: left;">Libellé</th>
                                <th style="padding: 8px; text-align: right;">${exN}</th>
                                <th style="padding: 8px; text-align: right;">${exN1}</th>
                            </tr></thead>
                            <tbody>${chargesRows || '<tr><td colspan="4" style="padding: 8px; text-align: center; color: #999;">Aucune charge</td></tr>'}</tbody>
                            <tfoot><tr style="background: #fadbd8; font-weight: bold;">
                                <td colspan="2" style="padding: 8px;">Total Charges</td>
                                <td style="padding: 8px; text-align: right;">${formatMontant(cr.charges?.total?.n || 0)}</td>
                                <td style="padding: 8px; text-align: right;">${formatMontant(cr.charges?.total?.n1 || 0)}</td>
                            </tr></tfoot>
                        </table>

                        <div style="background: linear-gradient(135deg, ${resultatColor}20, ${resultatColor}10); padding: 16px; border-radius: 8px; border-left: 4px solid ${resultatColor};">
                            <h4 style="margin: 0; color: ${resultatColor};">💎 RÉSULTAT NET</h4>
                            <div style="display: flex; justify-content: space-around; margin-top: 10px;">
                                <div style="text-align: center;">
                                    <div style="font-size: 12px; color: #666;">${exN}</div>
                                    <div style="font-size: 24px; font-weight: bold; color: ${resultatColor};">${formatMontant(resultatN)} FCFA</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 12px; color: #666;">${exN1}</div>
                                    <div style="font-size: 18px; color: #666;">${formatMontant(resultatN1)} FCFA</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    /**
     * Active les accordéons
     */
    function setupAccordions(container) {
        container.querySelectorAll('.ef-accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const arrow = header.querySelector('.ef-arrow');
                const isOpen = content.style.display !== 'none';

                if (isOpen) {
                    content.style.display = 'none';
                    arrow.style.transform = 'rotate(0deg)';
                } else {
                    content.style.display = 'block';
                    arrow.style.transform = 'rotate(180deg)';
                }
            });
        });
    }

    /**
     * Toggle l'affichage d'un type d'état financier
     */
    function toggleEtatFinancier(type) {
        const container = document.querySelector('.etats-financiers-results');
        if (!container) {
            showNotification('⚠️ Importez d\'abord une Balance Excel', 'warning');
            return;
        }

        const sections = container.querySelectorAll(`[data-ef-type="${type}"]`);
        sections.forEach(section => {
            const content = section.querySelector('.ef-accordion-content');
            const arrow = section.querySelector('.ef-arrow');
            if (content) {
                const isOpen = content.style.display !== 'none';
                content.style.display = isOpen ? 'none' : 'block';
                if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    }

    /**
     * Affiche une notification
     */
    function showNotification(message, type = 'info') {
        // Supprimer les anciennes notifications
        document.querySelectorAll('.demarrer-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'demarrer-notification';

        const colors = {
            info: '#3498db',
            success: '#27ae60',
            warning: '#f39c12',
            error: '#e74c3c'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ============================================================
    // CRÉATION DU BOUTON
    // ============================================================

    /**
     * Crée le bouton Démarrer
     */
    function createDemarrerButton() {
        const button = document.createElement('button');
        button.className = 'demarrer-btn';
        button.innerHTML = `${createPlayIcon()}<span>Démarrer</span>`;
        button.title = 'Menu Démarrer E-audit';

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (isMenuOpen) {
                hideMenu();
            } else {
                showMenu();
            }
        });

        return button;
    }

    /**
     * Insère le bouton dans l'interface
     */
    function insertButton() {
        // Chercher la zone des boutons (avant le bouton micro)
        const voiceButton = document.querySelector('button[class*="rounded-full"]');
        if (!voiceButton) {
            console.log('[Démarrer Menu] Bouton micro non trouvé, réessai...');
            return false;
        }

        // Chercher le container des options
        const optionsContainer = document.querySelector('.flex.flex-wrap.items-center.justify-center.gap-2');
        if (!optionsContainer) {
            console.log('[Démarrer Menu] Container des options non trouvé, réessai...');
            return false;
        }

        // Vérifier si le bouton existe déjà
        if (document.querySelector('.demarrer-btn')) {
            console.log('[Démarrer Menu] Bouton déjà présent');
            return true;
        }

        // Créer le bouton
        demarrerButton = createDemarrerButton();

        // Trouver le bouton micro pour insérer avant
        const micButton = optionsContainer.querySelector('button svg.w-4.h-4')?.closest('button');

        if (micButton) {
            // Insérer avant le bouton micro
            micButton.parentNode.insertBefore(demarrerButton, micButton);
        } else {
            // Sinon, ajouter au début
            optionsContainer.insertBefore(demarrerButton, optionsContainer.firstChild);
        }

        console.log('[Démarrer Menu] Bouton inséré avec succès');
        return true;
    }

    // ============================================================
    // INITIALISATION
    // ============================================================

    /**
     * Initialise le menu Démarrer
     */
    function init() {
        console.log('[Démarrer Menu] Initialisation...');

        // Injecter les styles
        injectStyles();

        // Essayer d'insérer le bouton
        if (!insertButton()) {
            // Réessayer après un délai
            setTimeout(() => {
                if (!insertButton()) {
                    // Observer les changements du DOM
                    const observer = new MutationObserver((mutations, obs) => {
                        if (insertButton()) {
                            obs.disconnect();
                        }
                    });

                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });

                    // Timeout de sécurité
                    setTimeout(() => observer.disconnect(), 30000);
                }
            }, 1000);
        }
    }

    // Démarrer l'initialisation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exposer l'API globale
    window.DemarrerMenu = {
        show: showMenu,
        hide: hideMenu,
        toggle: () => isMenuOpen ? hideMenu() : showMenu(),
        insertCommand: insertTextInChat,
        isOpen: () => isMenuOpen
    };

})();

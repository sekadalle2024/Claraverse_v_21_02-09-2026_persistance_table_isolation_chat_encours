/**
 * Lead SYSCOHADA Révisé - Sections Comptables
 * Expert-comptable diplômé et CAC - 30 ans d'expérience Afrique de l'Ouest
 * 
 * Ce module gère les leads par section comptable selon le plan SYSCOHADA révisé
 * - Comptes de Bilan (Classes 1-5)
 * - Comptes de Résultat (Classes 6-8)
 */

(function () {
    'use strict';

    // ==================== CONFIGURATION SYSCOHADA ====================

    const SYSCOHADA_SECTIONS = {
        // === COMPTES DE BILAN ===
        bilan: {
            // CLASSE 1 - CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES
            capitaux_propres: {
                id: 'capitaux_propres',
                title: '1. Capitaux Propres et Ressources Assimilées',
                icon: '🏛️',
                classe: 1,
                comptes: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
                description: 'Capital, réserves, report à nouveau, résultat, subventions, provisions réglementées',
                sous_sections: [
                    { prefix: '10', label: 'Capital' },
                    { prefix: '11', label: 'Réserves' },
                    { prefix: '12', label: 'Report à nouveau' },
                    { prefix: '13', label: 'Résultat net de l\'exercice' },
                    { prefix: '14', label: 'Subventions d\'investissement' },
                    { prefix: '15', label: 'Provisions réglementées' },
                    { prefix: '16', label: 'Emprunts et dettes assimilées' },
                    { prefix: '17', label: 'Dettes de crédit-bail' },
                    { prefix: '18', label: 'Dettes liées à des participations' },
                    { prefix: '19', label: 'Provisions financières pour risques' }
                ]
            },

            // CLASSE 2 - IMMOBILISATIONS
            immobilisations: {
                id: 'immobilisations',
                title: '2. Immobilisations',
                icon: '🏗️',
                classe: 2,
                comptes: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
                description: 'Charges immobilisées, immobilisations incorporelles, corporelles, financières',
                sous_sections: [
                    { prefix: '20', label: 'Charges immobilisées' },
                    { prefix: '21', label: 'Immobilisations incorporelles' },
                    { prefix: '22', label: 'Terrains' },
                    { prefix: '23', label: 'Bâtiments, installations' },
                    { prefix: '24', label: 'Matériel' },
                    { prefix: '25', label: 'Avances et acomptes sur immobilisations' },
                    { prefix: '26', label: 'Titres de participation' },
                    { prefix: '27', label: 'Autres immobilisations financières' },
                    { prefix: '28', label: 'Amortissements' },
                    { prefix: '29', label: 'Provisions pour dépréciation' }
                ]
            },

            // CLASSE 3 - STOCKS
            stocks: {
                id: 'stocks',
                title: '3. Stocks',
                icon: '📦',
                classe: 3,
                comptes: ['31', '32', '33', '34', '35', '36', '37', '38', '39'],
                description: 'Marchandises, matières premières, produits en cours, produits finis',
                sous_sections: [
                    { prefix: '31', label: 'Marchandises' },
                    { prefix: '32', label: 'Matières premières et fournitures' },
                    { prefix: '33', label: 'Autres approvisionnements' },
                    { prefix: '34', label: 'Produits en cours' },
                    { prefix: '35', label: 'Services en cours' },
                    { prefix: '36', label: 'Produits finis' },
                    { prefix: '37', label: 'Produits intermédiaires et résiduels' },
                    { prefix: '38', label: 'Stocks en cours de route' },
                    { prefix: '39', label: 'Dépréciations des stocks' }
                ]
            },

            // CLASSE 4 - TIERS
            tiers: {
                id: 'tiers',
                title: '4. Tiers (Créances et Dettes)',
                icon: '🤝',
                classe: 4,
                comptes: ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'],
                description: 'Fournisseurs, clients, personnel, État, associés, débiteurs/créditeurs divers',
                sous_sections: [
                    { prefix: '40', label: 'Fournisseurs et comptes rattachés' },
                    { prefix: '41', label: 'Clients et comptes rattachés' },
                    { prefix: '42', label: 'Personnel' },
                    { prefix: '43', label: 'Organismes sociaux' },
                    { prefix: '44', label: 'État et collectivités publiques' },
                    { prefix: '45', label: 'Organismes internationaux' },
                    { prefix: '46', label: 'Associés et groupe' },
                    { prefix: '47', label: 'Débiteurs et créditeurs divers' },
                    { prefix: '48', label: 'Créances et dettes HAO' },
                    { prefix: '49', label: 'Dépréciations et provisions' }
                ]
            },

            // CLASSE 5 - TRÉSORERIE
            tresorerie: {
                id: 'tresorerie',
                title: '5. Trésorerie',
                icon: '💰',
                classe: 5,
                comptes: ['50', '51', '52', '53', '54', '55', '56', '57', '58', '59'],
                description: 'Titres de placement, valeurs à encaisser, banques, caisse, régies',
                sous_sections: [
                    { prefix: '50', label: 'Titres de placement' },
                    { prefix: '51', label: 'Valeurs à encaisser' },
                    { prefix: '52', label: 'Banques' },
                    { prefix: '53', label: 'Établissements financiers' },
                    { prefix: '54', label: 'Instruments de trésorerie' },
                    { prefix: '55', label: 'Non utilisé' },
                    { prefix: '56', label: 'Banques, crédits de trésorerie' },
                    { prefix: '57', label: 'Caisse' },
                    { prefix: '58', label: 'Régies d\'avances et accréditifs' },
                    { prefix: '59', label: 'Dépréciations des titres de placement' }
                ]
            }
        },

        // === COMPTES DE RÉSULTAT ===
        resultat: {
            // CLASSE 6 - CHARGES DES ACTIVITÉS ORDINAIRES
            charges_exploitation: {
                id: 'charges_exploitation',
                title: '6. Charges des Activités Ordinaires',
                icon: '📉',
                classe: 6,
                comptes: ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'],
                description: 'Achats, transports, services extérieurs, impôts, charges de personnel, charges financières',
                sous_sections: [
                    { prefix: '60', label: 'Achats et variations de stocks' },
                    { prefix: '61', label: 'Transports' },
                    { prefix: '62', label: 'Services extérieurs A' },
                    { prefix: '63', label: 'Services extérieurs B' },
                    { prefix: '64', label: 'Impôts et taxes' },
                    { prefix: '65', label: 'Autres charges' },
                    { prefix: '66', label: 'Charges de personnel' },
                    { prefix: '67', label: 'Frais financiers et charges assimilées' },
                    { prefix: '68', label: 'Dotations aux amortissements' },
                    { prefix: '69', label: 'Dotations aux provisions' }
                ]
            },

            // CLASSE 7 - PRODUITS DES ACTIVITÉS ORDINAIRES
            produits_exploitation: {
                id: 'produits_exploitation',
                title: '7. Produits des Activités Ordinaires',
                icon: '📈',
                classe: 7,
                comptes: ['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'],
                description: 'Ventes, production stockée, subventions, autres produits, produits financiers',
                sous_sections: [
                    { prefix: '70', label: 'Ventes' },
                    { prefix: '71', label: 'Subventions d\'exploitation' },
                    { prefix: '72', label: 'Production immobilisée' },
                    { prefix: '73', label: 'Variations de stocks de produits' },
                    { prefix: '74', label: 'Produits accessoires' },
                    { prefix: '75', label: 'Autres produits' },
                    { prefix: '76', label: 'Produits financiers' },
                    { prefix: '77', label: 'Revenus financiers et produits assimilés' },
                    { prefix: '78', label: 'Transferts de charges' },
                    { prefix: '79', label: 'Reprises de provisions' }
                ]
            },

            // CLASSE 8 - AUTRES CHARGES ET PRODUITS (HAO)
            hao: {
                id: 'hao',
                title: '8. Charges et Produits HAO',
                icon: '⚡',
                classe: 8,
                comptes: ['81', '82', '83', '84', '85', '86', '87', '88', '89'],
                description: 'Valeurs comptables des cessions, produits des cessions, charges et produits exceptionnels',
                sous_sections: [
                    { prefix: '81', label: 'Valeurs comptables des cessions d\'immobilisations' },
                    { prefix: '82', label: 'Produits des cessions d\'immobilisations' },
                    { prefix: '83', label: 'Charges HAO' },
                    { prefix: '84', label: 'Produits HAO' },
                    { prefix: '85', label: 'Dotations HAO' },
                    { prefix: '86', label: 'Reprises HAO' },
                    { prefix: '87', label: 'Participation des travailleurs' },
                    { prefix: '88', label: 'Subventions d\'équilibre' },
                    { prefix: '89', label: 'Impôts sur le résultat' }
                ]
            }
        }
    };

    // ==================== SECTIONS DÉTAILLÉES POUR LEADS ====================

    const LEAD_SECTIONS_DETAIL = {
        // BILAN - ACTIF
        actif_immobilise: {
            id: 'actif_immobilise',
            title: 'Actif Immobilisé',
            icon: '🏢',
            type: 'bilan',
            nature: 'actif',
            prefixes: ['20', '21', '22', '23', '24', '25', '26', '27'],
            amortissements: ['28'],
            depreciations: ['29']
        },
        actif_circulant: {
            id: 'actif_circulant',
            title: 'Actif Circulant',
            icon: '🔄',
            type: 'bilan',
            nature: 'actif',
            prefixes: ['31', '32', '33', '34', '35', '36', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48'],
            depreciations: ['39', '49']
        },
        tresorerie_actif: {
            id: 'tresorerie_actif',
            title: 'Trésorerie Actif',
            icon: '💵',
            type: 'bilan',
            nature: 'actif',
            prefixes: ['50', '51', '52', '53', '54', '57', '58'],
            depreciations: ['59']
        },

        // BILAN - PASSIF
        capitaux_propres: {
            id: 'capitaux_propres',
            title: 'Capitaux Propres',
            icon: '🏛️',
            type: 'bilan',
            nature: 'passif',
            prefixes: ['10', '11', '12', '13', '14', '15']
        },
        dettes_financieres: {
            id: 'dettes_financieres',
            title: 'Dettes Financières',
            icon: '🏦',
            type: 'bilan',
            nature: 'passif',
            prefixes: ['16', '17', '18', '19']
        },
        dettes_fournisseurs: {
            id: 'dettes_fournisseurs',
            title: 'Dettes Fournisseurs',
            icon: '📋',
            type: 'bilan',
            nature: 'passif',
            prefixes: ['40']
        },
        dettes_fiscales_sociales: {
            id: 'dettes_fiscales_sociales',
            title: 'Dettes Fiscales et Sociales',
            icon: '🏛️',
            type: 'bilan',
            nature: 'passif',
            prefixes: ['42', '43', '44', '45']
        },
        autres_dettes: {
            id: 'autres_dettes',
            title: 'Autres Dettes',
            icon: '📝',
            type: 'bilan',
            nature: 'passif',
            prefixes: ['46', '47', '48']
        },
        tresorerie_passif: {
            id: 'tresorerie_passif',
            title: 'Trésorerie Passif',
            icon: '💳',
            type: 'bilan',
            nature: 'passif',
            prefixes: ['56']
        },

        // COMPTE DE RÉSULTAT - CHARGES
        achats_marchandises: {
            id: 'achats_marchandises',
            title: 'Achats et Variations de Stocks',
            icon: '🛒',
            type: 'resultat',
            nature: 'charge',
            prefixes: ['60']
        },
        transports: {
            id: 'transports',
            title: 'Transports',
            icon: '🚚',
            type: 'resultat',
            nature: 'charge',
            prefixes: ['61']
        },
        services_exterieurs_a: {
            id: 'services_exterieurs_a',
            title: 'Services Extérieurs A',
            icon: '🔧',
            type: 'resultat',
            nature: 'charge',
            prefixes: ['62'],
            detail: 'Sous-traitance, locations, entretien, assurances, études'
        },
        services_exterieurs_b: {
            id: 'services_exterieurs_b',
            title: 'Services Extérieurs B',
            icon: '📞',
            type: 'resultat',
            nature: 'charge',
            prefixes: ['63'],
            detail: 'Publicité, télécommunications, honoraires, frais de déplacement'
        },
        impots_taxes: {
            id: 'impots_taxes',
            title: 'Impôts et Taxes',
            icon: '🏛️',
            type: 'resultat',
            nature: 'charge',
            prefixes: ['64']
        },
        autres_charges: {
            id: 'autres_charges',
            title: 'Autres Charges',
            icon: '📊',
            type: 'resultat',
            nature: 'charge',
            prefixes: ['65']
        },
        charges_personnel: {
            id: 'charges_personnel',
            title: 'Charges de Personnel',
            icon: '👥',
            type: 'resultat',
            nature: 'charge',
            prefixes: ['66']
        },
        charges_financieres: {
            id: 'charges_financieres',
            title: 'Charges Financières',
            icon: '💹',
            type: 'resultat',
            nature: 'charge',
            prefixes: ['67']
        },
        dotations_amortissements: {
            id: 'dotations_amortissements',
            title: 'Dotations aux Amortissements',
            icon: '📉',
            type: 'resultat',
            nature: 'charge',
            prefixes: ['68']
        },
        dotations_provisions: {
            id: 'dotations_provisions',
            title: 'Dotations aux Provisions',
            icon: '🔒',
            type: 'resultat',
            nature: 'charge',
            prefixes: ['69']
        },

        // COMPTE DE RÉSULTAT - PRODUITS
        ventes: {
            id: 'ventes',
            title: 'Ventes',
            icon: '💰',
            type: 'resultat',
            nature: 'produit',
            prefixes: ['70']
        },
        subventions_exploitation: {
            id: 'subventions_exploitation',
            title: 'Subventions d\'Exploitation',
            icon: '🎁',
            type: 'resultat',
            nature: 'produit',
            prefixes: ['71']
        },
        production_immobilisee: {
            id: 'production_immobilisee',
            title: 'Production Immobilisée',
            icon: '🏭',
            type: 'resultat',
            nature: 'produit',
            prefixes: ['72']
        },
        variations_stocks_produits: {
            id: 'variations_stocks_produits',
            title: 'Variations de Stocks de Produits',
            icon: '📦',
            type: 'resultat',
            nature: 'produit',
            prefixes: ['73']
        },
        produits_accessoires: {
            id: 'produits_accessoires',
            title: 'Produits Accessoires',
            icon: '➕',
            type: 'resultat',
            nature: 'produit',
            prefixes: ['74']
        },
        autres_produits: {
            id: 'autres_produits',
            title: 'Autres Produits',
            icon: '📈',
            type: 'resultat',
            nature: 'produit',
            prefixes: ['75']
        },
        produits_financiers: {
            id: 'produits_financiers',
            title: 'Produits Financiers',
            icon: '💵',
            type: 'resultat',
            nature: 'produit',
            prefixes: ['76', '77']
        },
        transferts_charges: {
            id: 'transferts_charges',
            title: 'Transferts de Charges',
            icon: '🔄',
            type: 'resultat',
            nature: 'produit',
            prefixes: ['78']
        },
        reprises_provisions: {
            id: 'reprises_provisions',
            title: 'Reprises de Provisions',
            icon: '🔓',
            type: 'resultat',
            nature: 'produit',
            prefixes: ['79']
        },

        // HAO
        charges_hao: {
            id: 'charges_hao',
            title: 'Charges HAO',
            icon: '⚡',
            type: 'resultat',
            nature: 'charge',
            prefixes: ['81', '83', '85', '87', '89']
        },
        produits_hao: {
            id: 'produits_hao',
            title: 'Produits HAO',
            icon: '✨',
            type: 'resultat',
            nature: 'produit',
            prefixes: ['82', '84', '86', '88']
        }
    };

    // ==================== CLASSE PRINCIPALE ====================

    class LeadSYSCOHADAManager {
        constructor() {
            this.sections = SYSCOHADA_SECTIONS;
            this.leadSections = LEAD_SECTIONS_DETAIL;
            this.balanceData = null;
            this.initialized = false;
        }

        /**
         * Initialise le gestionnaire de leads SYSCOHADA
         */
        init() {
            if (this.initialized) return;
            console.log('📊 Initialisation Lead SYSCOHADA Manager');
            this.initialized = true;
        }

        /**
         * Filtre les comptes par section
         */
        filterAccountsBySection(accounts, sectionId) {
            const section = this.leadSections[sectionId];
            if (!section) return [];

            return accounts.filter(account => {
                const numCompte = String(account.Compte || account.compte || '');
                return section.prefixes.some(prefix => numCompte.startsWith(prefix));
            });
        }

        /**
         * Calcule les totaux pour une section
         */
        calculateSectionTotals(accounts) {
            return {
                solde_n: accounts.reduce((sum, a) => sum + (a.Solde_N || a.solde_n || 0), 0),
                solde_n_1: accounts.reduce((sum, a) => sum + (a.Solde_N_1 || a.solde_n_1 || 0), 0),
                ecart: accounts.reduce((sum, a) => sum + (a.Ecart || a.ecart || 0), 0),
                count: accounts.length
            };
        }

        /**
         * Génère le HTML pour une section de lead
         */
        generateSectionHTML(sectionId, accounts, sheetNames) {
            const section = this.leadSections[sectionId];
            if (!section) return '';

            const totals = this.calculateSectionTotals(accounts);
            const sheetN = sheetNames?.n || 'N';
            const sheetN1 = sheetNames?.n_1 || 'N-1';

            const ecartClass = totals.ecart >= 0 ? 'positive' : 'negative';
            const formatNumber = (x) => {
                try { return x.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
                catch { return String(x); }
            };

            let html = `
            <div class="lead-syscohada-section" data-section="${sectionId}">
                <div class="section-header" onclick="this.classList.toggle('active'); this.nextElementSibling.classList.toggle('active');">
                    <span>${section.icon} ${section.title} (${accounts.length} comptes)</span>
                    <span class="arrow">›</span>
                </div>
                <div class="section-content">
                    <div class="section-summary">
                        <span><strong>Total ${sheetN}:</strong> ${formatNumber(totals.solde_n)}</span>
                        <span><strong>Total ${sheetN1}:</strong> ${formatNumber(totals.solde_n_1)}</span>
                        <span class="${ecartClass}"><strong>Écart:</strong> ${formatNumber(totals.ecart)}</span>
                    </div>
                    <div class="section-table-wrapper">
                        <table class="lead-table">
                            <thead>
                                <tr>
                                    <th>Compte</th>
                                    <th>Intitulé</th>
                                    <th>Solde ${sheetN}</th>
                                    <th>Solde ${sheetN1}</th>
                                    <th>Écart</th>
                                    <th>Var %</th>
                                </tr>
                            </thead>
                            <tbody>`;

            accounts.forEach(account => {
                const ecart = account.Ecart || account.ecart || 0;
                const variation = account.Variation || account.variation || 0;
                const rowClass = ecart >= 0 ? 'positive' : 'negative';
                const varStr = isFinite(variation) ? `${variation.toFixed(2)}%` : 'N/A';

                html += `
                                <tr>
                                    <td>${account.Compte || account.compte || ''}</td>
                                    <td>${account.Intitule_N || account.intitule || ''}</td>
                                    <td class="number">${formatNumber(account.Solde_N || account.solde_n || 0)}</td>
                                    <td class="number">${formatNumber(account.Solde_N_1 || account.solde_n_1 || 0)}</td>
                                    <td class="number ${rowClass}">${formatNumber(ecart)}</td>
                                    <td class="number ${rowClass}">${varStr}</td>
                                </tr>`;
            });

            html += `
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <td colspan="2"><strong>TOTAL ${section.title}</strong></td>
                                    <td class="number"><strong>${formatNumber(totals.solde_n)}</strong></td>
                                    <td class="number"><strong>${formatNumber(totals.solde_n_1)}</strong></td>
                                    <td class="number ${ecartClass}"><strong>${formatNumber(totals.ecart)}</strong></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>`;

            return html;
        }

        /**
         * Génère le HTML complet avec tous les accordéons par section SYSCOHADA
         */
        generateFullAccordionHTML(results) {
            const commonAccounts = results.common_accounts || [];
            const sheetNames = results.totals?.sheet_names || { n: 'N', n_1: 'N-1' };

            // Styles CSS
            let html = this.getStyles();

            // Titre principal
            html += `
            <div class="lead-syscohada-container">
                <div class="lead-header">
                    <h2>📊 Lead par Section Comptable - SYSCOHADA Révisé</h2>
                    <p>Analyse comparative ${sheetNames.n} vs ${sheetNames.n_1}</p>
                </div>

                <!-- SECTION BILAN -->
                <div class="lead-category">
                    <div class="category-header bilan">
                        <span>🏛️ COMPTES DE BILAN</span>
                    </div>

                    <!-- ACTIF -->
                    <div class="subcategory">
                        <div class="subcategory-header actif">ACTIF</div>`;

            // Sections Actif
            ['actif_immobilise', 'actif_circulant', 'tresorerie_actif'].forEach(sectionId => {
                const sectionAccounts = this.filterAccountsBySection(commonAccounts, sectionId);
                if (sectionAccounts.length > 0) {
                    html += this.generateSectionHTML(sectionId, sectionAccounts, sheetNames);
                }
            });

            html += `
                    </div>

                    <!-- PASSIF -->
                    <div class="subcategory">
                        <div class="subcategory-header passif">PASSIF</div>`;

            // Sections Passif
            ['capitaux_propres', 'dettes_financieres', 'dettes_fournisseurs',
                'dettes_fiscales_sociales', 'autres_dettes', 'tresorerie_passif'].forEach(sectionId => {
                    const sectionAccounts = this.filterAccountsBySection(commonAccounts, sectionId);
                    if (sectionAccounts.length > 0) {
                        html += this.generateSectionHTML(sectionId, sectionAccounts, sheetNames);
                    }
                });

            html += `
                    </div>
                </div>

                <!-- SECTION COMPTE DE RÉSULTAT -->
                <div class="lead-category">
                    <div class="category-header resultat">
                        <span>📈 COMPTE DE RÉSULTAT</span>
                    </div>

                    <!-- CHARGES -->
                    <div class="subcategory">
                        <div class="subcategory-header charges">CHARGES</div>`;

            // Sections Charges
            ['achats_marchandises', 'transports', 'services_exterieurs_a', 'services_exterieurs_b',
                'impots_taxes', 'autres_charges', 'charges_personnel', 'charges_financieres',
                'dotations_amortissements', 'dotations_provisions', 'charges_hao'].forEach(sectionId => {
                    const sectionAccounts = this.filterAccountsBySection(commonAccounts, sectionId);
                    if (sectionAccounts.length > 0) {
                        html += this.generateSectionHTML(sectionId, sectionAccounts, sheetNames);
                    }
                });

            html += `
                    </div>

                    <!-- PRODUITS -->
                    <div class="subcategory">
                        <div class="subcategory-header produits">PRODUITS</div>`;

            // Sections Produits
            ['ventes', 'subventions_exploitation', 'production_immobilisee', 'variations_stocks_produits',
                'produits_accessoires', 'autres_produits', 'produits_financiers',
                'transferts_charges', 'reprises_provisions', 'produits_hao'].forEach(sectionId => {
                    const sectionAccounts = this.filterAccountsBySection(commonAccounts, sectionId);
                    if (sectionAccounts.length > 0) {
                        html += this.generateSectionHTML(sectionId, sectionAccounts, sheetNames);
                    }
                });

            html += `
                    </div>
                </div>
            </div>`;

            return html;
        }

        /**
         * Retourne les styles CSS pour les leads SYSCOHADA
         */
        getStyles() {
            return `
            <style>
            .lead-syscohada-container {
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                max-width: 100%;
                margin: 16px 0;
            }
            .lead-header {
                background: linear-gradient(135deg, #800020, #600018);
                color: white;
                padding: 20px;
                border-radius: 12px 12px 0 0;
                text-align: center;
            }
            .lead-header h2 { margin: 0 0 8px 0; font-size: 18px; }
            .lead-header p { margin: 0; opacity: 0.9; font-size: 14px; }

            .lead-category {
                margin-bottom: 16px;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                overflow: hidden;
            }
            .category-header {
                padding: 14px 18px;
                font-weight: 700;
                font-size: 15px;
                color: white;
            }
            .category-header.bilan { background: linear-gradient(135deg, #2c3e50, #34495e); }
            .category-header.resultat { background: linear-gradient(135deg, #27ae60, #2ecc71); }

            .subcategory { margin: 8px; }
            .subcategory-header {
                padding: 10px 16px;
                font-weight: 600;
                font-size: 14px;
                border-radius: 6px;
                margin-bottom: 8px;
            }
            .subcategory-header.actif { background: #e3f2fd; color: #1565c0; }
            .subcategory-header.passif { background: #fce4ec; color: #c2185b; }
            .subcategory-header.charges { background: #ffebee; color: #c62828; }
            .subcategory-header.produits { background: #e8f5e9; color: #2e7d32; }

            .lead-syscohada-section {
                margin: 8px 0;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                overflow: hidden;
            }
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: #f8f9fa;
                cursor: pointer;
                font-weight: 500;
                font-size: 13px;
                transition: background 0.2s;
            }
            .section-header:hover { background: #e9ecef; }
            .section-header.active { background: #dee2e6; }
            .section-header .arrow {
                transition: transform 0.3s;
                font-size: 14px;
            }
            .section-header.active .arrow { transform: rotate(90deg); }

            .section-content {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease-out;
                background: white;
            }
            .section-content.active { max-height: 3000px; }

            .section-summary {
                display: flex;
                gap: 24px;
                padding: 12px 16px;
                background: #f8f9fa;
                border-bottom: 1px solid #e0e0e0;
                font-size: 12px;
                flex-wrap: wrap;
            }
            .section-table-wrapper { overflow-x: auto; }

            .lead-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
            }
            .lead-table th {
                background: #343a40;
                color: white;
                padding: 8px 10px;
                text-align: left;
                font-weight: 600;
                white-space: nowrap;
            }
            .lead-table th:nth-child(n+3) { text-align: right; }
            .lead-table td {
                padding: 6px 10px;
                border-bottom: 1px solid #e9ecef;
            }
            .lead-table td.number { text-align: right; font-family: 'Consolas', monospace; }
            .lead-table tr:hover td { background: #f8f9fa; }
            .lead-table .total-row td {
                background: #e9ecef;
                font-weight: 600;
                border-top: 2px solid #343a40;
            }

            .positive { color: #28a745; }
            .negative { color: #dc3545; }
            </style>`;
        }
    }

    // ==================== EXPORT GLOBAL ====================
    window.LeadSYSCOHADAManager = LeadSYSCOHADAManager;
    window.SYSCOHADA_SECTIONS = SYSCOHADA_SECTIONS;
    window.LEAD_SECTIONS_DETAIL = LEAD_SECTIONS_DETAIL;

    console.log('✅ Lead SYSCOHADA Module chargé');
})();

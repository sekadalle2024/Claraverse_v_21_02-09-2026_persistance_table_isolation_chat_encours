/**
 * Handler pour les accordéons des 16 états de contrôle
 * Ce script gère les événements de clic sur les sections accordéon
 * Date: 05 Avril 2026
 */

(function() {
    'use strict';
    
    console.log('🔧 EtatsControleAccordeonHandler: Initialisation...');
    
    /**
     * Fonction pour gérer le toggle d'une section accordéon
     */
    function toggleSection(header) {
        if (!header) return;
        
        const section = header.parentElement;
        if (!section) return;
        
        // Toggle la classe 'active' sur la section
        section.classList.toggle('active');
        
        console.log('✅ Section toggled:', section.classList.contains('active') ? 'Ouvert' : 'Fermé');
    }
    
    // Exposer toggleSection globalement pour les attributs onclick du HTML backend
    window.toggleSection = toggleSection;
    
    /**
     * Initialise les event listeners sur tous les accordéons
     */
    function initializeAccordeons() {
        // Sélectionner tous les headers d'accordéon des états de contrôle
        const headers = document.querySelectorAll('.section-header');
        
        console.log(`📊 Nombre de sections trouvées: ${headers.length}`);
        
        if (headers.length === 0) {
            console.warn('⚠️ Aucune section .section-header trouvée');
            return;
        }
        
        // Attacher les event listeners
        headers.forEach((header, index) => {
            // Supprimer l'attribut onclick s'il existe (conflit avec event listener)
            if (header.hasAttribute('onclick')) {
                header.removeAttribute('onclick');
                console.log(`🔧 Attribut onclick supprimé de la section ${index + 1}`);
            }
            
            // Vérifier si le listener est déjà attaché
            if (header.dataset.listenerAttached === 'true') {
                console.log(`⏭️ Listener déjà attaché sur section ${index + 1}`);
                return;
            }
            
            // Ajouter le nouveau listener
            header.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🖱️ Clic détecté sur section ${index + 1}`);
                toggleSection(this);
            });
            
            // Marquer comme ayant un listener
            header.dataset.listenerAttached = 'true';
            
            console.log(`✅ Listener ajouté sur section ${index + 1}`);
        });
        
        console.log('🎉 Tous les accordéons sont initialisés!');
    }
    
    /**
     * Fonction pour réinitialiser les accordéons
     * Appelée quand le contenu est mis à jour
     */
    function reinitializeAccordeons() {
        console.log('🔄 Réinitialisation des accordéons...');
        initializeAccordeons();
    }
    
    // Initialiser au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAccordeons);
    } else {
        initializeAccordeons();
    }
    
    // Observer les changements dans le DOM pour réinitialiser si nécessaire
    let reinitTimeout = null;
    const observer = new MutationObserver(function(mutations) {
        let shouldReinit = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                // Vérifier si des sections accordéon ont été ajoutées
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('section')) {
                            console.log('🆕 Nouvelle section détectée');
                            shouldReinit = true;
                        } else if (node.querySelector && node.querySelector('.section')) {
                            console.log('🆕 Nouvelles sections détectées dans le conteneur');
                            shouldReinit = true;
                        } else if (node.classList && node.classList.contains('section-header')) {
                            console.log('🆕 Nouveau header détecté');
                            shouldReinit = true;
                        }
                    }
                });
            }
        });
        
        // Réinitialiser avec un délai pour éviter les appels multiples
        if (shouldReinit) {
            if (reinitTimeout) {
                clearTimeout(reinitTimeout);
            }
            reinitTimeout = setTimeout(function() {
                console.log('🔄 Réinitialisation des accordéons après détection de changements...');
                reinitializeAccordeons();
            }, 500); // Délai de 500ms
        }
    });
    
    // Observer le body pour détecter les ajouts de contenu
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Exposer la fonction de réinitialisation globalement
    window.reinitializeEtatsControleAccordeons = reinitializeAccordeons;
    
    console.log('✅ EtatsControleAccordeonHandler: Prêt!');
})();

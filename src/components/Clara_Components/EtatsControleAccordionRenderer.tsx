import React, { useState } from 'react';
import './EtatsControleAccordionRenderer.css';

interface EtatControlePoste {
  ref: string;
  libelle: string;
  montant_n: number;
  montant_n1: number;
}

interface EtatControle {
  titre: string;
  postes: EtatControlePoste[];
}

interface EtatsControleData {
  etat_controle_bilan_actif?: EtatControle;
  etat_controle_bilan_passif?: EtatControle;
  etat_controle_compte_resultat?: EtatControle;
  etat_controle_tft?: EtatControle;
  etat_controle_sens_comptes?: EtatControle;
  etat_equilibre_bilan?: EtatControle;
  etat_controle_comptes_non_integres?: any;
  etat_controle_sens_anormal?: any;
}

interface Props {
  etatsControle: EtatsControleData;
}

const EtatsControleAccordionRenderer: React.FC<Props> = ({ etatsControle }) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['etat_controle_bilan_actif']));

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allSections = Object.keys(etatsControle);
    setOpenSections(new Set(allSections));
  };

  const collapseAll = () => {
    setOpenSections(new Set());
  };

  const formatMontant = (montant: number): string => {
    if (Math.abs(montant) < 0.01) {
      return '-';
    }
    return montant.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/,/g, ' ');
  };

  const renderEtatControleSection = (key: string, etat: EtatControle, icon: string) => {
    const isOpen = openSections.has(key);
    
    return (
      <div key={key} className={`etats-controle-section ${isOpen ? 'active' : ''}`}>
        <div className="section-header-ec" onClick={() => toggleSection(key)}>
          <span>{icon} {etat.titre}</span>
          <span className="arrow">›</span>
        </div>
        <div className={`section-content-ec ${isOpen ? 'active' : ''}`}>
          <table className="etats-controle-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>REF</th>
                <th style={{ width: 'auto' }}>LIBELLÉS</th>
                <th style={{ width: '150px', textAlign: 'right' }}>EXERCICE N</th>
                <th style={{ width: '150px', textAlign: 'right' }}>EXERCICE N-1</th>
              </tr>
            </thead>
            <tbody>
              {etat.postes.map((poste, idx) => {
                const isTotal = poste.libelle.includes('Total') || 
                               poste.libelle.includes('Équilibre') || 
                               poste.libelle.includes('Variation');
                return (
                  <tr key={idx} className={isTotal ? 'total-row' : ''}>
                    <td className="ref-cell">{poste.ref}</td>
                    <td className="libelle-cell">{poste.libelle}</td>
                    <td className="montant-cell">{formatMontant(poste.montant_n)}</td>
                    <td className="montant-cell">{formatMontant(poste.montant_n1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="etats-controle-container">
      <div className="etats-controle-header">
        <h2>🔍 États de Contrôle</h2>
        <p>Contrôles exhaustifs des états financiers SYSCOHADA Révisé</p>
      </div>

      <div className="controls-ec">
        <button className="btn-ec" onClick={expandAll}>📂 Tout Ouvrir</button>
        <button className="btn-ec" onClick={collapseAll}>📁 Tout Fermer</button>
      </div>

      {etatsControle.etat_controle_bilan_actif && 
        renderEtatControleSection('etat_controle_bilan_actif', etatsControle.etat_controle_bilan_actif, '🏢')}
      
      {etatsControle.etat_controle_bilan_passif && 
        renderEtatControleSection('etat_controle_bilan_passif', etatsControle.etat_controle_bilan_passif, '🏛️')}
      
      {etatsControle.etat_controle_compte_resultat && 
        renderEtatControleSection('etat_controle_compte_resultat', etatsControle.etat_controle_compte_resultat, '💰')}
      
      {etatsControle.etat_controle_tft && 
        renderEtatControleSection('etat_controle_tft', etatsControle.etat_controle_tft, '💧')}
      
      {etatsControle.etat_controle_sens_comptes && 
        renderEtatControleSection('etat_controle_sens_comptes', etatsControle.etat_controle_sens_comptes, '🔄')}
      
      {etatsControle.etat_equilibre_bilan && 
        renderEtatControleSection('etat_equilibre_bilan', etatsControle.etat_equilibre_bilan, '⚖️')}
    </div>
  );
};

export default EtatsControleAccordionRenderer;

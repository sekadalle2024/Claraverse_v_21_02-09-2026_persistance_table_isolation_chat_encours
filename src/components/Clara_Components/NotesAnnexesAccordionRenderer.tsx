import React, { useState } from 'react';
import './NotesAnnexesAccordionRenderer.css';

interface NoteAnnexeLigne {
  [key: string]: any;
}

interface NoteAnnexe {
  titre: string;
  numero: string;
  colonnes: string[];
  lignes: NoteAnnexeLigne[][];
  html?: string;
}

interface NotesAnnexesData {
  [key: string]: NoteAnnexe;
}

interface Props {
  notesAnnexes: NotesAnnexesData;
  loading?: boolean;
  error?: string;
}

const NotesAnnexesAccordionRenderer: React.FC<Props> = ({ notesAnnexes, loading = false, error }) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['Note_3A']));

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
    const allSections = Object.keys(notesAnnexes);
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

  const renderNoteSection = (key: string, note: NoteAnnexe, icon: string) => {
    const isOpen = openSections.has(key);
    
    return (
      <div key={key} className={`notes-annexes-section ${isOpen ? 'active' : ''}`}>
        <div className="section-header-na" onClick={() => toggleSection(key)}>
          <span>{icon} {note.titre}</span>
          <span className="arrow">›</span>
        </div>
        <div className={`section-content-na ${isOpen ? 'active' : ''}`}>
          {note.html ? (
            // Si le HTML est fourni, l'afficher directement
            <div 
              className="note-html-content"
              dangerouslySetInnerHTML={{ __html: note.html }}
            />
          ) : (
            // Sinon, générer un tableau à partir des données
            <table className="notes-annexes-table">
              <thead>
                <tr>
                  {note.colonnes.map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {note.lignes.map((ligne, idx) => {
                  const isTotal = ligne[0]?.toString().toLowerCase().includes('total');
                  return (
                    <tr key={idx} className={isTotal ? 'total-row' : ''}>
                      {ligne.map((cell, cellIdx) => {
                        const isNumeric = typeof cell === 'number';
                        return (
                          <td 
                            key={cellIdx}
                            className={isNumeric ? 'montant-cell' : 'libelle-cell'}
                          >
                            {isNumeric ? formatMontant(cell) : cell}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // Afficher l'état de chargement
  if (loading) {
    return (
      <div className="notes-annexes-container">
        <div className="notes-annexes-header">
          <h2>📊 Notes Annexes SYSCOHADA</h2>
          <p>Calcul des 33 notes annexes en cours...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Traitement des balances et calcul des notes...</p>
          <p className="loading-note">Cela peut prendre jusqu'à 30 secondes</p>
        </div>
      </div>
    );
  }

  // Afficher l'erreur
  if (error) {
    return (
      <div className="notes-annexes-container">
        <div className="notes-annexes-header">
          <h2>📊 Notes Annexes SYSCOHADA</h2>
          <p>Erreur lors du calcul des notes annexes</p>
        </div>
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Afficher les notes
  const notesList = Object.entries(notesAnnexes);
  
  if (notesList.length === 0) {
    return (
      <div className="notes-annexes-container">
        <div className="notes-annexes-header">
          <h2>📊 Notes Annexes SYSCOHADA</h2>
          <p>Aucune note disponible</p>
        </div>
      </div>
    );
  }

  // Icônes pour les différentes catégories de notes
  const getIcon = (noteKey: string): string => {
    if (noteKey.includes('3')) return '🏢'; // Immobilisations
    if (noteKey.includes('4') || noteKey.includes('5')) return '📦'; // Stocks et créances
    if (noteKey.includes('6') || noteKey.includes('7')) return '💰'; // Trésorerie
    if (noteKey.includes('8') || noteKey.includes('9')) return '🏛️'; // Capitaux propres
    if (noteKey.includes('10') || noteKey.includes('11')) return '📊'; // Provisions
    if (noteKey.includes('12') || noteKey.includes('13')) return '💳'; // Dettes
    return '📄'; // Autres
  };

  return (
    <div className="notes-annexes-container">
      <div className="notes-annexes-header">
        <h2>📊 Notes Annexes SYSCOHADA Révisé</h2>
        <p>33 notes annexes calculées automatiquement à partir des balances</p>
      </div>

      <div className="controls-na">
        <button className="btn-na" onClick={expandAll}>📂 Tout Ouvrir</button>
        <button className="btn-na" onClick={collapseAll}>📁 Tout Fermer</button>
        <span className="notes-count">{notesList.length} notes disponibles</span>
      </div>

      <div className="notes-list">
        {notesList.map(([key, note]) => 
          renderNoteSection(key, note, getIcon(key))
        )}
      </div>
    </div>
  );
};

export default NotesAnnexesAccordionRenderer;

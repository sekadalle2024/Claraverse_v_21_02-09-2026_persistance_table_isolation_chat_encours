/**
 * XRefSidebar Component
 * 
 * Barre latérale pour afficher les cross-références documentaires
 * Permet de visualiser et rechercher les documents liés aux papiers de travail d'audit
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  X,
  ExternalLink,
  Download,
  Eye,
  Filter,
  FolderOpen,
  Calendar,
  Tag
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface XRefDocument {
  crossRef: string;
  document: string;
  client?: string;
  exercice?: string;
  cycle?: string;
  dateUpload?: string;
  fileId?: string;
  fileUrl?: string;
}

interface XRefSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documents: XRefDocument[];
  title?: string;
  onDocumentClick?: (doc: XRefDocument) => void;
  onDocumentPreview?: (doc: XRefDocument) => void;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

const XRefSidebar: React.FC<XRefSidebarProps> = ({
  isOpen,
  onClose,
  documents,
  title = 'Cross-Références Documentaires',
  onDocumentClick,
  onDocumentPreview
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [filteredDocuments, setFilteredDocuments] = useState<XRefDocument[]>(documents);

  // Extraire les cycles uniques
  const cycles = ['all', ...Array.from(new Set(documents.map(doc => doc.cycle).filter(Boolean)))];

  // Filtrer les documents
  useEffect(() => {
    let filtered = documents;

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.crossRef.toLowerCase().includes(term) ||
        doc.document.toLowerCase().includes(term) ||
        doc.client?.toLowerCase().includes(term) ||
        doc.cycle?.toLowerCase().includes(term)
      );
    }

    // Filtre par cycle
    if (selectedCycle !== 'all') {
      filtered = filtered.filter(doc => doc.cycle === selectedCycle);
    }

    setFilteredDocuments(filtered);
  }, [searchTerm, selectedCycle, documents]);

  // Gérer le clic sur un document
  const handleDocumentClick = (doc: XRefDocument) => {
    if (onDocumentClick) {
      onDocumentClick(doc);
    } else {
      // Comportement par défaut: afficher une notification
      console.log('📄 Document sélectionné:', doc);
    }
  };

  // Gérer la prévisualisation
  const handlePreview = (doc: XRefDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDocumentPreview) {
      onDocumentPreview(doc);
    } else if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    }
  };

  // Gérer le téléchargement
  const handleDownload = (doc: XRefDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc.fileUrl) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = `${doc.crossRef}-${doc.document}`;
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-900 to-red-800">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white" />
            <h2 className="text-lg font-semibold text-white">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par index ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Cycle Filter */}
          {cycles.length > 1 && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="all">Tous les cycles</option>
                {cycles.filter(c => c !== 'all').map(cycle => (
                  <option key={cycle} value={cycle}>{cycle}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Document Count */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''}
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">
                Aucun document trouvé
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {searchTerm ? 'Essayez une autre recherche' : 'Aucun document disponible'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredDocuments.map((doc, index) => (
                <div
                  key={`${doc.crossRef}-${index}`}
                  onClick={() => handleDocumentClick(doc)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                >
                  {/* Document Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {doc.crossRef}
                        </span>
                        {doc.cycle && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {doc.cycle}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                        {doc.document}
                      </h3>
                    </div>
                  </div>

                  {/* Document Metadata */}
                  {(doc.client || doc.exercice || doc.dateUpload) && (
                    <div className="space-y-1 mb-3">
                      {doc.client && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Tag className="w-3 h-3" />
                          <span>Client: {doc.client}</span>
                        </div>
                      )}
                      {doc.exercice && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>Exercice: {doc.exercice}</span>
                        </div>
                      )}
                      {doc.dateUpload && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>Uploadé: {new Date(doc.dateUpload).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.fileUrl && (
                      <>
                        <button
                          onClick={(e) => handlePreview(doc, e)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          title="Prévisualiser"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Voir</span>
                        </button>
                        <button
                          onClick={(e) => handleDownload(doc, e)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                          title="Télécharger"
                        >
                          <Download className="w-3 h-3" />
                          <span>Télécharger</span>
                        </button>
                      </>
                    )}
                    {doc.fileId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://drive.google.com/file/d/${doc.fileId}/view`, '_blank');
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Ouvrir dans Google Drive"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Drive</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p>Papiers de travail d'audit</p>
            <p className="mt-1">
              {documents.length} document{documents.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
      </div>

      {/* Styles pour l'animation */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default XRefSidebar;

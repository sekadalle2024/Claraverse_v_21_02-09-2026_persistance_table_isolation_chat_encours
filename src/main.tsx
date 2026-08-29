import { StrictMode } from 'react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { setupGlobalErrorHandlers } from './utils/globalErrorHandler.ts';
import './utils/errorTestHelpers.ts'; // Import to make console helpers available
import './index.css';
import './styles/animations.css'; // Import animations
import './services/menuIntegration'; // Import menu integration service
import './services/autoRestore'; // Import auto-restore service
import { initializeTheme, applyTheme } from './utils/themeManager';
import { initializeScreenMode } from './utils/screenManager';
import EchantillonnageAccordionRenderer from './components/Clara_Components/EchantillonnageAccordionRenderer';

// ─── Expose React accordion mount for EchantillonnageAutoTrigger.js ───────────
(window as any).__CLARAVERSE_MOUNT_ECHANTILLONNAGE__ = (
  mountNode: HTMLElement,
  data: any,
  isDark?: boolean
) => {
  try {
    const root = createRoot(mountNode);
    root.render(
      React.createElement(EchantillonnageAccordionRenderer, { data, isDark: isDark ?? false })
    );
    console.log('✅ [Échantillonnage] Composant React accordéon monté dans le DOM');
  } catch (err) {
    console.error('❌ [Échantillonnage] Erreur montage React:', err);
  }
};

// FORCE remove dark class immediately
document.documentElement.classList.remove('dark');

// Check if this is the first load (no theme saved)
const isFirstLoad = !localStorage.getItem('e-audit-theme');

if (isFirstLoad) {
  console.log('🎨 Main: First load detected, applying gray theme in light mode');
  // Force gray theme in light mode for first load
  applyTheme('gray', false);
} else {
  // Initialize theme from saved preferences
  initializeTheme();
}

// FORCE remove dark class again after a short delay
setTimeout(() => {
  console.log('🎨 Main: Force removing dark class');
  document.documentElement.classList.remove('dark');
  // Re-apply gray theme in light mode
  applyTheme('gray', false);
}, 100);

// Setup global error handlers for unhandled promise rejections and JS errors
setupGlobalErrorHandlers();

// Initialize screen mode (wide/normal) from saved preferences
// Delayed to ensure DOM is ready and tables have been rendered
setTimeout(() => {
  initializeScreenMode();
}, 500);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Signal to electron main process that React app is ready
// Use setTimeout to ensure the app is fully rendered and initialized
setTimeout(() => {
  if (window.electron?.sendReactReady) {
    console.log('Signaling that React app is ready');
    window.electron.sendReactReady();
  }
}, 1000); // Give React time to fully render

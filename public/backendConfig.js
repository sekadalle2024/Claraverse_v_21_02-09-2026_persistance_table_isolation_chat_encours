/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║           CLARAVERSE — BACKEND CONFIGURATION                            ║
 * ║   Détection automatique : Local DEV ↔ Production Cloud (Zeabur)        ║
 * ║   Ce fichier DOIT être chargé EN PREMIER dans index.html               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Usage dans les scripts :
 *   fetch((window.CLARA_BACKEND_URL || 'http://localhost:5000') + '/mon-endpoint')
 */

(function () {
  'use strict';

  // Détecter l'environnement
  const hostname = window.location.hostname;
  const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';

  // URLs de base
  const LOCAL_BACKEND   = 'http://localhost:5000';
  const CLOUD_BACKEND   = 'https://pybackend.zeabur.app';
  const LOCAL_FRONTEND  = 'http://localhost:5173';
  const CLOUD_FRONTEND  = 'https://prclaravi.zeabur.app';

  // Exposition globale
  window.CLARA_BACKEND_URL  = isLocalDev ? LOCAL_BACKEND  : CLOUD_BACKEND;
  window.CLARA_FRONTEND_URL = isLocalDev ? LOCAL_FRONTEND : CLOUD_FRONTEND;
  window.CLARA_IS_LOCAL_DEV = isLocalDev;

  // Log de diagnostic (toujours visible dans la console)
  const env    = isLocalDev ? '🖥️  LOCAL DEV' : '☁️  PRODUCTION CLOUD';
  const color  = isLocalDev ? '#f59e0b'        : '#10b981';

  console.log(
    '%c🔧 CLARAVERSE — BACKEND CONFIG\n' +
    `%c🌍 Environnement : ${env}\n` +
    `🔙 Backend URL   : ${window.CLARA_BACKEND_URL}\n` +
    `🌐 Frontend URL  : ${window.CLARA_FRONTEND_URL}`,
    'font-weight:bold; font-size:13px; color:#6366f1;',
    `color:${color}; font-size:12px;`
  );
})();

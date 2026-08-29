'use strict';
/* Content script — F11 toggle fullscreen uniquement */
document.addEventListener('keydown', (e) => {
  if (e.key === 'F11') {
    e.preventDefault();
    if (document.fullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document).catch(() => {});
    } else {
      const el = document.documentElement;
      (el.requestFullscreen || el.webkitRequestFullscreen).call(el).catch(() => {});
    }
  }
}, true);

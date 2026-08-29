'use strict';

const btnFullscreen  = document.getElementById('btnFullscreen');
const btnExit        = document.getElementById('btnExit');
const btnRegion      = document.getElementById('btnRegion');
const btnCaptureFull = document.getElementById('btnCaptureFull');
const statusDot      = document.getElementById('statusDot');
const statusText     = document.getElementById('statusText');
const statusBadge    = document.getElementById('statusBadge');
const toast          = document.getElementById('toast');

let toastTimer = null;

/* ── Utils ──────────────────────────────────────────────────── */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function addRipple(btn, e) {
  const rect   = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  ripple.style.left = (e.clientX - rect.left) + 'px';
  ripple.style.top  = (e.clientY - rect.top)  + 'px';
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

function setStatus(isFS) {
  statusDot.classList.toggle('active', isFS);
  statusText.classList.toggle('active', isFS);
  statusText.textContent  = isFS ? 'Plein écran actif' : 'Mode normal';
  statusBadge.classList.toggle('active', isFS);
  statusBadge.textContent = isFS ? 'ACTIF' : 'INACTIF';
}

/* ── Current status ─────────────────────────────────────────── */
async function refreshStatus() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => !!document.fullscreenElement,
    });
    setStatus(result);
  } catch (_) {}
}

/* ── Fullscreen ─────────────────────────────────────────────── */
btnFullscreen.addEventListener('click', async (e) => {
  addRipple(btnFullscreen, e);
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const el = document.documentElement;
        (el.requestFullscreen || el.webkitRequestFullscreen).call(el).catch(() => {});
      },
    });
    setStatus(true);
    showToast('✦ Plein écran activé');
  } catch (_) { showToast('⚠ Page restreinte'); }
});

btnExit.addEventListener('click', async (e) => {
  addRipple(btnExit, e);
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (document.fullscreenElement)
          (document.exitFullscreen || document.webkitExitFullscreen).call(document).catch(() => {});
      },
    });
    setStatus(false);
    showToast('↩ Mode normal restauré');
  } catch (_) { showToast('⚠ Page restreinte'); }
});

/* ── Screenshot: select region ──────────────────────────────── */
btnRegion.addEventListener('click', async (e) => {
  addRipple(btnRegion, e);
  btnRegion.classList.add('pulsing');
  setTimeout(() => btnRegion.classList.remove('pulsing'), 500);

  try {
    await chrome.runtime.sendMessage({ action: 'startRegionCapture' });
    showToast('🎯 Dessinez la zone à capturer');
    window.close(); // ferme le popup pour laisser la page visible
  } catch (_) { showToast('⚠ Impossible d\'injecter'); }
});

/* ── Screenshot: full page ──────────────────────────────────── */
btnCaptureFull.addEventListener('click', async (e) => {
  addRipple(btnCaptureFull, e);
  try {
    await chrome.runtime.sendMessage({ action: 'captureFullPage' });
    showToast('📸 Capture en cours…');
    setTimeout(() => window.close(), 600);
  } catch (_) { showToast('⚠ Erreur lors de la capture'); }
});

refreshStatus();

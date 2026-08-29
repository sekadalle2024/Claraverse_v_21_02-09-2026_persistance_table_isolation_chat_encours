'use strict';

/* ══════════════════════════════════════════════════════════════
   FullScreen Pro v8
   FIX DÉFINITIF SÉLECTION :
   - Shadow DOM fermé → aucun style de la page ne peut interférer
   - Attaché sur <html> (documentElement) et non <body>
   - mousemove/mouseup sur document en phase capture
   - Pas de CSS externe injecté séparément
══════════════════════════════════════════════════════════════ */

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({ id:'fsp-parent',         title:'📸 FullScreen Pro',                 contexts:['page','image','link','selection'] });
  chrome.contextMenus.create({ id:'fsp-capture-full',   parentId:'fsp-parent', title:'🖥️  Capturer la page entière',    contexts:['page','image','link','selection'] });
  chrome.contextMenus.create({ id:'fsp-capture-region', parentId:'fsp-parent', title:'✂️  Sélectionner une zone',        contexts:['page','image','link','selection'] });
  chrome.contextMenus.create({ id:'fsp-sep',            parentId:'fsp-parent', type:'separator',                          contexts:['page','image','link','selection'] });
  chrome.contextMenus.create({ id:'fsp-fullscreen',     parentId:'fsp-parent', title:'⛶  Basculer le plein écran (F11)', contexts:['page','image','link','selection'] });
  chrome.contextMenus.create({ id:'fsp-sep2',           parentId:'fsp-parent', type:'separator',                          contexts:['page','image','link','selection'] });
  chrome.contextMenus.create({ id:'fsp-widescreen',     parentId:'fsp-parent', title:'🖥️  Ajuster largeur [wide screen]', contexts:['page','image','link','selection'] });
  chrome.contextMenus.create({ id:'fsp-normalscreen',    parentId:'fsp-parent', title:'🖥️  Largeur normale [normal screen]', contexts:['page','image','link','selection'] });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id:'fsp-parent',         title:'📸 FullScreen Pro',                 contexts:['page','image','link','selection'] });
    chrome.contextMenus.create({ id:'fsp-capture-full',   parentId:'fsp-parent', title:'🖥️  Capturer la page entière',    contexts:['page','image','link','selection'] });
    chrome.contextMenus.create({ id:'fsp-capture-region', parentId:'fsp-parent', title:'✂️  Sélectionner une zone',        contexts:['page','image','link','selection'] });
    chrome.contextMenus.create({ id:'fsp-sep',            parentId:'fsp-parent', type:'separator',                          contexts:['page','image','link','selection'] });
    chrome.contextMenus.create({ id:'fsp-fullscreen',     parentId:'fsp-parent', title:'⛶  Basculer le plein écran (F11)', contexts:['page','image','link','selection'] });
    chrome.contextMenus.create({ id:'fsp-sep2',           parentId:'fsp-parent', type:'separator',                          contexts:['page','image','link','selection'] });
    chrome.contextMenus.create({ id:'fsp-widescreen',     parentId:'fsp-parent', title:'🖥️  Ajuster largeur [wide screen]', contexts:['page','image','link','selection'] });
    chrome.contextMenus.create({ id:'fsp-normalscreen',    parentId:'fsp-parent', title:'🖥️  Largeur normale [normal screen]', contexts:['page','image','link','selection'] });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId === 'fsp-capture-full')   await captureFullPage(tab);
  if (info.menuItemId === 'fsp-capture-region') await injectSelectionUI(tab.id);
  if (info.menuItemId === 'fsp-fullscreen')     await chrome.scripting.executeScript({ target:{tabId:tab.id}, func:toggleFullscreen });
  if (info.menuItemId === 'fsp-widescreen')     await chrome.scripting.executeScript({ target:{tabId:tab.id}, func:adjustToWideScreen });
  if (info.menuItemId === 'fsp-normalscreen')    await chrome.scripting.executeScript({ target:{tabId:tab.id}, func:restoreNormalScreen });
});

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
  if (!tab?.id) return;
  if (command === 'screenshot-region') await injectSelectionUI(tab.id);
  if (command === 'screenshot-full')   await captureFullPage(tab);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
    if (msg.action === 'startRegionCapture') { if (tab?.id) await injectSelectionUI(tab.id); sendResponse({ok:true}); }
    if (msg.action === 'captureFullPage')    { if (tab)     await captureFullPage(tab);       sendResponse({ok:true}); }
    if (msg.action === 'captureRegion')      { const r = await captureRegion(msg.rect, sender.tab||tab); sendResponse(r); }
    if (msg.action === 'widescreen')         { if (tab?.id) await chrome.scripting.executeScript({ target:{tabId:tab.id}, func:adjustToWideScreen }); sendResponse({ok:true}); }
    if (msg.action === 'normalscreen')       { if (tab?.id) await chrome.scripting.executeScript({ target:{tabId:tab.id}, func:restoreNormalScreen }); sendResponse({ok:true}); }
  })();
  return true;
});

/* ── Captures ───────────────────────────────────────────────── */
async function captureFullPage(tab) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format:'png', quality:100 });
    downloadImage(dataUrl, buildFilename('capture-page'));
  } catch(e) { console.error('[FSP]', e); }
}

async function captureRegion(rect, tab) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format:'png', quality:100 });
    const blob   = await fetch(dataUrl).then(r => r.blob());
    const bitmap = await createImageBitmap(blob);
    const dpr = rect.dpr || 1;
    const cw = Math.round(rect.w * dpr), ch = Math.round(rect.h * dpr);
    if (cw < 1 || ch < 1) return { ok:false };
    const canvas = new OffscreenCanvas(cw, ch);
    canvas.getContext('2d').drawImage(bitmap, Math.round(rect.x*dpr), Math.round(rect.y*dpr), cw, ch, 0, 0, cw, ch);
    const blob2 = await canvas.convertToBlob({ type:'image/png' });
    downloadImage(await blobToDataUrl(blob2), buildFilename('capture-zone'));
    return { ok:true };
  } catch(e) { return { ok:false, error:e.message }; }
}

/* ══════════════════════════════════════════════════════════════
   SÉLECTEUR — Shadow DOM isolé, styles 100% inline
══════════════════════════════════════════════════════════════ */
async function injectSelectionUI(tabId) {
  // Pas de insertCSS séparé — tout est inline dans la fonction
  await chrome.scripting.executeScript({ target:{tabId}, func: startSelectionMode });
}

function startSelectionMode() {
  // Nettoie un éventuel doublon
  const old = document.getElementById('__fsp-host');
  if (old) old.remove();

  /* ── Crée un host attaché à <html>, pas à <body> ── */
  const host = document.createElement('div');
  host.id = '__fsp-host';

  // Style du host : couvre tout, au-dessus de tout
  host.style.cssText = [
    'position:fixed', 'inset:0', 'width:100vw', 'height:100vh',
    'z-index:2147483647', 'pointer-events:none',
    'margin:0', 'padding:0', 'border:none', 'background:transparent',
  ].join('!important;') + '!important';

  document.documentElement.appendChild(host);

  /* ── Shadow DOM fermé → imperméable aux styles de la page ── */
  const shadow = host.attachShadow({ mode: 'closed' });

  /* ── Styles dans le shadow (aucune interférence externe) ── */
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    #overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      cursor: crosshair;
      z-index: 1;
      pointer-events: auto;
      user-select: none;
    }
    #sel {
      position: fixed;
      display: none;
      pointer-events: none;
      z-index: 2;
      border: 2px solid #7c6aff;
      background: rgba(124,106,255,0.08);
      box-shadow: 0 0 0 9999px rgba(0,0,0,0.3);
      border-radius: 2px;
    }
    #dims {
      position: fixed;
      display: none;
      pointer-events: none;
      z-index: 3;
      background: #111;
      color: #fff;
      font: 500 12px/1.4 monospace;
      padding: 3px 8px;
      border-radius: 5px;
      border: 1px solid #7c6aff;
      white-space: nowrap;
    }
    #toolbar {
      position: fixed;
      top: 16px; left: 50%;
      transform: translateX(-50%);
      z-index: 4;
      pointer-events: none;
      background: rgba(13,13,20,0.95);
      border: 1px solid #333;
      border-radius: 12px;
      padding: 10px 20px;
      color: #ccc;
      font: 400 13px/1.5 system-ui, sans-serif;
      white-space: nowrap;
      box-shadow: 0 8px 32px rgba(0,0,0,0.8);
    }
    #toolbar b { color: #fff; }
    #toolbar kbd {
      background: #222; border: 1px solid #444;
      border-radius: 4px; padding: 1px 6px;
      font-size: 11px; color: #7c6aff;
    }
    #btnbar {
      position: fixed;
      display: none;
      z-index: 5;
      gap: 10px;
      pointer-events: auto;
    }
    button {
      padding: 10px 22px;
      border-radius: 10px;
      font: 700 13px/1 system-ui, sans-serif;
      cursor: pointer;
      border: none;
      outline: none;
      white-space: nowrap;
      pointer-events: auto;
    }
    #ok {
      background: linear-gradient(135deg,#7c6aff,#5b4fd4);
      color: #fff;
      box-shadow: 0 4px 20px rgba(124,106,255,0.5);
    }
    #ok:hover { filter: brightness(1.15); transform: translateY(-1px); }
    #cancel {
      background: #1a1a28; color: #aaa;
      border: 1px solid #333;
    }
    #cancel:hover { color: #ff6a8a; border-color: #ff6a8a66; }
  `;

  const overlay = document.createElement('div'); overlay.id = 'overlay';
  const sel     = document.createElement('div'); sel.id     = 'sel';
  const dims    = document.createElement('div'); dims.id    = 'dims';
  const toolbar = document.createElement('div'); toolbar.id = 'toolbar';
  const btnbar  = document.createElement('div'); btnbar.id  = 'btnbar';
  const btnOk   = document.createElement('button'); btnOk.id = 'ok';
  const btnCancel = document.createElement('button'); btnCancel.id = 'cancel';

  toolbar.innerHTML = `🖱 <b>Cliquez et glissez</b> pour sélectionner · <kbd>Échap</kbd> annuler`;
  btnOk.textContent     = '✅  Capturer';
  btnCancel.textContent = '❌  Annuler';
  btnbar.append(btnCancel, btnOk);
  shadow.append(style, overlay, sel, dims, toolbar, btnbar);

  /* ── Logique de sélection ── */
  let ox = 0, oy = 0, dragging = false, curRect = null, done = false;

  overlay.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    e.preventDefault();
    done = false;
    curRect = null;
    ox = e.clientX; oy = e.clientY;
    dragging = true;
    sel.style.display   = 'none';
    dims.style.display  = 'none';
    btnbar.style.display = 'none';
    overlay.style.pointerEvents = 'auto';
    toolbar.innerHTML = `✏️ <b>Glissez…</b>`;
  });

  // mousemove et mouseup sur le document hôte, phase capture
  const onMove = e => {
    if (!dragging) return;
    updateSel(e.clientX, e.clientY);
  };
  const onUp = e => {
    if (!dragging) return;
    dragging = false;
    updateSel(e.clientX, e.clientY);
    const w = Math.abs(e.clientX - ox), h = Math.abs(e.clientY - oy);
    if (w < 8 || h < 8) {
      toolbar.innerHTML = `⚠️ <b>Trop petit</b> — recommencez`;
      sel.style.display = dims.style.display = 'none';
      return;
    }
    done = true;
    overlay.style.pointerEvents = 'none'; // libère les clics pour les boutons
    showBtns();
    toolbar.innerHTML = `✅ <b>Zone prête</b> · Cliquez <b>Capturer</b> ou <kbd>Entrée</kbd>`;
  };

  document.addEventListener('mousemove', onMove, true);
  document.addEventListener('mouseup',   onUp,   true);

  function updateSel(mx, my) {
    const rx = Math.min(ox, mx), ry = Math.min(oy, my);
    const rw = Math.abs(mx - ox), rh = Math.abs(my - oy);
    sel.style.cssText  = `left:${rx}px;top:${ry}px;width:${rw}px;height:${rh}px;display:block`;
    dims.style.cssText = `left:${rx}px;top:${Math.max(0,ry-28)}px;display:block`;
    dims.textContent   = `${Math.round(rw)} × ${Math.round(rh)} px`;
    curRect = { x:rx, y:ry, w:rw, h:rh, dpr: window.devicePixelRatio || 1 };
  }

  function showBtns() {
    if (!curRect) return;
    const { x, y, w, h } = curRect;
    const bx  = x + w/2 - 115;
    const by  = y + h + 12;
    const top = by + 52 > window.innerHeight ? y - 52 : by;
    btnbar.style.cssText = `left:${Math.max(8, Math.min(bx, window.innerWidth-240))}px;top:${Math.max(8,top)}px;display:flex`;
  }

  /* ── Boutons ── */
  btnOk.addEventListener('click', () => {
    if (!done || !curRect) return;
    const rect = { ...curRect };
    cleanup();
    chrome.runtime.sendMessage({ action:'captureRegion', rect });
  });

  btnCancel.addEventListener('click', () => cleanup());

  /* ── Clavier ── */
  const onKey = e => {
    if (e.key === 'Escape') { e.preventDefault(); cleanup(); }
    if (e.key === 'Enter' && done && curRect) {
      e.preventDefault();
      const rect = { ...curRect };
      cleanup();
      chrome.runtime.sendMessage({ action:'captureRegion', rect });
    }
  };
  document.addEventListener('keydown', onKey, true);

  function cleanup() {
    document.removeEventListener('mousemove', onMove, true);
    document.removeEventListener('mouseup',   onUp,   true);
    document.removeEventListener('keydown',   onKey,  true);
    host.remove();
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    (document.exitFullscreen||document.webkitExitFullscreen).call(document).catch(()=>{});
  } else {
    const el = document.documentElement;
    (el.requestFullscreen||el.webkitRequestFullscreen).call(el).catch(()=>{});
  }
}
function buildFilename(prefix) {
  const d=new Date(), p=n=>String(n).padStart(2,'0');
  return `${prefix}-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.png`;
}
function downloadImage(dataUrl, filename) { chrome.downloads.download({ url:dataUrl, filename, saveAs:false }); }
function blobToDataUrl(blob) {
  return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(blob); });
}

/* ── Widescreen Adjustments for Modelized Tables ──────────────── */
function adjustToWideScreen() {
  const tables = Array.from(document.querySelectorAll('table'));
  
  function isModelizedTable(table) {
    // Check first 5 rows of the table to find keywords in column headers or sub-headers
    const rows = Array.from(table.querySelectorAll('tr')).slice(0, 5);
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('th, td'));
      const headers = cells.map(c => c.textContent.toLowerCase().trim());
      const hasKeyword = headers.some(h => {
        if (h === 'conclusion') return true;
        if (h === 'assertion') return true;
        if (h === 'ecart' || h === 'écart') return true;
        if (h === 'resultat' || h === 'résultat') return true;
        if (/^ctr\s*\d*$/i.test(h)) return true;
        return false;
      });
      if (hasKeyword) return true;
    }
    return false;
  }

  tables.forEach(table => {
    if (!isModelizedTable(table)) return;

    // 1. Get true content width by temporarily expanding the table to max-content
    const origWidth = table.style.width;
    const origMaxWidth = table.style.maxWidth;
    const origLayout = table.style.tableLayout;
    table.style.setProperty('width', 'max-content', 'important');
    table.style.setProperty('max-width', 'none', 'important');
    table.style.setProperty('table-layout', 'auto', 'important');
    const tableScrollWidth = table.scrollWidth;
    table.style.width = origWidth;
    table.style.maxWidth = origMaxWidth;
    table.style.tableLayout = origLayout;

    // Add extra padding (160px) to ensure columns don't wrap and there is plenty of room for right-side shadows & paddings
    const neededWidth = tableScrollWidth + 160;
    
    // Set targetWidth as the needed width (at least 1200px)
    const targetWidth = Math.max(neededWidth, 1200);

    // 2. Traverse up ancestors to find containers to widen
    let current = table;
    const ancestorsToWiden = [];
    const proseDiv = table.closest('.prose, [class*="prose"]');
    
    while (current && current !== document.body) {
      current = current.parentElement;
      if (!current) break;
      
      const style = window.getComputedStyle(current);
      const hasMaxWidth = style.maxWidth && style.maxWidth !== 'none';
      const hasMaxWClass = Array.from(current.classList).some(cls => cls.includes('max-w-'));
      const isMxAuto = current.classList.contains('mx-auto') || Array.from(current.classList).some(cls => cls.includes('mx-auto'));
      const isChatContainer = Array.from(current.classList).some(cls => {
        const c = cls.toLowerCase();
        return c.includes('chat') || c.includes('message') || c.includes('bubble') || c.includes('window');
      });
      
      if (hasMaxWidth || hasMaxWClass || isMxAuto || isChatContainer || current.hasAttribute('data-clara-container')) {
        ancestorsToWiden.push(current);
      }
    }

    // Apply styles to ancestors using the proven method (95% width and max-width limit)
    ancestorsToWiden.forEach(el => {
      if (!el.hasAttribute('data-orig-style')) {
        el.setAttribute('data-orig-style', el.getAttribute('style') || '');
      }
      if (!el.hasAttribute('data-orig-class')) {
        el.setAttribute('data-orig-class', el.className || '');
      }
      
      el.style.setProperty('max-width', `${targetWidth}px`, 'important');
      el.style.setProperty('width', '95%', 'important');
    });

    // 3. For the table itself and its scroll wrapper, allow them to take full width
    const wrapper = table.parentElement;
    if (wrapper && wrapper.tagName === 'DIV') {
      if (!wrapper.hasAttribute('data-orig-style')) {
        wrapper.setAttribute('data-orig-style', wrapper.getAttribute('style') || '');
      }
      wrapper.style.setProperty('max-width', 'none', 'important');
      wrapper.style.setProperty('width', '100%', 'important');
      wrapper.style.setProperty('overflow-x', 'auto', 'important');
    }

    if (!table.hasAttribute('data-orig-style')) {
      table.setAttribute('data-orig-style', table.getAttribute('style') || '');
    }
    table.style.setProperty('width', '100%', 'important');
    table.style.setProperty('table-layout', 'auto', 'important');

    // 4. Find other tables in the same prose div and restrict their width so they don't stretch
    if (proseDiv) {
      const allWrappersInProse = Array.from(proseDiv.querySelectorAll('div'));
      allWrappersInProse.forEach(div => {
        const innerTables = Array.from(div.querySelectorAll('table'));
        if (innerTables.length > 0 && !innerTables.some(isModelizedTable)) {
          if (!div.hasAttribute('data-orig-style')) {
            div.setAttribute('data-orig-style', div.getAttribute('style') || '');
          }
          div.style.setProperty('max-width', '800px', 'important');
          div.style.setProperty('width', '100%', 'important');
          div.style.setProperty('margin-left', '0', 'important');
          div.style.setProperty('margin-right', 'auto', 'important');
        }
      });
    }
  });
}



function restoreNormalScreen() {
  const elementsWithOrigStyle = Array.from(document.querySelectorAll('[data-orig-style]'));
  elementsWithOrigStyle.forEach(el => {
    const origStyle = el.getAttribute('data-orig-style');
    if (origStyle) {
      el.setAttribute('style', origStyle);
    } else {
      el.removeAttribute('style');
    }
    el.removeAttribute('data-orig-style');
  });

  const elementsWithOrigClass = Array.from(document.querySelectorAll('[data-orig-class]'));
  elementsWithOrigClass.forEach(el => {
    const origClass = el.getAttribute('data-orig-class');
    if (origClass) {
      el.className = origClass;
    }
    el.removeAttribute('data-orig-class');
  });
}

/**
 * Screen Manager for Claraverse
 * Manages Widescreen vs Middle screen vs Normal screen modes natively
 */

let widescreenObserver: MutationObserver | null = null;
let adjustTimeout: any = null;
let resizeListenerAttached = false;

// ──────────────────────────────────────────────────────────────────────────────
// User-scroll guard: when the user manually scrolls, we pause debouncedAdjust
// for USER_SCROLL_PAUSE_MS ms to avoid the MutationObserver triggering a
// scroll-anchor repositioning that makes the view jump back up.
// ──────────────────────────────────────────────────────────────────────────────
const USER_SCROLL_PAUSE_MS = 800;
let userScrollPauseUntil = 0;
let userScrollListenerAttached = false;

function attachUserScrollGuard(): void {
  if (userScrollListenerAttached) return;
  userScrollListenerAttached = true;
  // Capture phase so we intercept scroll on the overflow-y-auto container
  // regardless of where in the DOM it lives.
  document.addEventListener(
    'scroll',
    () => {
      userScrollPauseUntil = Date.now() + USER_SCROLL_PAUSE_MS;
    },
    { passive: true, capture: true }
  );
}

/**
 * Get active screen mode from localStorage
 */
export function getCurrentScreenMode(): 'wide' | 'middle' | 'normal' {
  const saved = localStorage.getItem('clara-screen-mode');
  if (saved === 'wide') return 'wide';
  if (saved === 'middle') return 'middle';
  return 'normal';
}

/**
 * Detect if a table is a Modelized Table by checking its headers
 */
export function isModelizedTable(table: HTMLTableElement): boolean {
  const headers = Array.from(table.querySelectorAll('th, td')).slice(0, 30).map(c => c.textContent?.toLowerCase().trim() || '');
  if (headers.length > 0) {
    const hasKeyword = headers.some(h => {
      if (h.includes('conclusion')) return true;
      if (h.includes('assertion')) return true;
      if (h.includes('ecart') || h.includes('écart')) return true;
      if (h.includes('resultat') || h.includes('résultat')) return true;
      if (/ctr\s*\d*/i.test(h)) return true;
      if (h.includes('table de consolidation') || h.includes('consolidation')) return true;
      if (h.includes('cross reference') || h.includes('cross references')) return true;
      return false;
    });
    if (hasKeyword) return true;
  }
  // If we couldn't find specific keywords but it has 5 or more columns, treat it as modelized
  const firstRowCells = table.querySelectorAll('tr:first-child th, tr:first-child td');
  if (firstRowCells.length >= 5) {
    return true; // Wide tables automatically qualify
  }
  return false;
}

let sessionMaxTargetWidth = 1200;
let currentAppliedTargetWidth = 0;

/**
 * Ensures the static CSS stylesheet is injected once into document.head
 */
function ensureStyleTagInjected(): void {
  let styleTag = document.getElementById('clara-widescreen-styles');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'clara-widescreen-styles';
    styleTag.innerHTML = `
      /* Prevent whole-page horizontal scrolling so the topbar and page remain fixed and stable */
      html, body {
        overflow-x: hidden !important;
      }

      /* Disable scroll anchoring jumps in wide mode */
      body[data-clara-screen-mode="wide"] .flex-1.overflow-y-auto,
      body[data-clara-screen-mode="wide"] .flex-1.overflow-y-auto * {
        overflow-anchor: none !important;
      }

      /* Reduce scroll container outer padding by 60% (10px instead of 24px) */
      body[data-clara-screen-mode="wide"] .flex-1.overflow-y-auto {
        padding-left: 10px !important;
        padding-right: 10px !important;
        overflow-anchor: none !important;
      }

      /* All descendants of the scroll container: prevent browser from choosing
         any of them as anchor elements */
      body[data-clara-screen-mode="wide"] .flex-1.overflow-y-auto * {
        overflow-anchor: none !important;
      }

      /* Widen the main wrappers with 60% reduced side margins (98% width) */
      body[data-clara-screen-mode="wide"] [data-widescreen-target="container"] {
        max-width: var(--clara-target-width) !important;
        width: 98% !important;
        margin-left: auto !important;
        margin-right: auto !important;
        box-sizing: border-box !important;
        transition: max-width 0.25s ease-out;
      }

      /* Message row: clean, harmonious gap with standard avatar */
      body[data-clara-screen-mode="wide"] .flex.gap-4:has([data-widescreen-target="bubble"]) {
        gap: 8px !important;
      }

      /* Message bubble container: natural flex item, aligned with avatar */
      body[data-clara-screen-mode="wide"] [data-widescreen-target="bubble"] {
        max-width: 100% !important;
        width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
      }

      /* Inner bubble: 60% reduced padding (10px instead of 20px) while maintaining aesthetics */
      body[data-clara-screen-mode="wide"] [data-widescreen-target="bubble-inner"] {
        width: 100% !important;
        max-width: 100% !important;
        padding-left: 10px !important;
        padding-right: 10px !important;
        box-sizing: border-box !important;
        overflow-x: auto !important;
      }

      /* Tables inside prose: auto layout so column content sizes naturally */
      body[data-clara-screen-mode="wide"] .prose table {
        width: 100% !important;
        table-layout: auto !important;
        box-sizing: border-box !important;
      }

      /* Wrapper div of each table: horizontal scroll with clean buffer */
      body[data-clara-screen-mode="wide"] .prose div:has(> table) {
        max-width: 100% !important;
        width: 100% !important;
        overflow-x: auto !important;
        box-sizing: border-box !important;
        padding-right: 8px !important;
        scrollbar-width: thin !important;
      }

      /* Ensure first column has clean padding */
      body[data-clara-screen-mode="wide"] .prose table th:first-child,
      body[data-clara-screen-mode="wide"] .prose table td:first-child {
        padding-left: 8px !important;
      }

      /* Ensure right border and rightmost column padding are always visible */
      body[data-clara-screen-mode="wide"] .prose table th:last-child,
      body[data-clara-screen-mode="wide"] .prose table td:last-child {
        border-right-width: 1px !important;
        padding-right: 10px !important;
      }
    `;
    document.head.appendChild(styleTag);
  }
}

/**
 * Accurately measures the unconstrained natural width of a table with all its columns
 * expanded by cloning it offscreen. This does NOT mutate the live DOM or cause scroll jumps.
 */
function getTableNaturalWidth(table: HTMLTableElement): number {
  try {
    const clone = table.cloneNode(true) as HTMLTableElement;
    clone.style.position = 'fixed';
    clone.style.visibility = 'hidden';
    clone.style.pointerEvents = 'none';
    clone.style.width = 'max-content';
    clone.style.maxWidth = 'none';
    clone.style.tableLayout = 'auto';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.zIndex = '-1000';
    document.body.appendChild(clone);
    const measuredWidth = clone.scrollWidth || clone.offsetWidth || Math.ceil(clone.getBoundingClientRect().width);
    document.body.removeChild(clone);
    return Math.max(measuredWidth, 1200);
  } catch (e) {
    return table.scrollWidth || 1200;
  }
}

/**
 * Adjust all modelized tables and their containers to a given screen mode using CSS variable updates.
 * @param widthMultiplier - 1.0 for wide, 0.9 for middle
 */
function applyScreenMode(widthMultiplier: number): void {
  const tables = Array.from(document.querySelectorAll('table'));
  const modelizedTables = tables.filter(isModelizedTable);

  // 1. Scan true unconstrained natural width from modelized tables via offscreen clone
  let maxTableNaturalWidth = 0;
  modelizedTables.forEach(table => {
    const naturalWidth = getTableNaturalWidth(table);
    const neededWidth = naturalWidth + 40;
    if (neededWidth > maxTableNaturalWidth) {
      maxTableNaturalWidth = neededWidth;
    }
  });

  // Calculate safe viewport width with 60% reduced margin (7px left + 7px right = 14px total)
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1920;
  const maxSafeViewportWidth = Math.max(800, viewportWidth - 14);

  // If modelized tables exist, expand to fit their natural width (or max safe viewport width)
  // If no tables are present yet, default to max safe viewport width so user gets wide space
  const baseTargetWidth = maxTableNaturalWidth > 0 
    ? Math.max(maxTableNaturalWidth, 1400)
    : maxSafeViewportWidth;

  // Apply the multiplier: 1.0 for wide, 0.9 for middle
  const rawTargetWidth = Math.round(baseTargetWidth * widthMultiplier);
  // Cap at safe viewport width so the table fits comfortably without touching edges
  const effectiveWidth = Math.min(rawTargetWidth, maxSafeViewportWidth);



  // 2. Ensure the static stylesheet is present
  ensureStyleTagInjected();

  // 3. Update the CSS variable on body only if changed (prevents unnecessary reflows)
  if (currentAppliedTargetWidth !== effectiveWidth) {
    currentAppliedTargetWidth = effectiveWidth;
    document.body.style.setProperty('--clara-target-width', `${effectiveWidth}px`);
  }
  
  // Activate the mode attribute on the body
  if (document.body.getAttribute('data-clara-screen-mode') !== 'wide') {
    document.body.setAttribute('data-clara-screen-mode', 'wide');
  }

  // Attach window resize listener once to recalculate safe width when window is resized
  if (!resizeListenerAttached) {
    resizeListenerAttached = true;
    window.addEventListener('resize', () => {
      const mode = getCurrentScreenMode();
      if (mode === 'wide' || mode === 'middle') {
        debouncedAdjust();
      }
    });
  }

  // Activate the user-scroll guard so manual scrolling suppresses debouncedAdjust
  // calls and prevents the scroll-anchor algorithm from jumping the viewport.
  attachUserScrollGuard();
}


/**
 * Adjust all modelized tables and their containers to widescreen (100% width)
 */
export function adjustToWideScreen(): void {
  applyScreenMode(1.0);
}

/**
 * Adjust all modelized tables and their containers to middle screen (90% of wide width)
 */
export function adjustToMiddleScreen(): void {
  applyScreenMode(0.9);
}

/**
 * Revert all altered styles and classes back to their originals
 */
export function restoreNormalScreen(): void {
  document.body.removeAttribute('data-clara-screen-mode');
  currentAppliedTargetWidth = 0;
  
  // Remove the injected style tag so no residual rules remain
  const styleTag = document.getElementById('clara-widescreen-styles');
  if (styleTag) {
    styleTag.remove();
  }

  // Optionally reset the session max width so it recalculates fresh if re-enabled
  sessionMaxTargetWidth = 1200;
}

/**
 * Run adjustment debounced to avoid layout thrashing and loop feedback.
 * Also honours the user-scroll guard: if the user has scrolled within
 * USER_SCROLL_PAUSE_MS ms we skip the DOM adjustment entirely so the
 * browser's scroll anchoring algorithm cannot reposition the viewport.
 */
export function debouncedAdjust(): void {
  if (adjustTimeout) clearTimeout(adjustTimeout);
  adjustTimeout = setTimeout(() => {
    const mode = getCurrentScreenMode();
    if (mode === 'normal') return;

    // ── User-scroll guard ────────────────────────────────────────────────────
    // If the user scrolled recently, skip this adjustment cycle.
    // The next DOM mutation (new table token or real content arrival) will
    // schedule a fresh debouncedAdjust after the pause window has expired.
    if (Date.now() < userScrollPauseUntil) return;
    // ─────────────────────────────────────────────────────────────────────────

    if (mode === 'wide') {
      adjustToWideScreen();
    } else if (mode === 'middle') {
      adjustToMiddleScreen();
    }
  }, 50);
}

/**
 * Starts the MutationObserver, carefully scoped to ONLY react to new <table> additions
 * and never on scrolling, button toggles, or minor DOM updates.
 */
function startWidescreenObserver(): void {
  if (!widescreenObserver) {
    widescreenObserver = new MutationObserver((mutations) => {
      let hasNewTables = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              if (el.tagName === 'TABLE' || el.querySelector?.('table')) {
                hasNewTables = true;
                break;
              }
            }
          }
        }
        if (hasNewTables) break;
      }

      if (hasNewTables) {
        debouncedAdjust();
      }
    });
  }

  widescreenObserver.disconnect();
  widescreenObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Set active screen mode ('wide', 'middle', or 'normal'), adjust layout, and toggle MutationObserver
 */
export function setScreenMode(mode: 'wide' | 'middle' | 'normal'): void {
  localStorage.setItem('clara-screen-mode', mode);
  
  if (mode === 'wide') {
    sessionMaxTargetWidth = 1200;
    currentAppliedTargetWidth = 0;
    adjustToWideScreen();
    startWidescreenObserver();
  } else if (mode === 'middle') {
    sessionMaxTargetWidth = 1200;
    currentAppliedTargetWidth = 0;
    adjustToMiddleScreen();
    startWidescreenObserver();
  } else {
    if (widescreenObserver) {
      widescreenObserver.disconnect();
    }
    restoreNormalScreen();
  }
  
  // Dispatch custom event to notify React components
  window.dispatchEvent(new CustomEvent('clara-screen-mode-changed', { detail: { mode } }));
}

/**
 * Boot up screen mode state on app startup
 */
export function initializeScreenMode(): void {
  const mode = getCurrentScreenMode();
  if (mode === 'wide' || mode === 'middle') {
    sessionMaxTargetWidth = 1200;
    currentAppliedTargetWidth = 0;
    
    if (mode === 'wide') {
      adjustToWideScreen();
    } else {
      adjustToMiddleScreen();
    }
    
    startWidescreenObserver();
  }
}



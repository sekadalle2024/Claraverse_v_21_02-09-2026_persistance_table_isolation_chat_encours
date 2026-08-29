# Chrome Extension: Adjust Chat Container to Modelized Table Width

Add `wide screen` and `normal screen` options to the Chrome extension's context menu. These options will dynamically expand the chat layout to show the full width of the "Modelized Table" (containing columns like CTR, Conclusion, Ecart, etc.) without horizontal scrolling, and restore the default narrow layout, respectively.

## User Review Required

> [!NOTE]
> The dynamic widescreen resizing is achieved by injecting a Javascript function that traverses up the DOM hierarchy starting from the target Modelized Table. It overrides CSS layout constraints (such as `max-width` and `width`) on the parent containers using inline styles with `!important` priority. To ensure other tables in the same message are not stretched, their wrappers are explicitly constrained to the standard width (800px).

## Proposed Changes

### Chrome Extension (fullscreen-extension-v8)

---

#### [MODIFY] background.js
- Register `fsp-widescreen` and `fsp-normalscreen` context menu items within the existing context menu structure.
- Add event handling for these menu items in the `chrome.contextMenus.onClicked` listener.
- Implement the `adjustToWideScreen` function:
  - Detect modelized tables by checking the first 5 rows for header columns (`Conclusion`, `Assertion`, `Ecart`, `Resultat`, `CTR`), which supports tables with multi-row headers and title rows.
  - Read `scrollWidth` of the modelized table under temporary `max-content` layout to get its true unconstrained width, and add a 160px safety margin to calculate the target width (giving ample room for right-side shadows & padding).
  - Backup original styles/classes of container elements in `data-orig-style` and `data-orig-class` attributes.
  - Traverse all container ancestors up to `document.body` that have width-limiting styles, classes (`max-w-`, `mx-auto`, etc.), or chat layouts, and set their `max-width: [targetWidth]px !important` and `width: 95% !important`.
  - Explicitly restrict other non-modelized tables in the same container to standard width (800px).
  - Ensure table wrapper overflow-x is `auto` as a safety mechanism.
- Implement the `restoreNormalScreen` function:
  - Find all elements containing `data-orig-style` or `data-orig-class` attributes.
  - Revert their styling and classes to the original values and remove backup data attributes.

## Verification Plan

### Manual Verification
- Load the extension in Chrome Developer mode.
- Open the Claraverse chat window.
- Right-click anywhere in the page to trigger the context menu.
- Hover over `📸 FullScreen Pro` and select `🖥️ Ajuster largeur [wide screen]`.
- Verify that the chat bubble and window widen dynamically to match the table's width, eliminating or reducing horizontal scroll bars for the modelized table, while non-modelized tables keep their default width.
- Right-click again, hover over `📸 FullScreen Pro` and select `🖥️ Largeur normale [normal screen]`.
- Verify that the layout returns to its standard narrow width.

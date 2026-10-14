# FlyRank FE-05: Accessible Component Fundamentals — Engineering Notes

## 1. Overview of the Three Hand-Built Components

The three components in `playground/components/` were built from scratch using React 19 + TypeScript, semantic HTML, and the W3C WAI-ARIA Authoring Practices Guide (APG). No external component libraries or UI frameworks were used in their original implementations.

### A. Modal Dialog (`playground/components/modal/Modal.tsx`)
- **Semantics & Structure**: Rendered via `ReactDOM.createPortal` into `document.body` to avoid parent stacking context and overflow clipping. The container uses `role="dialog"`, `aria-modal="true"`, and `tabIndex={-1}`.
- **Accessible Labeling**: Generates stable IDs via React 19's `useId()`, linking `aria-labelledby` to the dialog title and `aria-describedby` to the optional description. Supports `ariaLabel` as an unlabelled fallback.
- **Focus Management**:
  - Captures `document.activeElement` into `previouslyFocusedElementRef` before opening.
  - Automatically moves focus on the next animation frame (`requestAnimationFrame`) to `initialFocusRef` (if supplied), the first focusable element inside the dialog, or the dialog container itself.
  - Traps keyboard focus inside the dialog: intercepts `Tab` to cycle from last to first element and `Shift+Tab` to cycle backwards from first to last element.
  - Adds a document-level `focusin` listener to prevent focus escaping via browser chrome or outside clicks.
  - Restores focus to the triggering element upon close or unmount.
- **Dismissal & Cleanup**: Closes on `Escape` key and backdrop click (both configurable). Locks body scroll (`overflow: hidden`) while open and cleanly restores original body overflow on close/unmount.

### B. Tabs (`playground/components/tabs/Tabs.tsx`)
- **Semantics & Relationships**:
  - `role="tablist"` on the list container with required `aria-label` and `aria-orientation`.
  - `role="tab"` on each tab button with stable IDs (`tab-{baseId}-{value}`) and `aria-controls` pointing to its panel (`panel-{baseId}-{value}`).
  - `role="tabpanel"` on each panel container with `aria-labelledby` pointing back to its tab and `tabIndex={0}` to allow keyboard users to scroll and read panel content per W3C APG.
- **Roving Tabindex**: Only the active tab receives `tabIndex={0}`; all inactive tabs have `tabIndex={-1}`. Keyboard users press `Tab` once to land on the active tab and press `Tab` again to move directly into the tabpanel.
- **Keyboard Navigation**:
  - **Horizontal**: `ArrowRight` (next tab, wraps to start), `ArrowLeft` (previous tab, wraps to end).
  - **Vertical**: `ArrowDown` (next tab, wraps to start), `ArrowUp` (previous tab, wraps to end).
  - **Home / End**: `Home` immediately focuses the first enabled tab; `End` focuses the last enabled tab.
  - **Activation Modes**: Supports both `automatic` (default, focusing activates the tab) and `manual` (arrow keys move focus; `Enter` or `Space` activates the tab).
  - **Disabled State**: Disabled tabs are skipped automatically during keyboard navigation.

### C. Disclosure (`playground/components/disclosure/Disclosure.tsx`)
- **Semantics & Controls**:
  - Uses native `<button>` element with `type="button"`, `aria-expanded="true"|"false"`, and `aria-controls="{panelId}"`.
  - Uses native button keyboard behavior: pressing `Enter` or `Space` activates the button without custom keyboard handlers.
  - Animated chevron indicator with smooth CSS rotation and `aria-hidden="true"`.
- **Keyboard & AT Isolation**:
  - When collapsed, the panel receives the HTML `hidden` attribute (or is completely unmounted if `keepMounted={false}`).
  - This guarantees that nested links, buttons, and inputs are completely removed from the accessibility tree and keyboard Tab sequence while collapsed.
- **Flexibility**: Provides both a compound API (`<Disclosure>`, `<DisclosureButton>`, `<DisclosurePanel>`) and a simple accordion API (`<SimpleDisclosure>`).

---

## 2. Keyboard-Only Testing Methodology

Keyboard accessibility was tested using a two-tier verification approach:

### Tier 1: Automated Behavioral Testing (Vitest + JSDOM)
- **Suite**: 42 automated tests across 9 test files (`Modal.test.tsx`, `Tabs.test.tsx`, `Disclosure.test.tsx`, `ShadcnComparison.test.tsx`, and existing capstone tests).
- **Verified Behaviors**:
  - Modal: Verified `role="dialog"`, `aria-modal="true"`, focus entry, focus trap forward/backward wrapping, Escape dismissal, backdrop click dismissal, focus restoration to trigger element, and scroll locking.
  - Tabs: Verified roving tabindex (`0` vs `-1`), horizontal and vertical arrow navigation with wrapping, Home/End jump, automatic vs manual activation with Enter/Space, and disabled tab skipping.
  - Disclosure: Verified initial `aria-expanded="false"`, toggle via click and native Enter/Space, and verified that inner elements inside collapsed panels are inaccessible to tab focus.

### Tier 2: Real Browser Verification (Vite Dev Server + Browser Subagent)
- **Environment**: Chromium browser running on Windows with live Vite server at `http://localhost:5173/playground/index.html`.
- **Interactive Focus Inspector**: A live on-screen focus badge (`data-testid="live-focus-indicator"`) tracked `document.activeElement` at every step.
- **Executed Keyboard Flow**:
  1. Tabbed into "Open Hand-Built Modal" button and activated via `Enter`.
  2. Verified dialog opened and focus moved inside.
  3. Pressed `Tab` repeatedly to cycle through the header close button, body text inputs, role select, and footer buttons. Verified focus wrapped from the last footer button back to the close button.
  4. Pressed `Shift+Tab` to verify backwards focus wrapping.
  5. Pressed `Escape` to close the dialog; verified focus returned directly to the trigger button.
  6. Navigated down to the Tabs section; pressed `ArrowRight` and `ArrowLeft` to move between "General", "Security", and "Billing". Verified tab selection and panel updates.
  7. Pressed `Home` to jump to "General" and `End` to jump to "Billing".
  8. Navigated to Disclosure section; pressed `Enter` and `Space` to expand and collapse.
- **Recording Artifact**: Full video session recorded to `brain/5264a03a-f45a-46b8-9380-6f8aeb217cb5/keyboard_accessibility_testing_1791998167266.webp`.

---

## 3. What the Hand-Built Implementation Initially Missed or Handled Less Robustly

1. **Hidden / Non-Displayed Focusable Elements**:
   - *Initial Issue*: A simple query selector `a[href], button:not([disabled]), input...` finds elements that are inside the DOM but visually hidden via `display: none`, `visibility: hidden`, or the `hidden` attribute. Tabbing to an invisible element causes focus to seemingly "disappear" for keyboard users.
   - *Resolution*: Implemented `getFocusableElements()` which filters candidates by checking `hasAttribute('hidden')`, `aria-hidden="true"`, and computed styles `display !== 'none'` and `visibility !== 'hidden'`.

2. **JSDOM Test Tear-Down Conflict with React Portals**:
   - *Initial Issue*: In test setup, calling `document.body.innerHTML = ''` inside `afterEach` while React Testing Library unmounts portal elements threw `NotFoundError: The node to be removed is not a child of this node`.
   - *Resolution*: Removed manual `innerHTML` wipes, relying on React Testing Library's native `cleanup()` lifecycle.

3. **Event Listener Cleanup on Rapid Unmount**:
   - *Initial Issue*: When a modal was closed via parent state rather than the close button or Escape key, there was potential for the body scroll lock or `previouslyFocusedElementRef` to leak if cleanup was tied solely to close callbacks.
   - *Resolution*: Moved scroll restoration and focus restoration into the `useEffect` cleanup return function so it executes reliably on both user-initiated close and sudden component unmounting.

---

## 4. Truthful Gaps Between Hand-Built Implementation and shadcn/ui (Radix UI)

Inspecting the official source code of shadcn/ui and its underlying Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `@radix-ui/react-focus-scope`, `react-remove-scroll`) reveals significant engineering differences:

### Gap 1: Edge Sentinel Focus Guards (`FocusGuards` & `FocusScope`)
- **shadcn/ui (Radix UI)**: Radix injects invisible boundary nodes (`<span data-radix-focus-guard tabIndex={0} style="position: fixed; opacity: 0; pointer-events: none">`) at the beginning and end of `document.body`. When a keyboard user tabs out of the dialog, focus lands on this guard element *before* the browser window can pass focus to the browser's URL address bar or extension UI. The guard immediately traps and bounces focus back inside the dialog.
- **Hand-Built**: Our modal relies on intercepting the `keydown` event on the `Tab` key and a fallback `focusin` document listener. While reliable within the web document, if the user focuses the browser URL bar and tabs forward into the page, standard `keydown` interception cannot preempt the browser's native tabbing into top-level document elements without sentinel guards.

### Gap 2: Advanced Scroll Locking and Layout Shift Compensation (`react-remove-scroll`)
- **shadcn/ui (Radix UI)**: Radix integrates `react-remove-scroll` and `react-remove-scroll-bar`. On desktop systems with visible scrollbars (e.g. Windows), removing the scrollbar reduces the viewport width, which causes content underneath to visibly "jump" by ~15px. Radix measures the exact scrollbar width and automatically applies a compensating `--removed-body-scroll-bar-size` CSS variable to `body` padding. It also handles iOS Safari rubber-band scrolling prevention while keeping the dialog body scrollable.
- **Hand-Built**: We apply `document.body.style.overflow = 'hidden'`. While simple and zero-dependency, it does not calculate scrollbar width compensation, so users on platforms with fixed scrollbars experience a subtle layout shift upon opening the modal.

### Gap 3: Nested Layer Stacking & Dismissal Order (`@radix-ui/react-dismissable-layer`)
- **shadcn/ui (Radix UI)**: Radix maintains an internal global layer stack for all overlays (dialogs, popovers, dropdowns, tooltips). When a user presses `Escape` with a select dropdown open *inside* an open dialog, only the dropdown closes, leaving the dialog open.
- **Hand-Built**: Our modal listens directly to `Escape` on `document`. If a nested interactive popup were opened inside the modal without custom event cancellation, pressing `Escape` could dismiss both the nested popup and the dialog simultaneously.

---

## 5. Location of Relevant shadcn/ui Source Code

The official shadcn/ui components were installed and are located at:
- **`playground/components/ui/dialog.tsx`**: The shadcn Dialog component source code, wrapping `DialogPrimitive` (`@radix-ui/react-dialog`), supporting header, footer, overlay, title, description, and close button.
- **`playground/components/ui/tabs.tsx`**: The shadcn Tabs component source code, wrapping `TabsPrimitive` (`@radix-ui/react-tabs`) and `tabsListVariants` via `class-variance-authority`.
- **`playground/components/ui/button.tsx`**: The shadcn Button component source code (`Slot.Root` from `@radix-ui/react-slot`).
- **`playground/lib/utils.ts`**: The standard `cn()` helper merging `clsx` and `tailwind-merge`.
- **Radix UI Primitives (in `node_modules`)**:
  - Dialog primitive: `node_modules/@radix-ui/react-dialog/dist/index.mjs`
  - Tabs primitive: `node_modules/@radix-ui/react-tabs/dist/index.mjs`
  - Focus Scope & Guards: `node_modules/@radix-ui/react-focus-scope/dist/index.mjs`
  - Dismissable Layer: `node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs`

---

## 6. Remaining Limitations and Unverified Behaviors

1. **Auditory Screen Reader Testing**:
   - Automated testing verified all ARIA semantics (`role`, `aria-modal`, `aria-labelledby`, `aria-describedby`, `aria-selected`, `aria-controls`, `aria-expanded`).
   - However, manual auditory testing with live screen readers (NVDA on Windows, JAWS, or VoiceOver on macOS) must still be performed by a human tester to verify voice inflection, announcement timing, and virtual cursor interactions.
2. **Right-to-Left (RTL) Layouts**:
   - The hand-built Tabs component currently maps `ArrowRight` to next tab and `ArrowLeft` to previous tab. In an RTL locale (e.g. Arabic, Hebrew), `ArrowRight` should navigate to the previous visual tab. Radix UI handles this automatically via `dir="rtl"`; our hand-built component currently assumes LTR.
3. **Windows High Contrast Mode (Contrast Themes)**:
   - Visual focus rings use `2px solid #f97316` (or `outline-offset: 2px`). Under Windows High Contrast themes, browser overrides may alter custom outline colors. Manual verification with Contrast Themes enabled in Windows Settings is recommended.

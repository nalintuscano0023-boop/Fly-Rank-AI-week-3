import React, { useState, useEffect, useRef } from 'react';
import './playground.css';

// Hand-built accessible components
import { Modal } from './components/modal/Modal';
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  type TabsOrientation,
  type TabsActivationMode,
} from './components/tabs/Tabs';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  SimpleDisclosure,
} from './components/disclosure/Disclosure';

// shadcn/ui components
import {
  Dialog as ShadcnDialog,
  DialogTrigger as ShadcnDialogTrigger,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
} from './components/ui/dialog';
import {
  Tabs as ShadcnTabs,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
  TabsContent as ShadcnTabsContent,
} from './components/ui/tabs';

export const PlaygroundApp: React.FC = () => {
  // Live Active Element Tracker for Keyboard Testers
  const [activeElementTag, setActiveElementTag] = useState<string>('None (click or tab to inspect)');

  useEffect(() => {
    const handleFocus = () => {
      const active = document.activeElement;
      if (!active || active === document.body) {
        setActiveElementTag('document.body');
        return;
      }
      const tag = active.tagName.toLowerCase();
      const id = active.id ? `#${active.id}` : '';
      const role = active.getAttribute('role') ? `[role="${active.getAttribute('role')}"]` : '';
      const testId = active.getAttribute('data-testid') ? `[data-testid="${active.getAttribute('data-testid')}"]` : '';
      const text = active.textContent?.trim().slice(0, 20) || '';
      setActiveElementTag(`<${tag}${id}${role}${testId}> ${text ? `"${text}"` : ''}`);
    };

    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialFocusEmail, setModalInitialFocusEmail] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Tabs State
  const [tabsOrientation, setTabsOrientation] = useState<TabsOrientation>('horizontal');
  const [tabsActivationMode, setTabsActivationMode] = useState<TabsActivationMode>('automatic');

  // Disclosure State
  const [controlledDisclosureOpen, setControlledDisclosureOpen] = useState(false);

  return (
    <div className="playground-shell">
      {/* Header & Live Focus Inspector */}
      <header className="playground-header">
        <div className="playground-badge">FlyRank FE-05 Lab</div>
        <h1 className="playground-title">Accessible Component Fundamentals</h1>
        <p className="playground-subtitle">
          Interactive verification playground for production-grade React + TypeScript accessible components.
          Test keyboard traps, roving tabindex, ARIA authoring patterns, and side-by-side shadcn/ui comparisons.
        </p>

        <div className="focus-inspector" aria-live="polite">
          <span className="focus-inspector-label">LIVE FOCUS:</span>
          <span className="focus-inspector-value" data-testid="live-focus-indicator">
            {activeElementTag}
          </span>
        </div>
      </header>

      {/* SECTION 1: MODAL DIALOG */}
      <section className="playground-section" aria-labelledby="modal-section-title">
        <div className="section-header">
          <div>
            <h2 id="modal-section-title" className="section-title">1. Modal Dialog</h2>
            <p className="section-desc">
              Semantics, focus trapping, initial focus placement, Escape dismissal, and return focus.
            </p>
          </div>
          <div className="keyboard-hints">
            <strong>Keyboard:</strong> <kbd>Tab</kbd> cycle inside | <kbd>Shift+Tab</kbd> reverse cycle | <kbd>Esc</kbd> dismiss
          </div>
        </div>

        <div className="comparison-grid">
          {/* Hand-built Modal */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Hand-Built Modal Dialog</h3>
              <span className="tag-handbuilt">Hand-Crafted</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
              Full W3C APG implementation with portal rendering, background scroll locking, focus trap boundary guards, and automatic trigger focus restoration.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                <input
                  type="checkbox"
                  checked={modalInitialFocusEmail}
                  onChange={(e) => setModalInitialFocusEmail(e.target.checked)}
                />
                Focus Email field on open (initialFocusRef)
              </label>

              <button
                type="button"
                className="pg-btn pg-btn-primary"
                onClick={() => setIsModalOpen(true)}
                id="open-handbuilt-modal-btn"
                data-testid="open-handbuilt-modal-btn"
              >
                Open Hand-Built Modal
              </button>
            </div>

            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Confirm Profile Updates"
              description="Review your account settings before saving changes to the system."
              initialFocusRef={modalInitialFocusEmail ? emailInputRef : undefined}
              footer={
                <>
                  <button
                    type="button"
                    className="pg-btn pg-btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="pg-btn pg-btn-primary"
                    onClick={() => {
                      alert('Changes saved!');
                      setIsModalOpen(false);
                    }}
                  >
                    Save Changes
                  </button>
                </>
              }
            >
              <div className="demo-input-group">
                <label htmlFor="user-name">Full Name</label>
                <input id="user-name" className="demo-input" placeholder="e.g. Alex Morgan" />
              </div>

              <div className="demo-input-group">
                <label htmlFor="user-email">Email Address</label>
                <input
                  ref={emailInputRef}
                  id="user-email"
                  type="email"
                  className="demo-input"
                  placeholder="alex@example.com"
                />
              </div>

              <div className="demo-input-group">
                <label htmlFor="user-role">Role</label>
                <select id="user-role" className="demo-input" style={{ cursor: 'pointer' }}>
                  <option value="lead">Lead Accessibility Engineer</option>
                  <option value="senior">Senior Frontend Engineer</option>
                  <option value="architect">UI Architect</option>
                </select>
              </div>
            </Modal>
          </div>

          {/* shadcn/ui Dialog */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">shadcn/ui (Radix UI) Dialog</h3>
              <span className="tag-shadcn">shadcn/ui</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
              Official shadcn/ui Dialog component powered by <code>@radix-ui/react-dialog</code>, wrapped with Tailwind CSS utility classes.
            </p>

            <ShadcnDialog>
              <ShadcnDialogTrigger asChild>
                <button
                  type="button"
                  className="pg-btn pg-btn-secondary"
                  id="open-shadcn-dialog-btn"
                  data-testid="open-shadcn-dialog-btn"
                >
                  Open shadcn/ui Dialog
                </button>
              </ShadcnDialogTrigger>

              <ShadcnDialogContent className="modal-container" style={{ position: 'relative' }}>
                <ShadcnDialogHeader>
                  <ShadcnDialogTitle className="modal-title">Radix UI Dialog Header</ShadcnDialogTitle>
                  <ShadcnDialogDescription className="modal-description">
                    This dialog is rendered by Radix UI primitive with aria-modal=&quot;true&quot; and automatic focus trapping.
                  </ShadcnDialogDescription>
                </ShadcnDialogHeader>

                <div className="demo-input-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="radix-project">Project Name</label>
                  <input id="radix-project" className="demo-input" defaultValue="FlyRank FE-05" />
                </div>

                <ShadcnDialogFooter style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="pg-btn pg-btn-primary"
                    onClick={() => alert('Radix action triggered')}
                  >
                    Confirm Action
                  </button>
                </ShadcnDialogFooter>
              </ShadcnDialogContent>
            </ShadcnDialog>
          </div>
        </div>
      </section>

      {/* SECTION 2: TABS */}
      <section className="playground-section" aria-labelledby="tabs-section-title">
        <div className="section-header">
          <div>
            <h2 id="tabs-section-title" className="section-title">2. Tabs (W3C APG Pattern)</h2>
            <p className="section-desc">
              Roving tabindex, arrow keys navigation with wrapping, Home/End support, and orientation options.
            </p>
          </div>
          <div className="keyboard-hints">
            <strong>Keyboard:</strong> <kbd>&larr;</kbd> <kbd>&rarr;</kbd> or <kbd>&uarr;</kbd> <kbd>&darr;</kbd> | <kbd>Home</kbd> first | <kbd>End</kbd> last | <kbd>Enter</kbd>/<kbd>Space</kbd> (in manual mode)
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="controls-toolbar">
          <label className="control-label">
            Orientation:
            <select
              value={tabsOrientation}
              onChange={(e) => setTabsOrientation(e.target.value as TabsOrientation)}
              className="control-select"
              aria-label="Select tabs orientation"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </label>

          <label className="control-label">
            Activation Mode:
            <select
              value={tabsActivationMode}
              onChange={(e) => setTabsActivationMode(e.target.value as TabsActivationMode)}
              className="control-select"
              aria-label="Select tabs activation mode"
            >
              <option value="automatic">Automatic (Arrow keys activate tab immediately)</option>
              <option value="manual">Manual (Arrow keys focus; Enter/Space activates)</option>
            </select>
          </label>
        </div>

        <div className="comparison-grid">
          {/* Hand-built Tabs */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Hand-Built W3C Tabs</h3>
              <span className="tag-handbuilt">Hand-Crafted</span>
            </div>

            <Tabs
              defaultValue="general"
              orientation={tabsOrientation}
              activationMode={tabsActivationMode}
            >
              <TabList aria-label="Account Settings Tabs">
                <Tab value="general">General</Tab>
                <Tab value="security">Security</Tab>
                <Tab value="billing">Billing</Tab>
                <Tab value="disabled-demo" disabled>Archived (Disabled)</Tab>
              </TabList>

              <TabPanel value="general">
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>General Preferences</h4>
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  Manage your display language, time zone, and notification preferences. The tabpanel has <code>tabIndex=&quot;0&quot;</code> so keyboard users can navigate into it.
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <button type="button" className="pg-btn pg-btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                    Edit Preferences
                  </button>
                </div>
              </TabPanel>

              <TabPanel value="security">
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Security &amp; 2FA</h4>
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  Multi-factor authentication is currently active. Session timeout is set to 30 minutes.
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <button type="button" className="pg-btn pg-btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                    Manage Keys
                  </button>
                </div>
              </TabPanel>

              <TabPanel value="billing">
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Subscription &amp; Invoices</h4>
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  Current plan: Enterprise Pro. Next renewal scheduled on November 1st, 2026.
                </p>
              </TabPanel>

              <TabPanel value="disabled-demo">
                <p style={{ margin: 0 }}>This panel is unreachable because the tab is disabled.</p>
              </TabPanel>
            </Tabs>
          </div>

          {/* shadcn/ui Tabs */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">shadcn/ui (Radix UI) Tabs</h3>
              <span className="tag-shadcn">shadcn/ui</span>
            </div>

            <ShadcnTabs defaultValue="overview">
              <ShadcnTabsList>
                <ShadcnTabsTrigger value="overview">Overview</ShadcnTabsTrigger>
                <ShadcnTabsTrigger value="analytics">Analytics</ShadcnTabsTrigger>
                <ShadcnTabsTrigger value="reports">Reports</ShadcnTabsTrigger>
              </ShadcnTabsList>

              <ShadcnTabsContent value="overview" className="tab-panel">
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Radix Overview Content</h4>
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  Radix UI provides automatic roving tabindex management via <code>RovingFocusGroup</code>.
                </p>
              </ShadcnTabsContent>

              <ShadcnTabsContent value="analytics" className="tab-panel">
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Analytics Insights</h4>
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  Traffic is up 42% over the last 30 days with 99.98% accessibility compliance.
                </p>
              </ShadcnTabsContent>

              <ShadcnTabsContent value="reports" className="tab-panel">
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc' }}>Compliance Reports</h4>
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  Export your WCAG 2.2 AA audit reports in PDF or JSON format.
                </p>
              </ShadcnTabsContent>
            </ShadcnTabs>
          </div>
        </div>
      </section>

      {/* SECTION 3: DISCLOSURE */}
      <section className="playground-section" aria-labelledby="disclosure-section-title">
        <div className="section-header">
          <div>
            <h2 id="disclosure-section-title" className="section-title">3. Disclosure (Show / Hide)</h2>
            <p className="section-desc">
              Native semantic button, aria-expanded, aria-controls, and inaccessible collapsed content.
            </p>
          </div>
          <div className="keyboard-hints">
            <strong>Keyboard:</strong> <kbd>Enter</kbd> or <kbd>Space</kbd> toggles | <kbd>Tab</kbd> skips collapsed content
          </div>
        </div>

        <div className="comparison-grid">
          {/* Compound Disclosure */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Controlled &amp; Compound Disclosure</h3>
              <span className="tag-handbuilt">Hand-Crafted</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="pg-btn pg-btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => setControlledDisclosureOpen(!controlledDisclosureOpen)}
                >
                  External Toggle ({controlledDisclosureOpen ? 'Close' : 'Open'})
                </button>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  State: <strong>{controlledDisclosureOpen ? 'Expanded' : 'Collapsed'}</strong>
                </span>
              </div>

              <Disclosure
                isOpen={controlledDisclosureOpen}
                onOpenChange={setControlledDisclosureOpen}
              >
                <DisclosureButton>
                  Keyboard Focus Accessibility Verification
                </DisclosureButton>
                <DisclosurePanel>
                  <p style={{ margin: '0 0 0.75rem 0' }}>
                    Notice that when this disclosure is collapsed, the interactive button and link below CANNOT be reached by pressing Tab. The HTML <code>hidden</code> attribute cleanly detaches them from keyboard order.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button type="button" className="pg-btn pg-btn-primary" style={{ padding: '0.4rem 0.8rem' }}>
                      Inner Button
                    </button>
                    <a href="#test-link" style={{ color: '#38bdf8', fontSize: '0.85rem' }}>
                      Sample Focusable Link &rarr;
                    </a>
                  </div>
                </DisclosurePanel>
              </Disclosure>
            </div>
          </div>

          {/* Simple Accordion Group */}
          <div className="demo-card">
            <div className="demo-card-header">
              <h3 className="demo-card-title">Accordion Group (SimpleDisclosure)</h3>
              <span className="tag-handbuilt">Hand-Crafted</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <SimpleDisclosure title="What makes a modal accessible?" defaultOpen={true}>
                A modal must have <code>role=&quot;dialog&quot;</code>, <code>aria-modal=&quot;true&quot;</code>, accessible labeling via <code>aria-labelledby</code>, Escape key dismissal, a robust focus trap, and reliable focus restoration upon closing.
              </SimpleDisclosure>

              <SimpleDisclosure title="Why use roving tabindex for tabs?">
                Roving tabindex ensures screen reader and keyboard users only Tab once into the tablist (landing on the selected tab), and can quickly Tab past it into the tabpanel without having to Tab through 10 individual tabs.
              </SimpleDisclosure>

              <SimpleDisclosure title="How does Disclosure prevent keyboard leaks?">
                Using the HTML <code>hidden</code> attribute or unmounting the panel completely removes all nested links, inputs, and buttons from the browser&apos;s focus chain and accessibility tree while collapsed.
              </SimpleDisclosure>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: VERIFICATION TABLE */}
      <section className="playground-section" aria-labelledby="audit-table-title">
        <h2 id="audit-table-title" className="section-title">4. Compliance Verification &amp; Feature Matrix</h2>
        <p className="section-desc">
          Automated and manual verification results across all required accessibility criteria.
        </p>

        <table className="audit-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Criterion / Behavior</th>
              <th>Implementation Technique</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Modal Dialog</strong></td>
              <td>Semantics &amp; Labeling</td>
              <td><code>role=&quot;dialog&quot;</code>, <code>aria-modal=&quot;true&quot;</code>, <code>aria-labelledby</code></td>
              <td><span className="status-check">&check; Verified</span></td>
            </tr>
            <tr>
              <td><strong>Modal Dialog</strong></td>
              <td>Focus Entry &amp; Trap</td>
              <td><code>requestAnimationFrame</code> focus entry + Tab/Shift+Tab cycle</td>
              <td><span className="status-check">&check; Verified</span></td>
            </tr>
            <tr>
              <td><strong>Modal Dialog</strong></td>
              <td>Dismissal &amp; Return Focus</td>
              <td>Escape listener + previous active element restoration ref</td>
              <td><span className="status-check">&check; Verified</span></td>
            </tr>
            <tr>
              <td><strong>Tabs</strong></td>
              <td>Semantics &amp; Relationships</td>
              <td><code>role=&quot;tablist&quot;</code>, <code>role=&quot;tab&quot;</code>, <code>role=&quot;tabpanel&quot;</code>, <code>aria-controls</code></td>
              <td><span className="status-check">&check; Verified</span></td>
            </tr>
            <tr>
              <td><strong>Tabs</strong></td>
              <td>Roving Tabindex &amp; Arrows</td>
              <td>ArrowLeft/Right, ArrowUp/Down, Home/End, automatic/manual</td>
              <td><span className="status-check">&check; Verified</span></td>
            </tr>
            <tr>
              <td><strong>Disclosure</strong></td>
              <td>Semantics &amp; Keys</td>
              <td>Native <code>&lt;button&gt;</code>, <code>aria-expanded</code>, <code>aria-controls</code>, Enter/Space</td>
              <td><span className="status-check">&check; Verified</span></td>
            </tr>
            <tr>
              <td><strong>Disclosure</strong></td>
              <td>Collapsed Non-Interactivity</td>
              <td>HTML <code>hidden</code> attribute removes elements from tab sequence</td>
              <td><span className="status-check">&check; Verified</span></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

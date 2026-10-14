import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
} from 'react';
import './disclosure.css';

interface DisclosureContextValue {
  isOpen: boolean;
  toggle: () => void;
  panelId: string;
  buttonId: string;
}

const DisclosureContext = createContext<DisclosureContextValue | null>(null);

function useDisclosureContext(componentName: string): DisclosureContextValue {
  const context = useContext(DisclosureContext);
  if (!context) {
    throw new Error(`<${componentName}> must be used within a <Disclosure> container.`);
  }
  return context;
}

export interface DisclosureProps {
  /** Initial open state when used uncontrolled (default: false) */
  defaultOpen?: boolean;
  /** Controlled open state */
  isOpen?: boolean;
  /** Callback fired when the open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Children containing DisclosureButton and DisclosurePanel */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Accessible Disclosure Root Component following W3C WAI-ARIA APG.
 * Manages open/collapsed state and connects the button to panel using stable IDs.
 */
export const Disclosure: React.FC<DisclosureProps> = ({
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onOpenChange,
  children,
  className = '',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const baseId = useId();
  const panelId = `disclosure-panel-${baseId}`;
  const buttonId = `disclosure-btn-${baseId}`;

  const toggle = useCallback(() => {
    const nextOpen = !isOpen;
    if (!isControlled) {
      setInternalIsOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  }, [isOpen, isControlled, onOpenChange]);

  return (
    <DisclosureContext.Provider value={{ isOpen, toggle, panelId, buttonId }}>
      <div className={`disclosure-root ${isOpen ? 'disclosure-open' : ''} ${className}`.trim()}>
        {children}
      </div>
    </DisclosureContext.Provider>
  );
};

export interface DisclosureButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Content rendered inside the button */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Whether to show the animated default chevron indicator (default: true) */
  showChevron?: boolean;
}

/**
 * Accessible Disclosure Button.
 * Uses a native `<button>` element with `aria-expanded` and `aria-controls`.
 * Supports Enter and Space through native button behavior.
 */
export const DisclosureButton: React.FC<DisclosureButtonProps> = ({
  children,
  className = '',
  showChevron = true,
  onClick,
  ...restProps
}) => {
  const { isOpen, toggle, panelId, buttonId } = useDisclosureContext('DisclosureButton');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggle();
    onClick?.(e);
  };

  return (
    <button
      id={buttonId}
      type="button"
      aria-expanded={isOpen}
      aria-controls={panelId}
      onClick={handleClick}
      className={`disclosure-button ${isOpen ? 'disclosure-button-expanded' : ''} ${className}`.trim()}
      data-testid="disclosure-button"
      data-state={isOpen ? 'open' : 'closed'}
      {...restProps}
    >
      <span className="disclosure-button-label">{children}</span>
      {showChevron && (
        <span
          className={`disclosure-chevron ${isOpen ? 'disclosure-chevron-open' : ''}`}
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      )}
    </button>
  );
};

export interface DisclosurePanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Content rendered inside the collapsible panel */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /**
   * If true, keeps element in DOM with HTML `hidden` attribute when closed.
   * If false, completely unmounts when closed.
   * In both cases, content is completely non-focusable while collapsed.
   * Default: true
   */
  keepMounted?: boolean;
}

/**
 * Accessible Disclosure Panel.
 * Uses HTML `hidden` attribute or unmounting to ensure contents are NOT keyboard-accessible
 * or exposed to assistive technologies when collapsed.
 */
export const DisclosurePanel: React.FC<DisclosurePanelProps> = ({
  children,
  className = '',
  keepMounted = true,
  ...restProps
}) => {
  const { isOpen, panelId, buttonId } = useDisclosureContext('DisclosurePanel');

  if (!isOpen && !keepMounted) {
    return null;
  }

  return (
    <div
      id={panelId}
      aria-labelledby={buttonId}
      hidden={!isOpen}
      className={`disclosure-panel ${isOpen ? 'disclosure-panel-open' : ''} ${className}`.trim()}
      data-testid="disclosure-panel"
      data-state={isOpen ? 'open' : 'closed'}
      {...restProps}
    >
      <div className="disclosure-panel-content">{children}</div>
    </div>
  );
};

export interface SimpleDisclosureProps {
  /** Header title of the disclosure */
  title: React.ReactNode;
  /** Collapsible body content */
  children: React.ReactNode;
  /** Initial open state (default: false) */
  defaultOpen?: boolean;
  /** Controlled open state */
  isOpen?: boolean;
  /** Change callback */
  onOpenChange?: (open: boolean) => void;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Convenient all-in-one Disclosure / Accordion Item component.
 */
export const SimpleDisclosure: React.FC<SimpleDisclosureProps> = ({
  title,
  children,
  defaultOpen = false,
  isOpen,
  onOpenChange,
  className = '',
}) => {
  return (
    <Disclosure
      defaultOpen={defaultOpen}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={className}
    >
      <DisclosureButton>{title}</DisclosureButton>
      <DisclosurePanel>{children}</DisclosurePanel>
    </Disclosure>
  );
};

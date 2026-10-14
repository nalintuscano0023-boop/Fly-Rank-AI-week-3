import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
} from 'react';
import './tabs.css';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

interface TabsContextValue {
  selectedTab: string;
  setSelectedTab: (value: string) => void;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  baseId: string;
  registerTab: (value: string, element: HTMLButtonElement | null) => void;
  unregisterTab: (value: string) => void;
  tabOrderRef: React.RefObject<string[]>;
  tabElementsRef: React.RefObject<Map<string, HTMLButtonElement>>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(componentName: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${componentName}> must be used within a <Tabs> container.`);
  }
  return context;
}

export interface TabsProps {
  /** The value of the initially selected tab (uncontrolled) */
  defaultValue?: string;
  /** The value of the currently selected tab (controlled) */
  value?: string;
  /** Callback fired when selected tab changes */
  onValueChange?: (value: string) => void;
  /** Layout orientation: 'horizontal' or 'vertical' (default: 'horizontal') */
  orientation?: TabsOrientation;
  /**
   * Keyboard selection behavior per W3C APG:
   * - 'automatic': Moving focus with arrow keys automatically activates the tab.
   * - 'manual': Arrow keys move focus; Enter or Space activates the tab.
   * Default: 'automatic'
   */
  activationMode?: TabsActivationMode;
  /** Tabs children (TabList and TabPanel elements) */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Accessible Tabs Root Component following W3C WAI-ARIA APG.
 */
export const Tabs: React.FC<TabsProps> = ({
  defaultValue = '',
  value: controlledValue,
  onValueChange,
  orientation = 'horizontal',
  activationMode = 'automatic',
  children,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const selectedTab = isControlled ? controlledValue : internalValue;

  const baseId = useId();
  const tabElementsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const tabOrderRef = useRef<string[]>([]);

  const setSelectedTab = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  const registerTab = useCallback((val: string, element: HTMLButtonElement | null) => {
    if (element) {
      tabElementsRef.current.set(val, element);
      if (!tabOrderRef.current.includes(val)) {
        tabOrderRef.current.push(val);
      }
    }
  }, []);

  const unregisterTab = useCallback((val: string) => {
    tabElementsRef.current.delete(val);
    tabOrderRef.current = tabOrderRef.current.filter((item) => item !== val);
  }, []);

  return (
    <TabsContext.Provider
      value={{
        selectedTab,
        setSelectedTab,
        orientation,
        activationMode,
        baseId,
        registerTab,
        unregisterTab,
        tabOrderRef,
        tabElementsRef,
      }}
    >
      <div
        className={`tabs-root tabs-orientation-${orientation} ${className}`.trim()}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export interface TabListProps {
  /** Accessible label describing the purpose of the tablist (required per W3C ARIA APG) */
  'aria-label': string;
  /** Tab elements */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
}

/**
 * TabList container element with `role="tablist"` and roving tabindex keyboard handler.
 */
export const TabList: React.FC<TabListProps> = ({
  'aria-label': ariaLabel,
  children,
  className = '',
}) => {
  const {
    orientation,
    activationMode,
    setSelectedTab,
    tabOrderRef,
    tabElementsRef,
  } = useTabsContext('TabList');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const tabValues = tabOrderRef.current;
    if (tabValues.length === 0) return;

    // Filter to only enabled tab values
    const enabledValues = tabValues.filter((val) => {
      const el = tabElementsRef.current.get(val);
      return el && !el.disabled;
    });

    if (enabledValues.length === 0) return;

    const focusedValue = enabledValues.find((val) => {
      const el = tabElementsRef.current.get(val);
      return el === document.activeElement;
    });

    const currentIndex = focusedValue !== undefined ? enabledValues.indexOf(focusedValue) : -1;
    let nextIndex = -1;

    const isHorizontal = orientation === 'horizontal';

    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    if (event.key === nextKey) {
      event.preventDefault();
      nextIndex = currentIndex === -1 || currentIndex === enabledValues.length - 1 ? 0 : currentIndex + 1;
    } else if (event.key === prevKey) {
      event.preventDefault();
      nextIndex = currentIndex === -1 || currentIndex === 0 ? enabledValues.length - 1 : currentIndex - 1;
    } else if (event.key === 'Home') {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      nextIndex = enabledValues.length - 1;
    }

    if (nextIndex !== -1) {
      const nextValue = enabledValues[nextIndex];
      const targetElement = tabElementsRef.current.get(nextValue);
      if (targetElement) {
        targetElement.focus();
        if (activationMode === 'automatic') {
          setSelectedTab(nextValue);
        }
      }
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      className={`tabs-list tabs-list-${orientation} ${className}`.trim()}
    >
      {children}
    </div>
  );
};

export interface TabProps {
  /** Unique value identifier for this tab */
  value: string;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Content rendered inside the tab button */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Individual Tab button element with `role="tab"` and roving tabindex.
 */
export const Tab: React.FC<TabProps> = ({
  value,
  disabled = false,
  children,
  className = '',
}) => {
  const {
    selectedTab,
    setSelectedTab,
    activationMode,
    baseId,
    registerTab,
    unregisterTab,
  } = useTabsContext('Tab');

  const tabRef = useRef<HTMLButtonElement | null>(null);
  const isSelected = selectedTab === value;

  const setRef = useCallback(
    (node: HTMLButtonElement | null) => {
      tabRef.current = node;
      if (node) {
        registerTab(value, node);
      } else {
        unregisterTab(value);
      }
    },
    [value, registerTab, unregisterTab]
  );

  const handleClick = () => {
    if (!disabled) {
      setSelectedTab(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // In manual activation mode, Enter or Space activates the tab
    if (activationMode === 'manual' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      if (!disabled) {
        setSelectedTab(value);
      }
    }
  };

  const tabId = `tab-${baseId}-${value}`;
  const panelId = `panel-${baseId}-${value}`;

  return (
    <button
      ref={setRef}
      role="tab"
      id={tabId}
      type="button"
      aria-selected={isSelected}
      aria-controls={panelId}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      tabIndex={isSelected ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`tab-trigger ${isSelected ? 'tab-selected' : ''} ${className}`.trim()}
      data-state={isSelected ? 'active' : 'inactive'}
      data-testid={`tab-${value}`}
    >
      {children}
    </button>
  );
};

export interface TabPanelProps {
  /** Value matching the corresponding Tab value */
  value: string;
  /** Content rendered inside the panel */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Whether to keep panel mounted in DOM with `hidden` attribute or unmount (default: true) */
  keepMounted?: boolean;
}

/**
 * TabPanel container element with `role="tabpanel"`.
 * Connected to tab via `aria-labelledby`.
 * Has `tabIndex={0}` per APG so keyboard users can scroll/read contents.
 */
export const TabPanel: React.FC<TabPanelProps> = ({
  value,
  children,
  className = '',
  keepMounted = true,
}) => {
  const { selectedTab, baseId } = useTabsContext('TabPanel');
  const isSelected = selectedTab === value;

  const tabId = `tab-${baseId}-${value}`;
  const panelId = `panel-${baseId}-${value}`;

  if (!isSelected && !keepMounted) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      hidden={!isSelected}
      className={`tab-panel ${isSelected ? 'tab-panel-active' : ''} ${className}`.trim()}
      data-state={isSelected ? 'active' : 'inactive'}
      data-testid={`tabpanel-${value}`}
    >
      {children}
    </div>
  );
};

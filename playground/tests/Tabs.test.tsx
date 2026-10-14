import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel } from '../components/tabs/Tabs';

describe('Tabs Component Accessibility & Keyboard Behavior', () => {
  it('renders correct tablist, tab, and tabpanel semantics with connected IDs', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabList aria-label="Settings categories">
          <Tab value="tab1">Profile</Tab>
          <Tab value="tab2">Account</Tab>
        </TabList>
        <TabPanel value="tab1">Profile Settings</TabPanel>
        <TabPanel value="tab2">Account Settings</TabPanel>
      </Tabs>
    );

    const tablist = screen.getByRole('tablist', { name: 'Settings categories' });
    expect(tablist).toBeInTheDocument();
    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');

    const tab1 = screen.getByRole('tab', { name: 'Profile' });
    const tab2 = screen.getByRole('tab', { name: 'Account' });

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab1).toHaveAttribute('tabIndex', '0');

    expect(tab2).toHaveAttribute('aria-selected', 'false');
    expect(tab2).toHaveAttribute('tabIndex', '-1');

    const panel1 = screen.getByRole('tabpanel', { name: 'Profile' });
    expect(panel1).toBeInTheDocument();
    expect(panel1).not.toHaveAttribute('hidden');

    // Tab 1 controls panel 1 and panel 1 is labelled by tab 1
    expect(tab1).toHaveAttribute('aria-controls', panel1.id);
    expect(panel1).toHaveAttribute('aria-labelledby', tab1.id);

    // Inactive panel is hidden
    const panel2 = screen.getByTestId('tabpanel-tab2');
    expect(panel2).toHaveAttribute('hidden');
  });

  it('navigates with ArrowRight and ArrowLeft in automatic activation mode with wrapping', () => {
    render(
      <Tabs defaultValue="first">
        <TabList aria-label="Horizontal tabs">
          <Tab value="first">First</Tab>
          <Tab value="second">Second</Tab>
          <Tab value="third">Third</Tab>
        </TabList>
        <TabPanel value="first">Content 1</TabPanel>
        <TabPanel value="second">Content 2</TabPanel>
        <TabPanel value="third">Content 3</TabPanel>
      </Tabs>
    );

    const tab1 = screen.getByRole('tab', { name: 'First' });
    const tab2 = screen.getByRole('tab', { name: 'Second' });
    const tab3 = screen.getByRole('tab', { name: 'Third' });

    tab1.focus();
    expect(document.activeElement).toBe(tab1);

    // ArrowRight moves to next tab and activates it
    fireEvent.keyDown(tab1, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tab2);
    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Second' })).not.toHaveAttribute('hidden');

    // ArrowRight again moves to third tab
    fireEvent.keyDown(tab2, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tab3);
    expect(tab3).toHaveAttribute('aria-selected', 'true');

    // ArrowRight wraps to first tab
    fireEvent.keyDown(tab3, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tab1);
    expect(tab1).toHaveAttribute('aria-selected', 'true');

    // ArrowLeft wraps from first to last tab
    fireEvent.keyDown(tab1, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tab3);
    expect(tab3).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to first and last tabs with Home and End keys', () => {
    render(
      <Tabs defaultValue="second">
        <TabList aria-label="Home and End navigation">
          <Tab value="first">Alpha</Tab>
          <Tab value="second">Beta</Tab>
          <Tab value="third">Gamma</Tab>
        </TabList>
        <TabPanel value="first">Panel Alpha</TabPanel>
        <TabPanel value="second">Panel Beta</TabPanel>
        <TabPanel value="third">Panel Gamma</TabPanel>
      </Tabs>
    );

    const tab2 = screen.getByRole('tab', { name: 'Beta' });
    const tab1 = screen.getByRole('tab', { name: 'Alpha' });
    const tab3 = screen.getByRole('tab', { name: 'Gamma' });

    tab2.focus();

    // Home key moves to first tab
    fireEvent.keyDown(tab2, { key: 'Home' });
    expect(document.activeElement).toBe(tab1);
    expect(tab1).toHaveAttribute('aria-selected', 'true');

    // End key moves to last tab
    fireEvent.keyDown(tab1, { key: 'End' });
    expect(document.activeElement).toBe(tab3);
    expect(tab3).toHaveAttribute('aria-selected', 'true');
  });

  it('supports vertical orientation with ArrowDown and ArrowUp', () => {
    render(
      <Tabs defaultValue="opt1" orientation="vertical">
        <TabList aria-label="Vertical navigation">
          <Tab value="opt1">Option 1</Tab>
          <Tab value="opt2">Option 2</Tab>
        </TabList>
        <TabPanel value="opt1">Vertical Panel 1</TabPanel>
        <TabPanel value="opt2">Vertical Panel 2</TabPanel>
      </Tabs>
    );

    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-orientation', 'vertical');

    const tab1 = screen.getByRole('tab', { name: 'Option 1' });
    const tab2 = screen.getByRole('tab', { name: 'Option 2' });

    tab1.focus();

    // ArrowDown moves down
    fireEvent.keyDown(tab1, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(tab2);
    expect(tab2).toHaveAttribute('aria-selected', 'true');

    // ArrowUp moves up
    fireEvent.keyDown(tab2, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(tab1);
    expect(tab1).toHaveAttribute('aria-selected', 'true');
  });

  it('supports manual activation mode where Enter or Space activates the tab', () => {
    const handleValueChange = vi.fn();
    render(
      <Tabs defaultValue="tab1" activationMode="manual" onValueChange={handleValueChange}>
        <TabList aria-label="Manual activation tabs">
          <Tab value="tab1">First Tab</Tab>
          <Tab value="tab2">Second Tab</Tab>
        </TabList>
        <TabPanel value="tab1">First Panel</TabPanel>
        <TabPanel value="tab2">Second Panel</TabPanel>
      </Tabs>
    );

    const tab1 = screen.getByRole('tab', { name: 'First Tab' });
    const tab2 = screen.getByRole('tab', { name: 'Second Tab' });

    tab1.focus();

    // In manual mode, ArrowRight moves focus but does NOT activate
    fireEvent.keyDown(tab1, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tab2);
    expect(tab2).toHaveAttribute('aria-selected', 'false');
    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(handleValueChange).not.toHaveBeenCalled();

    // Pressing Enter activates the focused tab
    fireEvent.keyDown(tab2, { key: 'Enter' });
    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(tab1).toHaveAttribute('aria-selected', 'false');
    expect(handleValueChange).toHaveBeenCalledWith('tab2');
  });

  it('skips disabled tabs during keyboard navigation', () => {
    render(
      <Tabs defaultValue="one">
        <TabList aria-label="Tabs with disabled item">
          <Tab value="one">One</Tab>
          <Tab value="two" disabled>Two (Disabled)</Tab>
          <Tab value="three">Three</Tab>
        </TabList>
        <TabPanel value="one">Panel 1</TabPanel>
        <TabPanel value="two">Panel 2</TabPanel>
        <TabPanel value="three">Panel 3</TabPanel>
      </Tabs>
    );

    const tab1 = screen.getByRole('tab', { name: 'One' });
    const tab2 = screen.getByRole('tab', { name: 'Two (Disabled)' });
    const tab3 = screen.getByRole('tab', { name: 'Three' });

    expect(tab2).toBeDisabled();

    tab1.focus();
    // ArrowRight should skip disabled tab 'two' and land on 'three'
    fireEvent.keyDown(tab1, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tab3);
    expect(tab3).toHaveAttribute('aria-selected', 'true');
  });

  it('supports controlled mode via value and onValueChange', () => {
    const ControlledTabs = () => {
      const [current, setCurrent] = useState('a');
      return (
        <div>
          <button onClick={() => setCurrent('b')}>Select B</button>
          <Tabs value={current} onValueChange={setCurrent}>
            <TabList aria-label="Controlled Tabs">
              <Tab value="a">A</Tab>
              <Tab value="b">B</Tab>
            </TabList>
            <TabPanel value="a">Panel A</TabPanel>
            <TabPanel value="b">Panel B</TabPanel>
          </Tabs>
        </div>
      );
    };

    render(<ControlledTabs />);
    const tabA = screen.getByRole('tab', { name: 'A' });
    const tabB = screen.getByRole('tab', { name: 'B' });

    expect(tabA).toHaveAttribute('aria-selected', 'true');
    expect(tabB).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(screen.getByText('Select B'));
    expect(tabA).toHaveAttribute('aria-selected', 'false');
    expect(tabB).toHaveAttribute('aria-selected', 'true');
  });
});

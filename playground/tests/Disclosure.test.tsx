import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  SimpleDisclosure,
} from '../components/disclosure/Disclosure';

describe('Disclosure Component Accessibility & Keyboard Behavior', () => {
  it('renders native button with correct initial aria-expanded and aria-controls attributes', () => {
    render(
      <Disclosure>
        <DisclosureButton>Frequently Asked Question</DisclosureButton>
        <DisclosurePanel>The answer is 42.</DisclosurePanel>
      </Disclosure>
    );

    const button = screen.getByRole('button', { name: /Frequently Asked Question/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');

    const panel = screen.getByTestId('disclosure-panel');
    expect(panel).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', button.id);

    // Collapsed panel has hidden attribute
    expect(panel).toHaveAttribute('hidden');
  });

  it('toggles open state on mouse click', () => {
    render(
      <Disclosure>
        <DisclosureButton>Toggle Section</DisclosureButton>
        <DisclosurePanel>Detailed content inside panel</DisclosurePanel>
      </Disclosure>
    );

    const button = screen.getByRole('button', { name: /Toggle Section/i });
    const panel = screen.getByTestId('disclosure-panel');

    // Initially closed
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('hidden');

    // Click to expand
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveAttribute('hidden');

    // Click again to collapse
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('hidden');
  });

  it('supports Enter and Space keyboard activation via native button semantics', () => {
    render(
      <Disclosure>
        <DisclosureButton>Keyboard Section</DisclosureButton>
        <DisclosurePanel>Panel content</DisclosurePanel>
      </Disclosure>
    );

    const button = screen.getByRole('button', { name: /Keyboard Section/i });
    const panel = screen.getByTestId('disclosure-panel');

    button.focus();
    expect(document.activeElement).toBe(button);

    // Native buttons fire click on Enter
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveAttribute('hidden');

    // Native buttons fire click on Space
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('hidden');
  });

  it('ensures hidden content is not keyboard-accessible while collapsed', () => {
    render(
      <div>
        <button data-testid="before-btn">Before</button>
        <Disclosure>
          <DisclosureButton>Expand for Secret Link</DisclosureButton>
          <DisclosurePanel>
            <a href="https://example.com" data-testid="inner-link">
              Hidden Link
            </a>
            <button data-testid="inner-btn">Hidden Action</button>
          </DisclosurePanel>
        </Disclosure>
        <button data-testid="after-btn">After</button>
      </div>
    );

    const panel = screen.getByTestId('disclosure-panel');
    expect(panel).toHaveAttribute('hidden');

    // In DOM, elements with hidden attribute or inside hidden containers
    // are not accessible according to accessibility standards.
    const innerLink = screen.getByTestId('inner-link');
    const innerBtn = screen.getByTestId('inner-btn');

    // Both inner interactive elements are descendants of the hidden panel
    expect(panel).toContainElement(innerLink);
    expect(panel).toContainElement(innerBtn);
    expect(panel.hasAttribute('hidden')).toBe(true);

    // Expand
    fireEvent.click(screen.getByRole('button', { name: /Expand for Secret Link/i }));
    expect(panel).not.toHaveAttribute('hidden');
  });

  it('supports unmounting panel content when keepMounted is false', () => {
    render(
      <Disclosure>
        <DisclosureButton>Unmount Test</DisclosureButton>
        <DisclosurePanel keepMounted={false}>
          <p data-testid="unmounted-text">Only visible when open</p>
        </DisclosurePanel>
      </Disclosure>
    );

    // When keepMounted={false} and closed, content is completely absent from DOM
    expect(screen.queryByTestId('unmounted-text')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Unmount Test/i }));
    expect(screen.getByTestId('unmounted-text')).toBeInTheDocument();
  });

  it('works with SimpleDisclosure component', () => {
    render(
      <SimpleDisclosure title="Simple Disclosure Title" defaultOpen={true}>
        <p>Simple body content</p>
      </SimpleDisclosure>
    );

    const button = screen.getByRole('button', { name: /Simple Disclosure Title/i });
    expect(button).toHaveAttribute('aria-expanded', 'true');

    const panel = screen.getByTestId('disclosure-panel');
    expect(panel).not.toHaveAttribute('hidden');
    expect(screen.getByText('Simple body content')).toBeInTheDocument();
  });

  it('supports controlled open state via isOpen and onOpenChange', () => {
    const ControlledComponent = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button data-testid="external-btn" onClick={() => setIsOpen(!isOpen)}>
            External Control
          </button>
          <Disclosure isOpen={isOpen} onOpenChange={setIsOpen}>
            <DisclosureButton>Controlled Header</DisclosureButton>
            <DisclosurePanel>Controlled Body</DisclosurePanel>
          </Disclosure>
        </div>
      );
    };

    render(<ControlledComponent />);
    const button = screen.getByRole('button', { name: /Controlled Header/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByTestId('external-btn'));
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});

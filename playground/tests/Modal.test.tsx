import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useState, useRef } from 'react';
import { Modal } from '../components/modal/Modal';

describe('Modal Component Accessibility & Keyboard Behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.overflow = '';
  });

  it('renders with correct dialog semantics and accessible labeling', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Accessible Modal Title"
        description="This is a test description."
      >
        <p>Modal content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Verify title and description are correctly linked via ARIA
    const title = screen.getByRole('heading', { level: 2, name: 'Accessible Modal Title' });
    expect(dialog).toHaveAttribute('aria-labelledby', title.id);

    const description = screen.getByText('This is a test description.');
    expect(dialog).toHaveAttribute('aria-describedby', description.id);
  });

  it('does not render into DOM when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Hidden Modal">
        <p>Modal body</p>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('moves focus into the dialog on open (first interactive element)', () => {
    const TestComponent = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button data-testid="open-btn" onClick={() => setOpen(true)}>
            Open
          </button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="Test Focus">
            <input data-testid="first-input" />
            <button data-testid="second-button">Submit</button>
          </Modal>
        </div>
      );
    };

    render(<TestComponent />);

    const openBtn = screen.getByTestId('open-btn');
    fireEvent.click(openBtn);

    // Run animation frames for initial focus
    act(() => {
      vi.runAllTimers();
    });

    const closeBtn = screen.getByTestId('modal-close-button');
    // Close button is the first interactive element in modal header
    expect(document.activeElement).toBe(closeBtn);
  });

  it('moves focus to initialFocusRef when specified', () => {
    const TestComponent = () => {
      const [open, setOpen] = useState(false);
      const inputRef = useRef<HTMLInputElement>(null);

      return (
        <div>
          <button data-testid="open-btn" onClick={() => setOpen(true)}>
            Open
          </button>
          <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Initial Ref Test"
            initialFocusRef={inputRef}
          >
            <input ref={inputRef} data-testid="target-input" />
          </Modal>
        </div>
      );
    };

    render(<TestComponent />);
    fireEvent.click(screen.getByTestId('open-btn'));

    act(() => {
      vi.runAllTimers();
    });

    expect(document.activeElement).toBe(screen.getByTestId('target-input'));
  });

  it('closes when the Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Test">
        <p>Press Escape to dismiss</p>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('traps focus inside the modal on Tab and Shift+Tab', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Focus Trap Test"
        footer={<button data-testid="footer-btn">Done</button>}
      >
        <button data-testid="inner-btn">Action</button>
      </Modal>
    );

    act(() => {
      vi.runAllTimers();
    });

    const closeBtn = screen.getByTestId('modal-close-button');
    const innerBtn = screen.getByTestId('inner-btn');
    const footerBtn = screen.getByTestId('footer-btn');

    expect(innerBtn).toBeInTheDocument();

    // Start focus at last element
    footerBtn.focus();
    expect(document.activeElement).toBe(footerBtn);

    // Pressing Tab on last element wraps focus to first element (closeBtn)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(closeBtn);

    // Pressing Shift+Tab on first element wraps focus to last element (footerBtn)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(footerBtn);
  });

  it('returns focus to the element that opened it when closed', () => {
    const TestWrapper = () => {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button data-testid="trigger-btn" onClick={() => setIsOpen(true)}>
            Open Dialog
          </button>
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Focus Return Test"
          >
            <button data-testid="action-btn">Action</button>
          </Modal>
        </div>
      );
    };

    render(<TestWrapper />);

    const triggerBtn = screen.getByTestId('trigger-btn');
    triggerBtn.focus();
    expect(document.activeElement).toBe(triggerBtn);

    // Open modal
    fireEvent.click(triggerBtn);
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close modal via close button
    const closeBtn = screen.getByTestId('modal-close-button');
    fireEvent.click(closeBtn);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Focus should be returned to trigger button
    expect(document.activeElement).toBe(triggerBtn);
  });

  it('locks body scroll when opened and restores it when closed', () => {
    const TestComponent = () => {
      const [open, setOpen] = useState(true);
      return (
        <div>
          <button data-testid="toggle-btn" onClick={() => setOpen(false)}>
            Close
          </button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="Scroll Lock">
            <p>Body scroll locked</p>
          </Modal>
        </div>
      );
    };

    render(<TestComponent />);
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(screen.getByTestId('toggle-btn'));
    expect(document.body.style.overflow).toBe('');
  });

  it('closes on backdrop click when closeOnBackdropClick is true', () => {
    const handleClose = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Backdrop Test"
        closeOnBackdropClick={true}
      >
        <p>Click outside</p>
      </Modal>
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../components/ui/tabs';

describe('shadcn/ui (Radix UI) Component Behavior', () => {
  it('renders shadcn/ui Dialog with trigger and opens on user click', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button data-testid="shadcn-dialog-trigger">Open shadcn Dialog</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>shadcn Dialog Title</DialogTitle>
            <DialogDescription>shadcn Dialog Description</DialogDescription>
          </DialogHeader>
          <p>Dialog body text</p>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByTestId('shadcn-dialog-trigger');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Click trigger to open dialog
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('shadcn Dialog Title')).toBeInTheDocument();
  });

  it('renders shadcn/ui Tabs and allows tab switching', () => {
    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account Panel</TabsContent>
        <TabsContent value="password">Password Panel</TabsContent>
      </Tabs>
    );

    const accountTab = screen.getByRole('tab', { name: 'Account' });
    const passwordTab = screen.getByRole('tab', { name: 'Password' });

    expect(accountTab).toHaveAttribute('aria-selected', 'true');
    expect(passwordTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Account Panel')).toBeInTheDocument();

    // Radix UI activates tabs on mouseDown (left click)
    fireEvent.mouseDown(passwordTab, { button: 0, ctrlKey: false });
    expect(accountTab).toHaveAttribute('aria-selected', 'false');
    expect(passwordTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Password Panel')).toBeInTheDocument();
  });
});

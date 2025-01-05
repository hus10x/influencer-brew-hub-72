import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PasswordChangeForm } from '../PasswordChangeForm';
import { toast } from 'sonner';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn()
    }
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('PasswordChangeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<PasswordChangeForm />);
    expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
  });

  it('validates password requirements', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    render(<PasswordChangeForm />);

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    fireEvent.blur(newPasswordInput);

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('handles successful password update', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    supabase.auth.updateUser.mockResolvedValueOnce({ error: null });

    render(<PasswordChangeForm />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: 'OldPass123!' }
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'NewPass123!' }
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'NewPass123!' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully');
    });
  });

  it('handles password update error', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    supabase.auth.updateUser.mockRejectedValueOnce(new Error('Update failed'));

    render(<PasswordChangeForm />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: 'OldPass123!' }
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'NewPass123!' }
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'NewPass123!' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update password. Please try again.');
    });
  });

  it('handles loading state correctly', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    supabase.auth.updateUser.mockImplementation(() => new Promise(() => {}));

    render(<PasswordChangeForm />);

    fireEvent.change(screen.getByLabelText(/Current Password/i), {
      target: { value: 'OldPass123!' }
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'NewPass123!' }
    });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), {
      target: { value: 'NewPass123!' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    expect(screen.getByText(/Updating.../i)).toBeInTheDocument();
  });
});
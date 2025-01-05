import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PasswordChangeForm } from '../PasswordChangeForm';
import { toast } from 'sonner';

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

describe('PasswordChangeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields', () => {
    render(<PasswordChangeForm />);
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<PasswordChangeForm />);
    const submitButton = screen.getByRole('button', { name: /update password/i });
    
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/please confirm your password/i)).toBeInTheDocument();
  });

  it('validates password requirements', async () => {
    render(<PasswordChangeForm />);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    
    fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    fireEvent.blur(newPasswordInput);
    
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('validates password matching', async () => {
    render(<PasswordChangeForm />);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    fireEvent.change(newPasswordInput, { target: { value: 'StrongPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });
    fireEvent.blur(confirmPasswordInput);
    
    expect(await screen.findByText(/passwords don't match/i)).toBeInTheDocument();
  });
});
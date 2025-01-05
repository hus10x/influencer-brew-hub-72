import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import { SettingsLayout } from '../SettingsLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Create a more complete mock implementation
const createMockQueryBuilder = () => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  match: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  filter: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  containedBy: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  not: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  then: vi.fn().mockImplementation((callback) => Promise.resolve(callback({ data: [], error: null }))),
  catch: vi.fn().mockReturnThis(),
  finally: vi.fn().mockReturnThis(),
});

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      ...createMockQueryBuilder(),
      // Fix: Create proper URL object instead of string
      url: new URL('https://example.com'),
      headers: {},
    })),
  },
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Settings Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('should render all settings sections', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsLayout />
      </QueryClientProvider>
    );

    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('should switch between tabs', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsLayout />
      </QueryClientProvider>
    );

    // Click History tab
    fireEvent.click(screen.getByText('History'));
    await waitFor(() => {
      expect(screen.getByText('Campaign History')).toBeInTheDocument();
    });

    // Click Security tab
    fireEvent.click(screen.getByText('Security'));
    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });
  });

  it('should handle password change submission', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsLayout />
      </QueryClientProvider>
    );

    // Fill in password form
    fireEvent.input(screen.getByPlaceholderText(/current password/i), {
      target: { value: 'CurrentPass123!' },
    });
    fireEvent.input(screen.getByPlaceholderText(/new password/i), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.input(screen.getByPlaceholderText(/confirm.*password/i), {
      target: { value: 'NewPass123!' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully');
    });
  });

  it('should display campaign and collaboration history', async () => {
    // Mock successful data fetch
    vi.mocked(supabase.from).mockImplementation((table: string) => ({
      ...createMockQueryBuilder(),
      url: new URL('https://example.com'),
      headers: {},
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            title: 'Test Campaign',
            status: 'completed',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
          },
        ],
        error: null,
      }),
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <SettingsLayout />
      </QueryClientProvider>
    );

    // Navigate to History tab
    fireEvent.click(screen.getByText('History'));

    await waitFor(() => {
      expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    });
  });

  // Add error handling test
  it('should handle data fetching errors', async () => {
    // Mock error response
    vi.mocked(supabase.from).mockImplementation((table: string) => ({
      ...createMockQueryBuilder(),
      url: new URL('https://example.com'),
      headers: {},
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch data' },
      }),
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <SettingsLayout />
      </QueryClientProvider>
    );

    // Navigate to History tab
    fireEvent.click(screen.getByText('History'));

    await waitFor(() => {
      expect(screen.getByText(/error loading history/i)).toBeInTheDocument();
    });
  });
});
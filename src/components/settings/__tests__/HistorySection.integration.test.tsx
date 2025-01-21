import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HistorySection } from '../HistorySection';
import { renderWithQuery } from './utils/testUtils';
import { mockSupabase } from './mocks/supabaseMock';
import { createMockQueryBuilder } from './utils/testUtils';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('HistorySection Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders campaign history correctly', async () => {
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => ({
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
            created_at: '2024-01-01',
            updated_at: '2024-01-02',
            status: 'completed'
          }
        ],
        error: null
      }),
    }));

    renderWithQuery(<HistorySection />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    });
  });

  it('handles error state correctly', async () => {
    vi.mocked(mockSupabase.from).mockImplementation((table: string) => ({
      ...createMockQueryBuilder(),
      url: new URL('https://example.com'),
      headers: {},
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch data' }
      }),
    }));

    renderWithQuery(<HistorySection />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading history/i)).toBeInTheDocument();
    });
  });
});
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HistorySection } from '../HistorySection';
import { useQuery } from '@tanstack/react-query';

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

describe('HistorySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    (useQuery as any).mockReturnValue({ isLoading: true });
    render(<HistorySection />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    (useQuery as any).mockReturnValue({ 
      isLoading: false, 
      data: [] 
    });
    render(<HistorySection />);
    expect(screen.getByText(/no history found/i)).toBeInTheDocument();
  });

  it('renders campaign history', () => {
    const mockCampaigns = [
      {
        id: '1',
        title: 'Test Campaign',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ];

    (useQuery as any).mockReturnValue({
      isLoading: false,
      data: mockCampaigns,
    });

    render(<HistorySection />);
    expect(screen.getByText('Test Campaign')).toBeInTheDocument();
  });

  it('handles error state', () => {
    (useQuery as any).mockReturnValue({
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    render(<HistorySection />);
    expect(screen.getByText(/error loading history/i)).toBeInTheDocument();
  });
});
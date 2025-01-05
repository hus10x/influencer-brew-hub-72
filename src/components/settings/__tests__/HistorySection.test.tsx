import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HistorySection } from '../HistorySection';

// Mock the useQuery hook
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn()
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQuery = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('HistorySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    const { useQuery } = require('@tanstack/react-query');
    useQuery.mockReturnValue({ isLoading: true });

    renderWithQuery(<HistorySection />);
    expect(screen.getByTestId('history-loading')).toBeInTheDocument();
  });

  it('renders campaign history correctly', () => {
    const { useQuery } = require('@tanstack/react-query');
    useQuery.mockReturnValue({
      data: [
        {
          id: '1',
          title: 'Test Campaign',
          created_at: '2024-01-01',
          updated_at: '2024-01-02',
          status: 'completed'
        }
      ],
      isLoading: false
    });

    renderWithQuery(<HistorySection />);
    expect(screen.getByText('Test Campaign')).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    const { useQuery } = require('@tanstack/react-query');
    useQuery.mockReturnValue({ data: [], isLoading: false });

    renderWithQuery(<HistorySection />);
    expect(screen.getByText(/No history found/i)).toBeInTheDocument();
  });

  it('handles error state correctly', () => {
    const { useQuery } = require('@tanstack/react-query');
    useQuery.mockReturnValue({
      error: new Error('Failed to fetch'),
      isLoading: false
    });

    renderWithQuery(<HistorySection />);
    expect(screen.getByText(/Error loading history/i)).toBeInTheDocument();
  });
});
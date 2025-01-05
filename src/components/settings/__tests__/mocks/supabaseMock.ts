import { vi } from 'vitest';
import { createMockQueryBuilder } from '../utils/testUtils';

export const mockSupabase = {
  from: vi.fn((table: string) => ({
    ...createMockQueryBuilder(),
    url: new URL('https://example.com'),
    headers: {},
  })),
};
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SettingsLayout } from '../SettingsLayout';
import { renderWithQuery } from './utils/testUtils';

describe('SettingsLayout', () => {
  it('renders all settings sections', () => {
    renderWithQuery(<SettingsLayout />);

    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('should switch between tabs', async () => {
    renderWithQuery(<SettingsLayout />);

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
});
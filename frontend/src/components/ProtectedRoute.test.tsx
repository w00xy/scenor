import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { getCookieMock } = vi.hoisted(() => ({
  getCookieMock: vi.fn(),
}));

vi.mock('universal-cookie', () => {
  class MockCookies {
    get = getCookieMock;
  }

  return {
    default: MockCookies,
  };
});

import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    getCookieMock.mockReset();
  });

  it('renders nested route when access token exists', () => {
    getCookieMock.mockReturnValue('token-123');

    render(
      <MemoryRouter initialEntries={['/overview']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/overview" element={<div>Private Page</div>} />
          </Route>
          <Route path="/auth" element={<div>Auth Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Private Page')).toBeInTheDocument();
    expect(screen.queryByText('Auth Page')).not.toBeInTheDocument();
  });

  it('redirects to /auth when access token is missing', () => {
    getCookieMock.mockReturnValue(undefined);

    render(
      <MemoryRouter initialEntries={['/overview']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/overview" element={<div>Private Page</div>} />
          </Route>
          <Route path="/auth" element={<div>Auth Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Auth Page')).toBeInTheDocument();
    expect(screen.queryByText('Private Page')).not.toBeInTheDocument();
  });
});

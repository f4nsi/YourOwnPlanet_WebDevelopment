import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

// Mock CSS and image
jest.mock('../css/Header.css', () => ({}));
jest.mock('../image/logo.png', () => 'mocked-logo.png');

// Mock handleLogout
jest.mock('../HomepageAfterLogin', () => ({
  handleLogout: jest.fn()
}));

const renderHeader = (userName = null) => {
  return render(
    <BrowserRouter>
      <Header userName={userName} />
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  describe('Logo Tests', () => {
    test('renders logo with correct link and image', () => {
      renderHeader();
      const logoLink = screen.getByRole('link', { name: /your own planet/i });
      const logoImage = screen.getByAltText('Your Own Planet');
      
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
      expect(logoImage).toBeInTheDocument();
      expect(logoImage).toHaveClass('logo-image');
    });
  });

  describe('Non-authenticated User Navigation', () => {
    beforeEach(() => {
      renderHeader(null);
    });

    test('renders correct links for non-authenticated users', () => {
      expect(screen.getByText(/home/i)).toBeInTheDocument();
      expect(screen.getByText(/about/i)).toBeInTheDocument();
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });
  });

  describe('Authenticated User Navigation', () => {
    beforeEach(() => {
      renderHeader('testUser');
    });

    test('renders correct links for authenticated users', () => {
      expect(screen.getByText(/footprints/i)).toBeInTheDocument();
      expect(screen.getByText(/search/i)).toBeInTheDocument();
      expect(screen.getByText(/profile/i)).toBeInTheDocument();
      expect(screen.getByText(/sign out/i)).toBeInTheDocument();
    });

    test('each authenticated link has correct href', () => {
      expect(screen.getByText(/footprints/i)).toHaveAttribute('href', '/HomepageAfterLogin');
      expect(screen.getByText(/search/i)).toHaveAttribute('href', '/search');
      expect(screen.getByText(/profile/i)).toHaveAttribute('href', '/profile');
      expect(screen.getByText(/sign out/i)).toHaveAttribute('href', '/');
    });
  });

  describe('Structure Tests', () => {
    test('renders nav elements correctly', () => {
      const { container } = renderHeader();
      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(container.querySelector('.nav-links')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles null userName gracefully', () => {
      renderHeader(null);
      expect(screen.queryByText(/sign out/i)).not.toBeInTheDocument();
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });
  });
});
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

// Mock CSS
jest.mock('../css/Footer.css', () => ({}));

describe('Footer Component', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  test('renders the About Us section with correct content', () => {
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('We help travelers create meaningful journeys.')).toBeInTheDocument();
  });

  test('renders the Contact section with correct content', () => {
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Email: info@yourownplanet.com')).toBeInTheDocument();
  });

  test('renders the Follow Us section with correct content', () => {
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
    expect(screen.getByText('Instagram: YourOwnPlanet')).toBeInTheDocument();
  });

  test('renders the copyright notice', () => {
    expect(screen.getByText(/© 2024 Your Own Planet\. All rights reserved\./)).toBeInTheDocument();
  });

  test('renders with correct structure', () => {
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer.querySelector('.footer-content')).toBeInTheDocument();
    expect(footer.querySelector('.footer-bottom')).toBeInTheDocument();
  });

  test('renders all footer sections', () => {
    const footerSections = document.querySelectorAll('.footer-section');
    expect(footerSections).toHaveLength(3);
  });

  test('renders all footer headings with correct styling class', () => {
    const footerHeadings = document.querySelectorAll('.footer-head');
    expect(footerHeadings).toHaveLength(3);
  });
});
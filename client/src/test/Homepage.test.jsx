import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Homepage from '../Homepage';

// Mock CSS
jest.mock('../css/Homepage.css', () => ({}));

// Mock Layout component
jest.mock('../Layout', () => {
  return function MockLayout({ children }) {
    return <div data-testid="mock-layout">{children}</div>;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon">Upload Icon</div>,
  FileText: () => <div data-testid="filetext-icon">FileText Icon</div>,
  Image: () => <div data-testid="image-icon">Image Icon</div>,
}));

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Homepage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderHomepage = () => {
    return render(
      <MemoryRouter>
        <Homepage />
      </MemoryRouter>
    );
  };

  describe('Header Content', () => {
    test('renders main title and subtitle', () => {
      renderHomepage();
      expect(screen.getByText('Your Own Planet')).toBeInTheDocument();
      expect(screen.getByText('Explore - Record - Remember')).toBeInTheDocument();
    });

    test('renders introduction text', () => {
      renderHomepage();
      expect(screen.getByText(/The platform where every journey/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('navigates to signin page when clicking get started button', () => {
      renderHomepage();
      const button = screen.getByText("Let's get started!");
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });

  describe('Detailed Introduction', () => {
    test('renders detailed introduction text', () => {
      renderHomepage();
      expect(screen.getByText(/Here, each destination transforms/)).toBeInTheDocument();
      expect(screen.getByText(/This is more than just a travel platform/)).toBeInTheDocument();
    });
  });

  describe('Feature Grid', () => {
    beforeEach(() => {
      renderHomepage();
    });

    test('renders all feature items', () => {
      expect(screen.getByText('Capture Beautiful Moments')).toBeInTheDocument();
      expect(screen.getByText('Record Your Stories')).toBeInTheDocument();
      expect(screen.getByText('Build Your Collection')).toBeInTheDocument();
    });

    test('renders feature descriptions', () => {
      expect(screen.getByText(/Save scenic views/)).toBeInTheDocument();
      expect(screen.getByText(/Write down your thoughts/)).toBeInTheDocument();
      expect(screen.getByText(/Upload and organize your travel memories/)).toBeInTheDocument();
    });

    test('renders icons', () => {
      expect(screen.getByTestId('image-icon')).toBeInTheDocument();
      expect(screen.getByTestId('filetext-icon')).toBeInTheDocument();
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    test('renders with Layout component', () => {
      renderHomepage();
      expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
    });

    test('renders all major sections', () => {
      const { container } = renderHomepage();
      expect(container.querySelector('.intro-box')).toBeInTheDocument();
      expect(container.querySelector('.detail-intro')).toBeInTheDocument();
      expect(container.querySelector('.feature-grid')).toBeInTheDocument();
    });

    test('renders intro box sections', () => {
      const { container } = renderHomepage();
      expect(container.querySelector('.intro-box-top')).toBeInTheDocument();
      expect(container.querySelector('.intro-box-bottom')).toBeInTheDocument();
    });
  });

  describe('Responsiveness and Styling', () => {
    test('feature grid contains correct number of items', () => {
      const { container } = renderHomepage();
      const featureItems = container.querySelectorAll('.feature-item');
      expect(featureItems).toHaveLength(3);
    });

    test('each feature item has an icon', () => {
      const { container } = renderHomepage();
      const featureIcons = container.querySelectorAll('.feature-icon');
      expect(featureIcons).toHaveLength(3);
    });
  });
});
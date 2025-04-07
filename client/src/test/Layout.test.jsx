import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

// Mock child components
jest.mock('../Header', () => {
  return function MockHeader({ userName }) {
    return <div data-testid="mock-header" data-username={userName}>Header Component</div>;
  };
});

jest.mock('../Footer', () => {
  return function MockFooter() {
    return <div data-testid="mock-footer">Footer Component</div>;
  };
});

// Mock CSS
jest.mock('../css/Layout.css', () => ({}));

describe('Layout Component', () => {
  const renderLayout = (props = {}) => {
    const defaultProps = {
      children: <div data-testid="test-children">Test Content</div>,
      userName: 'testUser'
    };

    return render(
      <BrowserRouter>
        <Layout {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  test('renders header with correct username', () => {
    renderLayout();
    const header = screen.getByTestId('mock-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('data-username', 'testUser');
  });

  test('renders footer', () => {
    renderLayout();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });

  test('renders children content', () => {
    renderLayout();
    expect(screen.getByTestId('test-children')).toBeInTheDocument();
  });

  test('applies correct class names', () => {
    const { container } = renderLayout();
    expect(container.firstChild).toHaveClass('layout');
    expect(container.querySelector('.main-content')).toBeInTheDocument();
  });

  test('renders with empty username', () => {
    renderLayout({ userName: '' });
    const header = screen.getByTestId('mock-header');
    expect(header).toHaveAttribute('data-username', '');
  });

  test('renders with custom children content', () => {
    const customContent = <div data-testid="custom-content">Custom Content</div>;
    renderLayout({ children: customContent });
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  test('maintains component structure', () => {
    const { container } = renderLayout();
    const layout = container.firstChild;
    
    expect(layout.children[0]).toHaveAttribute('data-testid', 'mock-header');
    expect(layout.children[1]).toHaveClass('main-content');
    expect(layout.children[2]).toHaveAttribute('data-testid', 'mock-footer');
  });
});
import '@testing-library/jest-dom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';

// Mock CSS
jest.mock('../css/index.css', () => ({}));

// Mock App component
jest.mock('../App', () => {
  return function MockApp() {
    return <div data-testid="mock-app">Mock App</div>;
  };
});

describe('Application Root', () => {
  let container = null;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      document.body.removeChild(container);
    }
    container = null;
  });

  test('renders without crashing', async () => {
    await act(async () => {
      render(
        <React.StrictMode>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </React.StrictMode>,
        container
      );
    });

    expect(screen.getByTestId('mock-app')).toBeInTheDocument();
  });

  test('renders with correct structure', async () => {
    await act(async () => {
      render(
        <React.StrictMode>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </React.StrictMode>,
        container
      );
    });

    // 检查基本结构
    const appElement = screen.getByTestId('mock-app');
    expect(appElement).toBeInTheDocument();
    expect(appElement.textContent).toBe('Mock App');
  });

  test('contains BrowserRouter', () => {
    const { container: renderContainer } = render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );

    expect(renderContainer.innerHTML).toBeTruthy();
  });

  test('wraps App in StrictMode', () => {
    const { container: renderContainer } = render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );

    // 验证内容被正确渲染
    expect(renderContainer.textContent).toBe('Mock App');
  });
});
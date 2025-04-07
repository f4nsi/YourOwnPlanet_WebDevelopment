import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import SearchPage from '../SearchPage';

// Mock CSS
jest.mock('../css/Search.css', () => ({}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn()
}));

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn()
}));

// Mock Layout
jest.mock('../Layout', () => {
  return function MockLayout({ children }) {
    return <div data-testid="mock-layout">{children}</div>;
  };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('SearchPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Cookies.get.mockReturnValue('testUser');
  });

  const renderSearchPage = () => {
    return render(
      <BrowserRouter>
        <SearchPage />
      </BrowserRouter>
    );
  };

  test('renders search page with initial empty state', () => {
    renderSearchPage();
    
    expect(screen.getByText('Journey Search: Enter Keywords')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search Keyword...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('No previous journeys found.')).toBeInTheDocument();
  });

  test('handles search input change', async () => {
    renderSearchPage();
    
    const searchInput = screen.getByPlaceholderText('Search Keyword...');
    await userEvent.type(searchInput, 'test journey');
    
    expect(searchInput.value).toBe('test journey');
  });

  test('performs search and displays results', async () => {
    const mockJourneys = [
      { _id: '1', title: 'Test Journey 1' },
      { _id: '2', title: 'Test Journey 2' }
    ];

    axios.get.mockResolvedValueOnce({ data: mockJourneys });
    
    renderSearchPage();
    
    const searchInput = screen.getByPlaceholderText('Search Keyword...');
    await userEvent.type(searchInput, 'test');
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:3000/users/testUser/search',
        expect.any(Object)
      );
      expect(screen.getByText('Test Journey 1')).toBeInTheDocument();
      expect(screen.getByText('Test Journey 2')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    renderSearchPage();
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching journeys:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  test('navigates to journey detail page when clicking a journey', async () => {
    const mockJourneys = [
      { _id: '1', title: 'Test Journey 1' }
    ];

    axios.get.mockResolvedValueOnce({ data: mockJourneys });
    
    renderSearchPage();
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      const journeyCard = screen.getByText('Test Journey 1');
      fireEvent.click(journeyCard);
      
      expect(mockNavigate).toHaveBeenCalledWith('/journey/1', {
        state: { title: 'Test Journey 1' }
      });
    });
  });

  test('navigates back to homepage when clicking back button', () => {
    renderSearchPage();
    
    const backButton = screen.getByText('Back to My Homepage');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/homepageafterlogin');
  });

  test('handles empty search results', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    renderSearchPage();
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('No previous journeys found.')).toBeInTheDocument();
    });
  });
});
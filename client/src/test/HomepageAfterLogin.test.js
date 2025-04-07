import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import HomepageAfterLogin from '../HomepageAfterLogin';

// Mock CSS
jest.mock('../css/HomepageAfterLogin.css', () => ({}));

// Mock Layout component
jest.mock('../Layout', () => {
  return function MockLayout({ children, userName }) {
    return <div data-testid="mock-layout" data-username={userName}>{children}</div>;
  };
});

// Mock axios
jest.mock('axios');

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  remove: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HomepageAfterLogin Component', () => {
  const mockUser = {
    userName: 'testUser',
    profilePicture: 'test-profile.jpg'
  };

  const mockJourneys = [
    { _id: '1', title: 'Journey 1' },
    { _id: '2', title: 'Journey 2' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default cookie values
    Cookies.get.mockImplementation((key) => {
      switch(key) {
        case 'user':
          return JSON.stringify(mockUser);
        case 'user.userName':
          return mockUser.userName;
        case 'authToken':
          return 'mock-token';
        default:
          return null;
      }
    });
    
    // Setup default axios response
    axios.get.mockResolvedValue({ data: mockJourneys });
  });

  const renderHomepageAfterLogin = (props = {}) => {
    return render(
      <MemoryRouter>
        <HomepageAfterLogin {...props} />
      </MemoryRouter>
    );
  };

  describe('Initial Render and Data Loading', () => {
    test('loads and displays user data from cookies', async () => {
      renderHomepageAfterLogin();
      
      await waitFor(() => {
        expect(screen.getByText(`Welcome to Your Own Planet, ${mockUser.userName}!`)).toBeInTheDocument();
        expect(screen.getByText(`Hi, ${mockUser.userName}`)).toBeInTheDocument();
      });
    });

    test('loads and displays journeys', async () => {
      renderHomepageAfterLogin();
      
      await waitFor(() => {
        expect(screen.getByText('Journey 1')).toBeInTheDocument();
        expect(screen.getByText('Journey 2')).toBeInTheDocument();
      });
    });

    test('displays no journeys message when no journeys exist', async () => {
      axios.get.mockResolvedValueOnce({ data: [] });
      renderHomepageAfterLogin();
      
      await waitFor(() => {
        expect(screen.getByText('No previous journeys found.')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    test('handles journey creation', async () => {
      axios.post.mockResolvedValueOnce({ data: { _id: 'new-journey-id' } });
      renderHomepageAfterLogin();

      const createButton = screen.getByText('Create a New Journey');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/journeys/testUser',
          expect.any(Object),
          expect.any(Object)
        );
        expect(mockNavigate).toHaveBeenCalledWith('/journey/new-journey-id');
      });
    });

    test('handles journey click navigation', async () => {
      renderHomepageAfterLogin();
      
      await waitFor(() => {
        const journeyCard = screen.getByText('Journey 1');
        fireEvent.click(journeyCard);
        expect(mockNavigate).toHaveBeenCalledWith('/journey/1', {
          state: { title: 'Journey 1' }
        });
      });
    });

    test('handles search navigation', () => {
      renderHomepageAfterLogin();
      
      const searchButton = screen.getByText('Search Your Journey');
      fireEvent.click(searchButton);
      expect(mockNavigate).toHaveBeenCalledWith('/search');
    });

    test('handles profile navigation', () => {
      renderHomepageAfterLogin();
      
      const profileButton = screen.getByText('Profile');
      fireEvent.click(profileButton);
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    test('handles logout', () => {
      renderHomepageAfterLogin();
      
      const logoutButton = screen.getByText('Sign Out');
      fireEvent.click(logoutButton);

      expect(Cookies.remove).toHaveBeenCalledWith('user');
      expect(Cookies.remove).toHaveBeenCalledWith('authToken');
      expect(Cookies.remove).toHaveBeenCalledWith('user.userName');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Error Handling', () => {
    test('handles journey creation error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      axios.post.mockRejectedValueOnce(new Error('Failed to create journey'));
      
      renderHomepageAfterLogin();
      
      const createButton = screen.getByText('Create a New Journey');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to create journey:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test('handles journey fetch error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      axios.get.mockRejectedValueOnce(new Error('Failed to fetch journeys'));
      
      renderHomepageAfterLogin();

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching journeys:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Layout and Structure', () => {
    test('renders profile information correctly', async () => {
      renderHomepageAfterLogin();
      
      await waitFor(() => {
        expect(screen.getByAltText('Profile')).toBeInTheDocument();
        expect(screen.getByText(`Hi, ${mockUser.userName}`)).toBeInTheDocument();
      });
    });

    test('renders journey count correctly', async () => {
      renderHomepageAfterLogin();
      
      await waitFor(() => {
        expect(screen.getByText('You have recorded: 2 journeys')).toBeInTheDocument();
      });
    });

    test('renders single journey count correctly', async () => {
      axios.get.mockResolvedValueOnce({ data: [{ _id: '1', title: 'Journey 1' }] });
      renderHomepageAfterLogin();
      
      await waitFor(() => {
        expect(screen.getByText('You have recorded: 1 journey')).toBeInTheDocument();
      });
    });
  });
});
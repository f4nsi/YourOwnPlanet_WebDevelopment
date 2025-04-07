import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import JourneyDetails from '../JourneyDetails';

// Mock CSS
jest.mock('../css/JourneyDetails.css', () => ({}));

// Mock MapComponent
jest.mock('../MapComponent', () => {
  return function MockMapComponent({ apiKey }) {
    return <div data-testid="mock-map">Map Component</div>;
  };
});

// Mock Layout
jest.mock('../Layout', () => {
  return function MockLayout({ children, userName }) {
    return <div data-testid="mock-layout" data-username={userName}>{children}</div>;
  };
});

// Mock window functions
window.alert = jest.fn();
window.confirm = jest.fn(() => true);

// Mock axios
jest.mock('axios');

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'test-journey-id' }),
  useLocation: () => ({
    state: { title: 'Test Journey' }
  })
}));

describe('JourneyDetails Component', () => {
  let user;

  const mockUser = {
    userName: 'testUser',
    profilePicture: 'test.jpg'
  };

  beforeEach(async () => {
    user = userEvent.setup();
    jest.clearAllMocks();
    localStorage.setItem('user', JSON.stringify(mockUser));
    Cookies.get.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(mockUser);
      if (key === 'user.userName') return mockUser.userName;
      return null;
    });
    
    axios.get.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderJourneyDetails = async () => {
    const utils = render(
      <MemoryRouter initialEntries={['/journey/test-journey-id']}>
        <Routes>
          <Route path="/journey/:id" element={<JourneyDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Details of Test Journey/)).toBeInTheDocument();
    });

    return utils;
  };

  describe('Form Interactions', () => {
    test('handles form submission', async () => {
      await renderJourneyDetails();
      
      const updateButton = screen.getByText(/Update Journey Title/i);
      await user.click(updateButton);
      
      expect(window.alert).toHaveBeenCalledWith('Do you confirm the change?');
    });

    test('handles title update', async () => {
      await renderJourneyDetails();
      
      const titleInput = screen.getByPlaceholderText(/edit your journey title here/i);
      await user.type(titleInput, 'New Journey Title');
      
      const updateButton = screen.getByText(/Update Journey Title/i);
      await user.click(updateButton);
      
      expect(window.alert).toHaveBeenCalledWith('Do you confirm the change?');
    });

    test('validates empty title', async () => {
      axios.put.mockResolvedValueOnce({ status: 200 });
      await renderJourneyDetails();
      
      const titleInput = screen.getByPlaceholderText(/edit your journey title here/i);
      await user.clear(titleInput);
      const button = screen.getByText(/Update Journey Title/i);
      
      await user.click(button);
      await waitFor(() => {
        expect(axios.put).not.toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    test('handles back navigation', async () => {
      await renderJourneyDetails();
      
      const backButton = screen.getByText(/Back to My Homepage/i);
      await user.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/homepageafterlogin');
    });
  });

  describe('Journey Management', () => {
    test('handles journey deletion', async () => {
      axios.delete.mockResolvedValueOnce({ status: 200 });
      window.confirm.mockReturnValueOnce(true);

      await renderJourneyDetails();
      
      const deleteButton = screen.getByText(/Delete Journey/i);
      await user.click(deleteButton);
      
      expect(window.confirm).toHaveBeenCalled();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/homepageafterlogin');
      });
    });
  });
});
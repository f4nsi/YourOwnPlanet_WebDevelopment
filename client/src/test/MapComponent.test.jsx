import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import Cookies from 'js-cookie';
import MapComponent from '../MapComponent';

jest.mock('axios');
jest.mock('js-cookie');

// Mock Google Maps API
const mockLatLng = {
  lat: () => 49.1539,
  lng: () => -123.0650
};

jest.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children, onClick }) => (
    <div data-testid="google-map" onClick={(e) => onClick({ latLng: mockLatLng })}>
      {children}
    </div>
  ),
  Marker: ({ onClick, position }) => (
    <div 
      data-testid="map-marker" 
      onClick={() => onClick && onClick()}
      data-lat={position?.lat}
      data-lng={position?.lng}
    />
  ),
  useLoadScript: () => ({
    isLoaded: true,
    loadError: null,
  }),
  Autocomplete: ({ children }) => <div data-testid="autocomplete">{children}</div>,
}));


describe('MapComponent', () => {
  const mockUser = {
    userName: 'testUser',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    Cookies.get.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(mockUser);
      if (key === 'authToken') return 'mock-token';
      return null;
    });

    delete window.location;
    window.location = { pathname: '/journey/123' };

    axios.get.mockResolvedValue({
      data: [{
        location: {
          coordinates: [-123.0650, 49.1539]
        },
        journalText: 'Existing marker',
        journalPhoto: '',
      }]
    });
  });

  test('handles marker click and displays form', async () => {
    await act(async () => {
        render(<MapComponent apiKey="mock-api-key" />);
    });

    const marker = screen.getByTestId('map-marker');
    fireEvent.click(marker);

    const timeInput = screen.getByDisplayValue(new Date().toISOString().slice(0, 16));
    expect(timeInput).toBeInTheDocument();
    
    expect(screen.getByPlaceholderText('Enter your memories here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
});

  test('handles file upload', async () => {
    await act(async () => {
      render(<MapComponent apiKey="mock-api-key" />);
    });

    const marker = screen.getByTestId('map-marker');
    await act(async () => {
      fireEvent.click(marker);
    });

    const inputs = document.querySelectorAll('input');
    const fileInput = Array.from(inputs).find(input => input.type === 'file');
    expect(fileInput).toBeInTheDocument();
    
    const imageFile = new File(['test'], 'test.png', { type: 'image/png' });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [imageFile] } });
    });
  });

  test('handles marker save with image', async () => {
    jest.clearAllMocks();

    axios.post.mockResolvedValueOnce({
      status: 201,
      data: { _id: 'new-detail-id' }
    });

    await act(async () => {
      render(<MapComponent apiKey="mock-api-key" />);
    });

    // Click marker to show form
    const marker = screen.getByTestId('map-marker');
    fireEvent.click(marker);

    // Add text
    const textarea = screen.getByPlaceholderText('Enter your memories here...');
    fireEvent.change(textarea, { target: { value: 'Test memory' } });

    // 通过 accept 属性查找文件输入框
    const fileInput = document.querySelector('input[accept="image/*"]');
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // Save
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/details/123/createDetails',
          expect.any(FormData),
          { withCredentials: true }
        );
      });
  });
  

  test('handles close button', async () => {
    await act(async () => {
      render(<MapComponent apiKey="mock-api-key" />);
    });

    const marker = screen.getByTestId('map-marker');
    fireEvent.click(marker);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(screen.queryByPlaceholderText('Enter your memories here...')).not.toBeInTheDocument();
  });

  test('handles time change', async () => {
    await act(async () => {
      render(<MapComponent apiKey="mock-api-key" />);
    });

    const marker = screen.getByTestId('map-marker');
    await act(async () => {
      fireEvent.click(marker);
    });

    const inputs = document.querySelectorAll('input');
    const timeInput = Array.from(inputs).find(input => input.type === 'datetime-local');
    expect(timeInput).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(timeInput, { target: { value: '2024-01-01T12:00' } });
    });

    expect(timeInput.value).toMatch(/^2024-01-01T\d{2}:00$/);
  });
});
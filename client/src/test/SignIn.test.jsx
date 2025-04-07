import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import SignIn from '../SignIn';

// Mock the dependencies
jest.mock('axios');
jest.mock('js-cookie');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('SignIn', () => {
  const mockUser = {
    userName: 'testUser',
    password: 'testPassword'
  };

  const mockToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  const renderSignIn = () => {
    return render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );
  };

  test('renders sign in form by default', () => {
    renderSignIn();

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('User ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.queryByText(/file/i)).not.toBeInTheDocument();
  });

  test('toggles between sign in and sign up forms', () => {
    renderSignIn();

    const toggleButton = screen.getByText('New user? Sign Up');
    fireEvent.click(toggleButton);

    // Should now show sign up form
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Already have an account? Sign In' })).toBeInTheDocument();
    
    // File input should be visible in sign up mode
    const fileInput = screen.getByRole('textbox', { type: 'file' });
    expect(fileInput).toBeInTheDocument();
  });

  test('handles file upload in sign up form', async () => {
    renderSignIn();

    // Switch to sign up form
    fireEvent.click(screen.getByText('New user? Sign Up'));

    const file = new File(['test image'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByRole('textbox', { type: 'file' });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(fileInput.files[0]).toBe(file);
    expect(fileInput.files).toHaveLength(1);
  });

  test('handles successful sign up with file', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate')
      .mockImplementation(() => mockNavigate);

    axios.post.mockResolvedValueOnce({ data: mockUser });

    renderSignIn();

    // Switch to sign up form
    fireEvent.click(screen.getByText('New user? Sign Up'));

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('User ID'), {
      target: { value: mockUser.userName }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: mockUser.password }
    });

    // Upload file
    const file = new File(['test image'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByRole('textbox', { type: 'file' });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    });

    // Verify FormData was sent
    const lastCallArguments = axios.post.mock.calls[0];
    expect(lastCallArguments[0]).toBe('http://localhost:3000/users/');
    expect(lastCallArguments[1]).toBeInstanceOf(FormData);
    expect(lastCallArguments[2]).toEqual({ withCredentials: true });

    expect(window.alert).toHaveBeenCalledWith('Sign up successfully! Please log in.');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles successful sign in', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate')
      .mockImplementation(() => mockNavigate);

    axios.post.mockResolvedValueOnce({
      data: { token: mockToken, user: mockUser }
    });

    renderSignIn();

    fireEvent.change(screen.getByPlaceholderText('User ID'), {
      target: { value: mockUser.userName }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: mockUser.password }
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    });

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/users/login',
      mockUser,
      { withCredentials: true }
    );
    expect(Cookies.set).toHaveBeenCalledWith('authToken', mockToken);
    expect(Cookies.set).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    expect(mockNavigate).toHaveBeenCalledWith('/homepageafterlogin');
  });

  test('handles sign in error', async () => {
    const errorMessage = 'Invalid credentials';
    axios.post.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });

    renderSignIn();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    });

    expect(window.alert).toHaveBeenCalledWith(errorMessage);
  });
});
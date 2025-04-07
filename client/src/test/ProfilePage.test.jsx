import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import ProfilePage from '../ProfilePage';

// Mock 依赖
jest.mock('axios');
jest.mock('js-cookie');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('ProfilePage', () => {
  const mockUser = {
    userName: 'testUser',
    password: 'testPassword'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Cookie
    Cookies.get.mockImplementation((key) => {
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    // Mock axios responses
    axios.put.mockResolvedValue({ data: mockUser });
    axios.delete.mockResolvedValue({});
  });

  const renderProfilePage = () => {
    return render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
  };

  test('renders profile page with form elements', () => {
    renderProfilePage();

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('User Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Image:')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Delete My Account')).toBeInTheDocument();
    expect(screen.getByText('Back to Homepage')).toBeInTheDocument();
  });

  test('handles input changes', () => {
    renderProfilePage();

    const nameInput = screen.getByPlaceholderText('User Name');
    const passwordInput = screen.getByPlaceholderText('New Password');

    fireEvent.change(nameInput, { target: { value: 'newUsername' } });
    fireEvent.change(passwordInput, { target: { value: 'newPassword' } });

    expect(nameInput.value).toBe('newUsername');
    expect(passwordInput.value).toBe('newPassword');
  });

  test('handles file upload', () => {
    renderProfilePage();

    const fileInput = screen.getByLabelText('Image:');
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(fileInput.files[0]).toBe(file);
    expect(fileInput.files.length).toBe(1);
  });

  test('handles save profile successfully', async () => {
    renderProfilePage();

    const nameInput = screen.getByPlaceholderText('User Name');
    const passwordInput = screen.getByPlaceholderText('New Password');
    const saveButton = screen.getByText('Save Changes');

    fireEvent.change(nameInput, { target: { value: 'newUsername' } });
    fireEvent.change(passwordInput, { target: { value: 'newPassword' } });

    window.alert = jest.fn();

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(axios.put).toHaveBeenCalledWith(
      'http://localhost:3000/users/newUsername',
      expect.any(FormData),
      { withCredentials: true }
    );
    expect(window.alert).toHaveBeenCalledWith('Profile updated successfully!');
  });

  test('handles save profile error', async () => {
    axios.put.mockRejectedValueOnce(new Error('Update failed'));
    renderProfilePage();

    const saveButton = screen.getByText('Save Changes');
    window.alert = jest.fn();

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(window.alert).toHaveBeenCalledWith('Failed to update profile.');
  });

  test('handles delete account successfully', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate')
      .mockImplementation(() => mockNavigate);

    renderProfilePage();

    const deleteButton = screen.getByText('Delete My Account');

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(axios.delete).toHaveBeenCalledWith(
      'http://localhost:3000/users/testUser',
      { withCredentials: true }
    );
    expect(Cookies.remove).toHaveBeenCalledWith('user');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles delete account error', async () => {
    axios.delete.mockRejectedValueOnce(new Error('Delete failed'));
    renderProfilePage();

    const deleteButton = screen.getByText('Delete My Account');
    window.alert = jest.fn();

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(window.alert).toHaveBeenCalledWith('Failed to delete account.');
  });

  test('navigates back to homepage', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate')
      .mockImplementation(() => mockNavigate);

    renderProfilePage();

    const backButton = screen.getByText('Back to Homepage');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/homepageafterlogin');
  });
});
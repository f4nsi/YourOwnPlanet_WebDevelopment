import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock all child components
jest.mock('../Homepage', () => {
  return function MockHomepage() {
    return <div data-testid="homepage">Homepage</div>;
  };
});

jest.mock('../SignIn', () => {
  return function MockSignIn() {
    return <div data-testid="signin">SignIn</div>;
  };
});

jest.mock('../HomepageAfterLogin', () => {
  return function MockHomepageAfterLogin() {
    return <div data-testid="homepage-after-login">HomepageAfterLogin</div>;
  };
});

jest.mock('../ProfilePage', () => {
  return function MockProfilePage({ userProfile, updateUserProfile }) {
    return <div data-testid="profile-page">ProfilePage</div>;
  };
});

jest.mock('../JourneyDetails', () => {
  return function MockJourneyDetails() {
    return <div data-testid="journey-details">JourneyDetails</div>;
  };
});

jest.mock('../SearchPage', () => {
  return function MockSearchPage() {
    return <div data-testid="search-page">SearchPage</div>;
  };
});

describe('App Component', () => {
  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    );
  };

  test('renders homepage at root route /', () => {
    renderWithRouter('/');
    expect(screen.getByTestId('homepage')).toBeInTheDocument();
  });

  test('renders signin page at /signin', () => {
    renderWithRouter('/signin');
    expect(screen.getByTestId('signin')).toBeInTheDocument();
  });

  test('renders signup page at /signup', () => {
    renderWithRouter('/signup');
    expect(screen.getByTestId('signin')).toBeInTheDocument();
  });

  test('renders homepage after login at /homepageafterlogin', () => {
    renderWithRouter('/homepageafterlogin');
    expect(screen.getByTestId('homepage-after-login')).toBeInTheDocument();
  });

  test('renders profile page at /profile', () => {
    renderWithRouter('/profile');
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
  });

  test('renders journey details page at /journey/:id', () => {
    renderWithRouter('/journey/123');
    expect(screen.getByTestId('journey-details')).toBeInTheDocument();
  });

  test('renders search page at /search', () => {
    renderWithRouter('/search');
    expect(screen.getByTestId('search-page')).toBeInTheDocument();
  });

  test('handles userProfile state updates', () => {
    renderWithRouter('/profile');
    // You could add more specific tests here for userProfile state management
    expect(screen.getByTestId('profile-page')).toBeInTheDocument();
  });
});
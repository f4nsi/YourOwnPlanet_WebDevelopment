import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/SignIn.css';
import axios from 'axios'; 
import Layout from './Layout';
import Cookies from 'js-cookie';


function SignIn() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const navigate = useNavigate();

    const handleToggle = () => setIsSignUp(!isSignUp);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (isSignUp) {
            console.log('Signing up:', { userName, password, profilePicture });
            const formData = new FormData();
            formData.append('userName', userName);
            formData.append('password', password);
            console.log(userName);
            console.log(password);
            console.log(formData.values());
            if (profilePicture) {
                formData.append('profilePicture', profilePicture);
            }
            try {
                const response = await axios.post('http://localhost:3000/users/', formData, {withCredentials: true});
                console.log('User created:', response.data);
                alert('Sign up successfully! Please log in.');
                navigate('/'); 
            } catch (err) {
                console.error('Sign-up failed:', err.response?.data?.message || err.message);
                alert(err.response?.data?.message || 'Sign-up failed. Please try again.');
            }
        } else {
            console.log('Signing in:', { userName, password });
            try {
                const response = await axios.post('http://localhost:3000/users/login', { userName, password }, {withCredentials: true});
                const { token, user } = response.data;
                console.log('Login successful:', user);
                Cookies.set('authToken', token);
                Cookies.set('user', JSON.stringify(user));
                Cookies.set('user.userName', user.userName);

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // localStorage.setItem('authToken', token);
                // localStorage.setItem('user', JSON.stringify(user));
                // localStorage.setItem('user.userName', user.userName);
                console.log('Login successful:', Cookies.get('user'));
                console.log('UserName from server:', Cookies.get('user.userName')); 
                console.log('Token:', Cookies.get('authToken'));
                navigate('/homepageafterlogin');
            } catch (err) {
                console.error('Login failed:', err.response?.data?.message || err.message);
                alert(err.response?.data?.message || 'Invalid credentials. Please try again.');
            }
        }
    };
    
    return (
        <Layout>
        <div className="sign-in-up-page">
            <div className='sign-in-box'>
                <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <input className='signIn-input'
                            type="text"
                            placeholder="User ID"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input className='signIn-input'
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        {isSignUp && (
                            <input
                                type="file"
                                onChange={(e) => setProfilePicture(e.target.files[0])}
                            />
                        )}
                    </div>
                    <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
                </form>
                <button onClick={handleToggle}>
                    {isSignUp ? 'Already have an account? Sign In' : 'New user? Sign Up'}
                </button>
            </div>
            <div className='background'></div>
        </div>
        </Layout>
    );
}

export default SignIn;

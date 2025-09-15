import React, { useState } from 'react';
import './Login.css';
import { signIn, signUp, createUserProfile, supabase } from '../lib/supabase';

const Login = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (message) setMessage('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        setMessage('Login successful!');
        onLogin(data.user);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim() || !formData.username.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Sign up user
      const { data, error } = await signUp(
        formData.email, 
        formData.password,
        {
          username: formData.username,
          full_name: formData.fullName || formData.username
        }
      );
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Create user profile
        await createUserProfile(data.user, formData.username, formData.fullName || formData.username);
        
        setMessage('Account created successfully! Please check your email to verify your account.');
        setFormData({ email: '', password: '', username: '', fullName: '' });
        
        // Switch back to login form
        setTimeout(() => {
          setIsSignUp(false);
          setMessage('');
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // If successful, user will be redirected to Google
      // The auth state change will be handled in App.jsx
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error('Google sign in error:', err);
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setMessage('');
    setFormData({ email: '', password: '', username: '', fullName: '' });
  };

  // Quick demo login function
  const demoLogin = async (email, password) => {
    setFormData({ ...formData, email, password });
    setLoading(true);
    
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        setError('Demo account not found. Please create an account first.');
      } else if (data.user) {
        onLogin(data.user);
      }
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          {isSignUp ? 'Sign up for weather tracking' : 'Sign in to your account'}
        </p>
        
        {/* Google Sign In Button */}
        <button 
          type="button" 
          className="google-btn" 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <div className="google-icon">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <div className="divider">
          <span>or</span>
        </div>
        
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          {isSignUp && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username *"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name (optional)"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="switch-mode">
          <p>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              type="button" 
              className="link-btn" 
              onClick={switchMode}
              disabled={loading}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
{/* 
        {!isSignUp && (
          <div className="demo-section">
            <p style={{ fontSize: '12px', color: '#999', margin: '15px 0 10px' }}>
              Quick Demo (create these accounts first):
            </p>
            <div className="demo-buttons">
              <button 
                type="button" 
                onClick={() => demoLogin('admin@weather.com', 'admin123')}
                className="demo-btn"
                disabled={loading}
              >
                Admin Demo
              </button>
              <button 
                type="button" 
                onClick={() => demoLogin('user@weather.com', 'user123')}
                className="demo-btn"
                disabled={loading}
              >
                User Demo
              </button>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Login;
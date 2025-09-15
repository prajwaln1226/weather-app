import React, { useState, useEffect } from 'react';
import Weather from './components/Weather';
import Login from './components/Login';
import { supabase, signOut, createGoogleUserProfile } from './lib/supabase';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app loads
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoggedIn(!!session);
        setUser(session?.user || null);
        setLoading(false);
        
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Handle Google OAuth sign in
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          
          // If user signed in with OAuth provider, create profile
          if (user.app_metadata?.provider === 'google') {
            try {
              await createGoogleUserProfile(user);
              console.log('Google user profile created/updated');
            } catch (error) {
              console.error('Error creating Google user profile:', error);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className='app' style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#333',
        fontSize: '18px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '30px 40px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className='app'>
      {isLoggedIn && user ? (
        <>
          {/* User info and logout button */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '12px 18px',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              color: '#333',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600' }}>
                  {user.user_metadata?.username || user.user_metadata?.full_name || 'User'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {user.email}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                style={{
                  background: '#ff4757',
                  color: 'white',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Logout
              </button>
            </div>
          </div>
          
          <Weather user={user} />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
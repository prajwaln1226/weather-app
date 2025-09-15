import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        // Redirect to login with error
        window.location.href = '/?error=auth_failed';
      } else if (data.session) {
        // Successfully authenticated, redirect to main app
        window.location.href = '/';
      } else {
        // No session found, redirect to login
        window.location.href = '/';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(45deg, #2f4680, #500ae4)',
      color: 'white',
      fontSize: '18px'
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '30px',
        borderRadius: '10px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div className="spinner" style={{
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
        </div>
        <p>Completing Google sign in...</p>
        <p style={{ fontSize: '14px', opacity: 0.8 }}>Please wait while we redirect you.</p>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AuthCallback;
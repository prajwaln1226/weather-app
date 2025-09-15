import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://ormblirpewkcbfyfqfhi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybWJsaXJwZXdrY2JmeWZxZmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NDcwNTYsImV4cCI6MjA3MzUyMzA1Nn0.77KGMZoT1Sc_ZUWz5In7pzZEkK4FyHUNWu_8-DbWHsk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get current user
export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

// Helper function to sign outcd 
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Helper function to sign up
export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

// Helper function to sign in
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// Helper function to create user profile
export const createUserProfile = async (user, username, fullName) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([
      {
        id: user.id,
        username: username,
        full_name: fullName,
        email: user.email
      }
    ])
  return { data, error }
}

// Helper function to create user profile from Google OAuth
export const createGoogleUserProfile = async (user) => {
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!existingProfile) {
    // Extract username from email or use full name
    const username = user.user_metadata?.preferred_username || 
                    user.email?.split('@')[0] || 
                    user.user_metadata?.full_name?.toLowerCase().replace(/\s+/g, '')

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: user.id,
          username: username,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          email: user.email
        }
      ])
    return { data, error }
  }
  
  return { data: existingProfile, error: null }
}
export const logWeatherRequest = async (city, weatherData) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data, error } = await supabase
      .from('weather_requests')
      .insert([
        {
          user_id: user.id,
          username: user.user_metadata?.username || user.email,
          city: city,
          temperature: weatherData.main?.temp ? Math.floor(weatherData.main.temp) : null,
          description: weatherData.weather?.[0]?.description || null,
          feels_like: weatherData.main?.feels_like ? Math.floor(weatherData.main.feels_like) : null,
          humidity: weatherData.main?.humidity || null,
          wind_speed: weatherData.wind?.speed || null,
          weather_data: weatherData
        }
      ])
    return { data, error }
  }
  return { data: null, error: 'No user logged in' }
}
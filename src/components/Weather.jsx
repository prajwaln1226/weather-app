import React, { useEffect, useRef, useState } from 'react'
import './Weather.css'
import { logWeatherRequest } from '../lib/supabase'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import humidity_icon from '../assets/humidity.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'

const Weather = ({ user }) => {
  const inputRef = useRef()
  const [weatherData, setWeatherData] = useState(false);
  const [loading, setLoading] = useState(false);

  const FASTAPI_BASE_URL = 'http://localhost:8000';

  const allIcons = {
    '01d': clear_icon,
    '01n': clear_icon,
    '02d': cloud_icon,
    '02n': cloud_icon,
    '03d': drizzle_icon,
    '03n': drizzle_icon,
    '04d': humidity_icon,
    '04n': humidity_icon,
    '09d': rain_icon,
    '09n': rain_icon,
    '10d': rain_icon,
    '10n': rain_icon,
    '11d': rain_icon,
    '11n': rain_icon,
    '13d': snow_icon,
    '13n': snow_icon,
    '50d': wind_icon,
    '50n': wind_icon,
  }
  
  const search = async (city) => {
    if (city === "") {
      alert("Please enter a city name");
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    
    try {
      const url = `${FASTAPI_BASE_URL}/weather/${encodeURIComponent(city)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          alert("City not found. Please check the spelling and try again.");
        } else if (response.status === 401) {
          alert("API configuration error. Please check your API key.");
        } else {
          alert(data.detail || "An error occurred while fetching weather data.");
        }
        return;
      }

      console.log('Weather API Response:', data);
      
      const icon = allIcons[data.weather[0].icon] || clear_icon;
      const weatherInfo = {
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        feelsLike: Math.floor(data.main.feels_like),
        description: data.weather[0].description,
        location: data.name,
        icon: icon
      };

      setWeatherData(weatherInfo);

      // Log the request to Supabase
      try {
        const { error: logError } = await logWeatherRequest(city, data);
        if (logError) {
          console.error('Error logging weather request:', logError);
        } else {
          console.log('Weather request logged successfully');
        }
      } catch (logErr) {
        console.error('Failed to log weather request:', logErr);
      }

    } catch (error) {
      setWeatherData(false);
      console.error("Error fetching weather data:", error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert("Cannot connect to weather service. Please make sure the FastAPI server is running on http://localhost:8000");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      search(inputRef.current.value);
    }
  }

  useEffect(() => {
    // Only search if we have a user
    if (user) {
      search("New York");
    }
  }, [user]);

  return (
    <div className='weather'>
      <div className='search-bar'>
        <input 
          ref={inputRef} 
          type="text" 
          placeholder='Search for a city...' 
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <img 
          src={search_icon} 
          alt="Search" 
          onClick={() => search(inputRef.current.value)}
          style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        />
      </div>
      
      {loading && <p style={{color: 'white', marginTop: '20px'}}>Loading weather data...</p>}
      
      {weatherData && !loading ? (
        <>
          <img src={weatherData.icon} alt="Weather icon" className='weather-icon'/>
          <p className='temperature'>{weatherData.temperature}°C</p>
          <p className='description'>{weatherData.description.charAt(0).toUpperCase() + weatherData.description.slice(1)}</p>
          <p className='location'>{weatherData.location}</p>
          <p className='feels-like'>Feels like {weatherData.feelsLike}°C</p>
          <div className='weather-data'>
            <div className='col'>
              <img src={humidity_icon} alt="Humidity" />
              <div>
                <p>{weatherData.humidity} %</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className='col'>
              <img src={wind_icon} alt="Wind"/>
              <div>
                <p>{weatherData.windSpeed} km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Weather
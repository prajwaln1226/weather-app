from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],  # Add your React app URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


API_KEY = os.getenv("WEATHERAPP_ID")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather" 

@app.get("/")
def home():
    return {"message": "✅ Weather API is running!"}

@app.get("/weather/{city}")
def get_weather(city: str):
    if not API_KEY:
        raise HTTPException(status_code=500, detail="API key not found. Check your .env file.")
    
    if not city.strip():
        raise HTTPException(status_code=400, detail="City name cannot be empty")

    url = f"{BASE_URL}?q={city}&appid={API_KEY}&units=metric"
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="City not found")
        elif response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid API key")
        elif response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.json())
            
        return response.json()
        
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=408, detail="Request timeout")
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Unable to connect to weather service")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/health")
def health_check():
    return {"status": "healthy", "api_key_configured": bool(API_KEY)}
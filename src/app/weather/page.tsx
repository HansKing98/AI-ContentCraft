'use client';

import { useState } from 'react';
import './weather.css';

const WeatherCard = () => {
  const [activeWeather, setActiveWeather] = useState<'sun' | 'rain' | 'snow' | 'wind'>('sun');
  const [transitioning, setTransitioning] = useState(false);

  const changeWeather = (weather: 'sun' | 'rain' | 'snow' | 'wind') => {
    if (weather === activeWeather) return;
    
    setTransitioning(true);
    setTimeout(() => {
      setActiveWeather(weather);
      setTimeout(() => {
        setTransitioning(false);
      }, 100);
    }, 500);
  };

  return (
    <div className="weather-page">
      <h1 className="title">天气动画卡片</h1>
      
      <div className="weather-controls">
        <button 
          className={`weather-btn ${activeWeather === 'sun' ? 'active' : ''}`} 
          onClick={() => changeWeather('sun')}
        >
          晴天
        </button>
        <button 
          className={`weather-btn ${activeWeather === 'rain' ? 'active' : ''}`} 
          onClick={() => changeWeather('rain')}
        >
          雨天
        </button>
        <button 
          className={`weather-btn ${activeWeather === 'snow' ? 'active' : ''}`} 
          onClick={() => changeWeather('snow')}
        >
          雪天
        </button>
        <button 
          className={`weather-btn ${activeWeather === 'wind' ? 'active' : ''}`} 
          onClick={() => changeWeather('wind')}
        >
          风天
        </button>
      </div>

      <div className="cards-container">
        <div className={`weather-card sun-card ${activeWeather === 'sun' ? 'active' : ''} ${transitioning && activeWeather === 'sun' ? 'transitioning' : ''}`}>
          <div className="sun"></div>
          <div className="sun-rays"></div>
          <div className="weather-name">晴天</div>
        </div>

        <div className={`weather-card rain-card ${activeWeather === 'rain' ? 'active' : ''} ${transitioning && activeWeather === 'rain' ? 'transitioning' : ''}`}>
          <div className="cloud"></div>
          <div className="rain-drops"></div>
          <div className="weather-name">雨天</div>
        </div>

        <div className={`weather-card snow-card ${activeWeather === 'snow' ? 'active' : ''} ${transitioning && activeWeather === 'snow' ? 'transitioning' : ''}`}>
          <div className="cloud"></div>
          <div className="snowflakes"></div>
          <div className="weather-name">雪天</div>
        </div>

        <div className={`weather-card wind-card ${activeWeather === 'wind' ? 'active' : ''} ${transitioning && activeWeather === 'wind' ? 'transitioning' : ''}`}>
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="wind-lines"></div>
          <div className="weather-name">风天</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard; 
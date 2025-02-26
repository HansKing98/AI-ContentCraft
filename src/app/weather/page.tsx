'use client';

import { useState } from 'react';

export default function WeatherCards() {
  const [activeWeather, setActiveWeather] = useState('all');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">动画天气卡片</h1>
      
      <div className="mb-8 flex justify-center gap-4">
        <button 
          onClick={() => setActiveWeather('all')}
          className={`px-4 py-2 rounded-lg ${activeWeather === 'all' ? 'bg-blue-600' : 'bg-blue-800'}`}
        >
          全部
        </button>
        <button 
          onClick={() => setActiveWeather('wind')}
          className={`px-4 py-2 rounded-lg ${activeWeather === 'wind' ? 'bg-blue-600' : 'bg-blue-800'}`}
        >
          风
        </button>
        <button 
          onClick={() => setActiveWeather('rain')}
          className={`px-4 py-2 rounded-lg ${activeWeather === 'rain' ? 'bg-blue-600' : 'bg-blue-800'}`}
        >
          雨
        </button>
        <button 
          onClick={() => setActiveWeather('sun')}
          className={`px-4 py-2 rounded-lg ${activeWeather === 'sun' ? 'bg-blue-600' : 'bg-blue-800'}`}
        >
          阳光
        </button>
        <button 
          onClick={() => setActiveWeather('snow')}
          className={`px-4 py-2 rounded-lg ${activeWeather === 'snow' ? 'bg-blue-600' : 'bg-blue-800'}`}
        >
          雪
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {(activeWeather === 'all' || activeWeather === 'wind') && (
          <div className="weather-card wind">
            <div className="card-content">
              <h2 className="card-title">风</h2>
              <div className="animation-container">
                <div className="cloud cloud-1"></div>
                <div className="cloud cloud-2"></div>
                <div className="cloud cloud-3"></div>
                <div className="wind-line wind-line-1"></div>
                <div className="wind-line wind-line-2"></div>
                <div className="wind-line wind-line-3"></div>
              </div>
              <div className="card-info">
                <p>风速: 25 km/h</p>
                <p>方向: 西北</p>
              </div>
            </div>
          </div>
        )}

        {(activeWeather === 'all' || activeWeather === 'rain') && (
          <div className="weather-card rain">
            <div className="card-content">
              <h2 className="card-title">雨</h2>
              <div className="animation-container">
                <div className="cloud rain-cloud"></div>
                <div className="raindrops">
                  {Array(20).fill(0).map((_, i) => (
                    <div key={i} className="raindrop" style={{ 
                      left: `${Math.random() * 100}%`, 
                      animationDelay: `${Math.random() * 2}s` 
                    }}></div>
                  ))}
                </div>
                <div className="puddle"></div>
              </div>
              <div className="card-info">
                <p>降水量: 15 mm</p>
                <p>湿度: 85%</p>
              </div>
            </div>
          </div>
        )}

        {(activeWeather === 'all' || activeWeather === 'sun') && (
          <div className="weather-card sun">
            <div className="card-content">
              <h2 className="card-title">阳光</h2>
              <div className="animation-container">
                <div className="sun-circle">
                  <div className="sun-ray ray-1"></div>
                  <div className="sun-ray ray-2"></div>
                  <div className="sun-ray ray-3"></div>
                  <div className="sun-ray ray-4"></div>
                  <div className="sun-ray ray-5"></div>
                  <div className="sun-ray ray-6"></div>
                  <div className="sun-ray ray-7"></div>
                  <div className="sun-ray ray-8"></div>
                </div>
              </div>
              <div className="card-info">
                <p>温度: 28°C</p>
                <p>紫外线: 高</p>
              </div>
            </div>
          </div>
        )}

        {(activeWeather === 'all' || activeWeather === 'snow') && (
          <div className="weather-card snow">
            <div className="card-content">
              <h2 className="card-title">雪</h2>
              <div className="animation-container">
                <div className="cloud snow-cloud"></div>
                <div className="snowflakes">
                  {Array(30).fill(0).map((_, i) => (
                    <div key={i} className="snowflake" style={{ 
                      left: `${Math.random() * 100}%`, 
                      animationDelay: `${Math.random() * 5}s` 
                    }}>❄</div>
                  ))}
                </div>
                <div className="snow-ground"></div>
              </div>
              <div className="card-info">
                <p>积雪: 5 cm</p>
                <p>温度: -3°C</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .weather-card {
          background: linear-gradient(to bottom, #1a1a2e, #16213e);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
          height: 350px;
          position: relative;
          transition: transform 0.3s ease;
        }

        .weather-card:hover {
          transform: translateY(-10px);
        }

        .card-content {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .card-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 15px;
          text-align: center;
        }

        .animation-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.2);
        }

        .card-info {
          margin-top: 15px;
          font-size: 14px;
        }

        /* 风的动画 */
        .cloud {
          position: absolute;
          background: #f1f1f1;
          border-radius: 50%;
          opacity: 0.8;
        }

        .cloud:before, .cloud:after {
          content: '';
          position: absolute;
          background: #f1f1f1;
          border-radius: 50%;
        }

        .cloud-1 {
          width: 60px;
          height: 25px;
          top: 30px;
          left: 20px;
          animation: moveCloud 15s linear infinite;
        }

        .cloud-1:before {
          width: 30px;
          height: 30px;
          top: -15px;
          left: 10px;
        }

        .cloud-1:after {
          width: 20px;
          height: 20px;
          top: -10px;
          left: 35px;
        }

        .cloud-2 {
          width: 40px;
          height: 20px;
          top: 60px;
          left: -40px;
          animation: moveCloud 12s linear infinite;
          animation-delay: 2s;
        }

        .cloud-2:before {
          width: 20px;
          height: 20px;
          top: -10px;
          left: 5px;
        }

        .cloud-2:after {
          width: 15px;
          height: 15px;
          top: -8px;
          left: 22px;
        }

        .cloud-3 {
          width: 50px;
          height: 22px;
          top: 90px;
          left: -50px;
          animation: moveCloud 18s linear infinite;
          animation-delay: 5s;
        }

        .cloud-3:before {
          width: 25px;
          height: 25px;
          top: -12px;
          left: 8px;
        }

        .cloud-3:after {
          width: 18px;
          height: 18px;
          top: -9px;
          left: 28px;
        }

        @keyframes moveCloud {
          0% {
            transform: translateX(-10px);
          }
          100% {
            transform: translateX(calc(100% + 60px));
          }
        }

        .wind-line {
          position: absolute;
          height: 2px;
          background: rgba(255, 255, 255, 0.6);
          animation: windLine 3s infinite;
        }

        .wind-line-1 {
          width: 40px;
          top: 40%;
          left: 20%;
          animation-delay: 0s;
        }

        .wind-line-2 {
          width: 60px;
          top: 60%;
          left: 30%;
          animation-delay: 0.5s;
        }

        .wind-line-3 {
          width: 30px;
          top: 70%;
          left: 60%;
          animation-delay: 1s;
        }

        @keyframes windLine {
          0% {
            transform: translateX(-10px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(50px);
            opacity: 0;
          }
        }

        /* 雨的动画 */
        .rain-cloud {
          width: 80px;
          height: 30px;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #6b7280;
        }

        .rain-cloud:before {
          width: 40px;
          height: 40px;
          top: -20px;
          left: 10px;
          background: #6b7280;
        }

        .rain-cloud:after {
          width: 30px;
          height: 30px;
          top: -15px;
          left: 40px;
          background: #6b7280;
        }

        .raindrop {
          position: absolute;
          width: 2px;
          height: 10px;
          background: #60a5fa;
          border-radius: 0 0 2px 2px;
          animation: rain 1.5s linear infinite;
        }

        @keyframes rain {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100px);
            opacity: 0;
          }
        }

        .puddle {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 10px;
          background: rgba(96, 165, 250, 0.3);
          border-radius: 50%;
          animation: puddle 3s ease-in-out infinite;
        }

        @keyframes puddle {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateX(-50%) scale(1.2);
            opacity: 0.5;
          }
        }

        /* 阳光的动画 */
        .sun-circle {
          position: absolute;
          width: 60px;
          height: 60px;
          background: #fbbf24;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 30px #fbbf24;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 30px #fbbf24;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            box-shadow: 0 0 50px #fbbf24;
          }
        }

        .sun-ray {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 80px;
          height: 2px;
          background: #fbbf24;
          transform-origin: 0 0;
          animation: rotate 10s linear infinite;
        }

        .ray-1 { transform: rotate(0deg); }
        .ray-2 { transform: rotate(45deg); }
        .ray-3 { transform: rotate(90deg); }
        .ray-4 { transform: rotate(135deg); }
        .ray-5 { transform: rotate(180deg); }
        .ray-6 { transform: rotate(225deg); }
        .ray-7 { transform: rotate(270deg); }
        .ray-8 { transform: rotate(315deg); }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* 雪的动画 */
        .snow-cloud {
          width: 80px;
          height: 30px;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #9ca3af;
        }

        .snow-cloud:before {
          width: 40px;
          height: 40px;
          top: -20px;
          left: 10px;
          background: #9ca3af;
        }

        .snow-cloud:after {
          width: 30px;
          height: 30px;
          top: -15px;
          left: 40px;
          background: #9ca3af;
        }

        .snowflake {
          position: absolute;
          color: white;
          font-size: 12px;
          animation: snow 5s linear infinite;
        }

        @keyframes snow {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(100px) rotate(360deg);
            opacity: 0;
          }
        }

        .snow-ground {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 20px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50% 50% 0 0;
          animation: snowGround 3s ease-in-out infinite;
        }

        @keyframes snowGround {
          0%, 100% {
            height: 15px;
          }
          50% {
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
} 
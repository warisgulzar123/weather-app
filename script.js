// script.js

const apiKey = "e857ce6d7c1546328ed3bc204b03c276"; // OpenCage API key

const searchBtn = document.getElementById("searchBtn");
const weatherDiv = document.getElementById("weather");
const modeToggle = document.getElementById("modeToggle");

// Create background div if not in HTML
let backgroundImage = document.getElementById("backgroundImage");
if (!backgroundImage) {
  backgroundImage = document.createElement("div");
  backgroundImage.id = "backgroundImage";
  document.body.prepend(backgroundImage);
}

// Apply default background image
backgroundImage.style.position = "fixed";
backgroundImage.style.top = "0";
backgroundImage.style.left = "0";
backgroundImage.style.width = "100%";
backgroundImage.style.height = "100%";
backgroundImage.style.backgroundSize = "cover";
backgroundImage.style.backgroundPosition = "center";
backgroundImage.style.zIndex = "-1";
backgroundImage.style.transition = "opacity 0.5s ease";
backgroundImage.style.backgroundImage = "url('day-clouds.jpg')";
backgroundImage.style.opacity = "0.25";

searchBtn.addEventListener("click", async () => {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    weatherDiv.innerHTML = "<p class='error-msg'>⚠️ Please enter a valid city name.</p>";
    return;
  }

  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}`
    );
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      weatherDiv.innerHTML = `<p class='error-msg'>❌ Error: City not found.</p>`;
      return;
    }

    const { lat, lng } = data.results[0].geometry;

    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m,weathercode&daily=sunrise,sunset&timezone=auto`);
    const weatherData = await weatherRes.json();

    const iconMap = {
      0: "☀️ Clear",
      1: "🌤️ Mostly Clear",
      2: "🌥️ Partly Cloudy",
      3: "☁️ Overcast",
      45: "🌫️ Fog",
      48: "🌫️ Foggy",
      51: "🌦️ Light Drizzle",
      53: "🌦️ Drizzle",
      55: "🌧️ Heavy Drizzle",
      61: "🌧️ Light Rain",
      63: "🌧️ Rain",
      65: "🌧️ Heavy Rain",
      71: "❄️ Light Snow",
      73: "❄️ Snow",
      75: "❄️ Heavy Snow",
      80: "🌦️ Light Showers",
      81: "🌧️ Showers",
      82: "🌧️ Heavy Showers",
      95: "⛈️ Thunderstorm",
      96: "⛈️ Thunderstorm + Hail",
      99: "⛈️ Thunderstorm + Heavy Hail"
    };

    const weatherCode = weatherData.current_weather.weathercode;
    const weatherIcon = iconMap[weatherCode] || "❓ Unknown";
    const humidity = weatherData.hourly.relativehumidity_2m[0];
    const sunrise = new Date(weatherData.daily.sunrise[0]);
    const sunset = new Date(weatherData.daily.sunset[0]);

    const formatTime = (date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const createRows = (data) => {
      return data.map(([icon, label, value], idx, arr) => `
        <div style="display: grid; grid-template-columns: 1fr 2fr; align-items: center; padding: 10px 14px; ${idx < arr.length - 1 ? 'border-bottom: 1px solid #ddd;' : ''}">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 1.4rem;">${icon}</div>
            <div style="font-weight: 500;">${label}</div>
          </div>
          <div style="text-align: right; font-weight: 600; font-size: 1.05rem;">${value}</div>
        </div>`).join('');
    };

    const weather = `
      <div class="weather-card" style="
        font-family: 'Segoe UI', sans-serif;
        background: rgba(255, 255, 255, 0.65);
        padding: 32px;
        border-radius: 20px;
        box-shadow: 0 20px 35px rgba(0,0,0,0.2);
        max-width: 720px;
        margin: 40px auto;
        color: #222;
        backdrop-filter: blur(12px);
        animation: fadeSlideIn 0.6s ease-out;
      ">
        <h2 style="font-size: 2rem; margin-bottom: 24px; text-align: center;">${data.results[0].formatted}</h2>

        <div style="border: 1px solid #ccc; border-radius: 14px; overflow: hidden; margin-bottom: 24px;">
          ${createRows([
            ['🌡️', 'Temperature', `${weatherData.current_weather.temperature}°C`],
            ['🌬️', 'Wind', `${weatherData.current_weather.windspeed} km/h`],
            ['🌈', 'Condition', weatherIcon],
            ['💧', 'Humidity', `${humidity}%`]
          ])}
        </div>

        <h3 style="font-size: 1.4rem; margin-bottom: 12px;">🌗 Sun & Moon</h3>
        <div style="border: 1px solid #ccc; border-radius: 14px; overflow: hidden;">
          ${createRows([
            ['🌅', 'Sunrise', formatTime(sunrise)],
            ['🌇', 'Sunset', formatTime(sunset)],
            ['🕒', 'Time', new Date(weatherData.current_weather.time).toLocaleString()]
          ])}
        </div>
      </div>

      <style>
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      </style>
    `;

    weatherDiv.innerHTML = weather;
  } catch (err) {
    weatherDiv.innerHTML = `<p class='error-msg'>❌ Failed to fetch weather data.</p>`;
    console.error(err);
  }
});

modeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    backgroundImage.style.backgroundImage = "url('night-clouds.jpg')";
    backgroundImage.style.opacity = "0.3";
    document.body.style.color = "#f5f5f5";
  } else {
    backgroundImage.style.backgroundImage = "url('day-clouds.jpg')";
    backgroundImage.style.opacity = "0.25";
    document.body.style.color = "#222";
  }
});

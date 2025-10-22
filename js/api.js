// js/api.js

const API_CONFIG = {
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  weather: "https://api.open-meteo.com/v1/forecast",
};

// Idioma
let CURRENT_LANG = localStorage.getItem("skyview:lang") || "pt";
export function setApiLanguage(lang) {
  CURRENT_LANG = lang || "pt";
}

// Unidades
let UNITS = localStorage.getItem("skyview:units") || "metric";
export function setUnits(u) {
  UNITS = u || "metric";
  localStorage.setItem("skyview:units", UNITS);
}
function unitParams() {
  if (UNITS === "imperial") {
    return {
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      precipitation_unit: "inch",
    };
  }
  return {
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  };
}

// Geocoding
export async function getCityCoordinates(cityName) {
  const url = `${API_CONFIG.geocoding}?name=${encodeURIComponent(
    cityName
  )}&count=1&language=${CURRENT_LANG}&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results || data.results.length === 0)
    throw new Error("Cidade não encontrada");
  return data.results[0];
}

// Previsão por lat/lon (com idioma/unidades)
export async function getWeatherData(lat, lon) {
  const u = unitParams();
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current:
      "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,pressure_msl,weather_code",
    hourly:
      "temperature_2m,precipitation_probability,precipitation,wind_speed_10m,uv_index",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset",
    timezone: "auto",
    forecast_days: 7,
    temperature_unit: u.temperature_unit,
    wind_speed_unit: u.wind_speed_unit,
    precipitation_unit: u.precipitation_unit,
  });
  const url = `${API_CONFIG.weather}?${params}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

// Previsão completa a partir do nome da cidade
export async function getCompleteWeatherData(cityName) {
  const loc = await getCityCoordinates(cityName);
  const w = await getWeatherData(loc.latitude, loc.longitude);
  return {
    location: {
      name: loc.name,
      country: loc.country,
      admin1: loc.admin1,
      latitude: loc.latitude,
      longitude: loc.longitude,
    },
    current: w.current,
    daily: w.daily,
    hourly: w.hourly,
  };
}

// Ícones/descrições WMO
export function getWeatherIcon(code) {
  const map = {
    0: { icon: "☀️", desc: "Céu limpo" },
    1: { icon: "🌤️", desc: "Principalmente limpo" },
    2: { icon: "⛅", desc: "Parcialmente nublado" },
    3: { icon: "☁️", desc: "Nublado" },
    45: { icon: "🌫️", desc: "Neblina" },
    48: { icon: "🌫️", desc: "Neblina com geada" },
    51: { icon: "🌦️", desc: "Garoa leve" },
    53: { icon: "🌦️", desc: "Garoa moderada" },
    55: { icon: "🌦️", desc: "Garoa densa" },
    56: { icon: "🌧️", desc: "Garoa congelante leve" },
    57: { icon: "🌧️", desc: "Garoa congelante densa" },
    61: { icon: "🌧️", desc: "Chuva leve" },
    63: { icon: "🌧️", desc: "Chuva moderada" },
    65: { icon: "🌧️", desc: "Chuva forte" },
    66: { icon: "🌨️", desc: "Chuva congelante leve" },
    67: { icon: "🌨️", desc: "Chuva congelante forte" },
    71: { icon: "❄️", desc: "Neve leve" },
    73: { icon: "❄️", desc: "Neve moderada" },
    75: { icon: "❄️", desc: "Neve forte" },
    77: { icon: "🌨️", desc: "Granizo" },
    80: { icon: "🌦️", desc: "Pancadas leves" },
    81: { icon: "🌦️", desc: "Pancadas moderadas" },
    82: { icon: "⛈️", desc: "Pancadas fortes" },
    85: { icon: "🌨️", desc: "Pancadas de neve leves" },
    86: { icon: "🌨️", desc: "Pancadas de neve fortes" },
    95: { icon: "⛈️", desc: "Tempestade" },
    96: { icon: "⛈️", desc: "Tempestade c/ granizo leve" },
    99: { icon: "⛈️", desc: "Tempestade c/ granizo forte" },
  };
  return map[code] || { icon: "🌡️", desc: "Desconhecido" };
}

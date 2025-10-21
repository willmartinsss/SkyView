/**
 * Módulo responsável pelas chamadas à API Open-Meteo
 */

const API_CONFIG = {
  geocoding: "https://geocoding-api.open-meteo.com/v1/search",
  weather: "https://api.open-meteo.com/v1/forecast",
};

/**
 * Busca as coordenadas de uma cidade
 * @param {string} cityName - Nome da cidade
 * @returns {Promise<Object>} Dados de localização
 */
export async function getCityCoordinates(cityName) {
  const url = `${API_CONFIG.geocoding}?name=${encodeURIComponent(
    cityName
  )}&count=1&language=pt&format=json`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Cidade não encontrada");
  }

  return data.results[0];
}

/**
 * Busca os dados meteorológicos completos de uma localização (atuais e previsão de 7 dias)
 * @param {number} latitude - Latitude da localização
 * @param {number} longitude - Longitude da localização
 * @returns {Promise<Object>} Dados meteorológicos completos
 */
export async function getWeatherData(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    current:
      "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,pressure_msl,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
    timezone: "auto",
    forecast_days: 7,
  });

  const url = `${API_CONFIG.weather}?${params}`;
  const response = await fetch(url);
  const data = await response.json();

  return data;
}

/**
 * Busca dados completos do clima para uma cidade (atuais + 7 dias)
 * @param {string} cityName - Nome da cidade
 * @returns {Promise<Object>} Objeto com dados de localização, clima atual e previsão
 */
export async function getCompleteWeatherData(cityName) {
  try {
    // Passo 1: Obter coordenadas
    const location = await getCityCoordinates(cityName);

    // Passo 2: Obter dados meteorológicos (atuais + previsão)
    const weather = await getWeatherData(location.latitude, location.longitude);

    return {
      location: {
        name: location.name,
        country: location.country,
        admin1: location.admin1,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      current: weather.current,
      daily: weather.daily,
    };
  } catch (error) {
    throw new Error(`Erro ao buscar dados: ${error.message}`);
  }
}

/**
 * Converte código WMO em emoji e descrição
 * @param {number} code - Código WMO
 * @returns {Object} Objeto com emoji e descrição
 */
export function getWeatherIcon(code) {
  const weatherCodes = {
    0: { icon: "☀️", description: "Céu limpo" },
    1: { icon: "🌤️", description: "Principalmente limpo" },
    2: { icon: "⛅", description: "Parcialmente nublado" },
    3: { icon: "☁️", description: "Nublado" },
    45: { icon: "🌫️", description: "Neblina" },
    48: { icon: "🌫️", description: "Neblina com geada" },
    51: { icon: "🌦️", description: "Garoa leve" },
    53: { icon: "🌦️", description: "Garoa moderada" },
    55: { icon: "🌦️", description: "Garoa densa" },
    56: { icon: "🌧️", description: "Garoa congelante leve" },
    57: { icon: "🌧️", description: "Garoa congelante densa" },
    61: { icon: "🌧️", description: "Chuva leve" },
    63: { icon: "🌧️", description: "Chuva moderada" },
    65: { icon: "🌧️", description: "Chuva forte" },
    66: { icon: "🌨️", description: "Chuva congelante leve" },
    67: { icon: "🌨️", description: "Chuva congelante forte" },
    71: { icon: "❄️", description: "Neve leve" },
    73: { icon: "❄️", description: "Neve moderada" },
    75: { icon: "❄️", description: "Neve forte" },
    77: { icon: "🌨️", description: "Granizo" },
    80: { icon: "🌦️", description: "Pancadas leves" },
    81: { icon: "🌦️", description: "Pancadas moderadas" },
    82: { icon: "⛈️", description: "Pancadas fortes" },
    85: { icon: "🌨️", description: "Pancadas de neve leves" },
    86: { icon: "🌨️", description: "Pancadas de neve fortes" },
    95: { icon: "⛈️", description: "Tempestade" },
    96: { icon: "⛈️", description: "Tempestade com granizo leve" },
    99: { icon: "⛈️", description: "Tempestade com granizo forte" },
  };

  return weatherCodes[code] || { icon: "🌡️", description: "Desconhecido" };
}

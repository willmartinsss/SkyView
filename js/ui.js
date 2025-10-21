/**
 * Módulo responsável pela manipulação da interface do usuário
 */

import { getWeatherIcon } from "./api.js";

// Elementos do DOM
const elements = {
  cityInput: document.getElementById("cityInput"),
  searchBtn: document.getElementById("searchBtn"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  weatherInfo: document.getElementById("weatherInfo"),
  location: document.getElementById("location"),
  temperature: document.getElementById("temperature"),
  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("windSpeed"),
  precipitation: document.getElementById("precipitation"),
  pressure: document.getElementById("pressure"),
  forecastContainer: document.getElementById("forecastContainer"),
};

/**
 * Mostra o indicador de carregamento
 */
export function showLoading() {
  elements.loading.classList.add("show");
  elements.error.classList.remove("show");
  elements.weatherInfo.classList.remove("show");
}

/**
 * Esconde o indicador de carregamento
 */
export function hideLoading() {
  elements.loading.classList.remove("show");
}

/**
 * Mostra uma mensagem de erro
 * @param {string} message - Mensagem de erro
 */
export function showError(message) {
  elements.error.textContent = message;
  elements.error.classList.add("show");
  elements.weatherInfo.classList.remove("show");
}

/**
 * Esconde a mensagem de erro
 */
export function hideError() {
  elements.error.classList.remove("show");
}

/**
 * Formata a data para exibição
 * @param {string} dateString - Data no formato ISO
 * @returns {Object} Objeto com dia da semana e data formatada
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return {
    dayName: dayName,
    dateFormatted: `${day} ${month}`,
  };
}

/**
 * Cria um card de previsão diária
 * @param {Object} dayData - Dados do dia
 * @param {number} index - Índice do dia
 * @returns {string} HTML do card
 */
function createForecastCard(dayData, index) {
  const { dayName, dateFormatted } = formatDate(dayData.date);
  const weatherInfo = getWeatherIcon(dayData.weatherCode);
  const label = index === 0 ? "Hoje" : dayName;

  return `
        <div class="forecast-card">
            <div class="forecast-day">${label}</div>
            <div class="forecast-date">${dateFormatted}</div>
            <div class="forecast-icon">${weatherInfo.icon}</div>
            <div class="forecast-temp-max">${Math.round(dayData.tempMax)}°</div>
            <div class="forecast-temp-min">${Math.round(dayData.tempMin)}°</div>
            <div class="forecast-precipitation">💧 ${Math.round(
              dayData.precipitation
            )}%</div>
        </div>
    `;
}

/**
 * Exibe a previsão de 7 dias
 * @param {Object} dailyData - Dados diários da API
 */
function displayForecast(dailyData) {
  const forecastHTML = dailyData.time
    .map((date, index) => {
      return createForecastCard(
        {
          date: date,
          weatherCode: dailyData.weather_code[index],
          tempMax: dailyData.temperature_2m_max[index],
          tempMin: dailyData.temperature_2m_min[index],
          precipitation: dailyData.precipitation_probability_max[index],
        },
        index
      );
    })
    .join("");

  elements.forecastContainer.innerHTML = forecastHTML;
}

/**
 * Exibe os dados meteorológicos na interface
 * @param {Object} data - Dados de localização, clima atual e previsão
 */
export function displayWeather(data) {
  const { location, current, daily } = data;

  // Atualizar localização
  const locationText = `${location.name}${
    location.admin1 ? ", " + location.admin1 : ""
  }, ${location.country}`;
  elements.location.textContent = locationText;

  // Atualizar temperatura
  elements.temperature.textContent = `${Math.round(current.temperature_2m)}°C`;

  // Atualizar detalhes
  elements.humidity.textContent = `${current.relative_humidity_2m}%`;
  elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  elements.precipitation.textContent = `${current.precipitation} mm`;
  elements.pressure.textContent = `${Math.round(current.pressure_msl)} hPa`;

  // Exibir previsão de 7 dias
  displayForecast(daily);

  // Mostrar informações
  elements.weatherInfo.classList.add("show");
}

/**
 * Obtém o valor do input da cidade
 * @returns {string} Nome da cidade
 */
export function getCityInput() {
  return elements.cityInput.value.trim();
}

/**
 * Limpa o input da cidade
 */
export function clearCityInput() {
  elements.cityInput.value = "";
}

/**
 * Retorna os elementos do DOM
 * @returns {Object} Elementos do DOM
 */
export function getElements() {
  return elements;
}

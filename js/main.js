/**
 * Arquivo principal - Coordena a lógica do aplicativo
 */

import { getCompleteWeatherData } from "./api.js";
import {
  showLoading,
  hideLoading,
  showError,
  displayWeather,
  getCityInput,
  getElements,
} from "./ui.js";

/**
 * Função principal que busca e exibe o clima
 */
async function searchWeather() {
  const city = getCityInput();

  // Validar entrada
  if (!city) {
    showError("Por favor, digite o nome de uma cidade");
    return;
  }

  // Mostrar loading
  showLoading();

  try {
    // Buscar dados da API
    const data = await getCompleteWeatherData(city);

    // Exibir dados na interface
    displayWeather(data);
  } catch (error) {
    showError(
      error.message || "Erro ao buscar dados meteorológicos. Tente novamente."
    );
    console.error("Erro:", error);
  } finally {
    hideLoading();
  }
}

/**
 * Inicializa os event listeners
 */
function initializeEventListeners() {
  const elements = getElements();

  // Click no botão de busca
  elements.searchBtn.addEventListener("click", searchWeather);

  // Enter no input
  elements.cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchWeather();
    }
  });

  // Focus no input ao carregar a página
  elements.cityInput.focus();
}

/**
 * Inicializa o aplicativo
 */
function init() {
  console.log("🌤️ Aplicativo de Clima iniciado!");
  initializeEventListeners();
}

// Executar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", init);

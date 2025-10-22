// js/main.js (consolidado)

import {
  getCompleteWeatherData,
  getWeatherData,
  setApiLanguage,
  setUnits,
} from "./api.js";
import {
  showLoading,
  hideLoading,
  showError,
  displayWeather,
  renderHourly,
  getCityInput,
  getElements,
  initBackground,
  renderAlerts,
  showTip,
} from "./ui.js";

const els = getElements();

/* ---------- Autocomplete Open‑Meteo ---------- */
const suggestionsEl = document.getElementById("suggestions");
let debounceId = null;
let activeIndex = -1;
let currentResults = [];
let lastPicked = null;

function formatSuggestion(item) {
  const parts = [item.name, item.admin1 || null, item.country].filter(Boolean);
  return parts.join(", ");
}

async function fetchSuggestions(q) {
  const lang = localStorage.getItem("skyview:lang") || "pt";
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=8&language=${lang}&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

function renderSuggestions(list) {
  suggestionsEl.innerHTML = list
    .map(
      (r, i) => `
    <li data-index="${i}" ${i === activeIndex ? 'class="active"' : ""}>
      <span>${formatSuggestion(r)}</span>
      <span class="sub">${r.latitude.toFixed(2)}, ${r.longitude.toFixed(
        2
      )}</span>
    </li>
  `
    )
    .join("");
  suggestionsEl.classList.toggle("show", list.length > 0);
}

function clearSuggestions() {
  activeIndex = -1;
  currentResults = [];
  suggestionsEl.classList.remove("show");
  suggestionsEl.innerHTML = "";
}

async function onInputChanged(e) {
  const q = e.target.value.trim();
  if (!q) {
    clearSuggestions();
    lastPicked = null;
    return;
  }
  clearTimeout(debounceId);
  debounceId = setTimeout(async () => {
    try {
      currentResults = await fetchSuggestions(q);
      activeIndex = -1;
      renderSuggestions(currentResults);
    } catch (_) {
      /* silencioso */
    }
  }, 200);
}

function selectSuggestion(index) {
  const item = currentResults[index];
  if (!item) return;
  lastPicked = item;
  els.cityInput.value = formatSuggestion(item);
  clearSuggestions();
  void searchWeather();
}

function onKeyDown(e) {
  if (!suggestionsEl.classList.contains("show")) return;
  const max = currentResults.length;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex = (activeIndex + 1) % max;
    renderSuggestions(currentResults);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex = (activeIndex - 1 + max) % max;
    renderSuggestions(currentResults);
  } else if (e.key === "Enter") {
    if (activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(activeIndex);
    }
  } else if (e.key === "Escape") {
    clearSuggestions();
  }
}

suggestionsEl.addEventListener("click", (e) => {
  e.preventDefault();
  const li = e.target.closest("li");
  if (!li) return;
  const idx = Number(li.dataset.index);
  selectSuggestion(idx);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-autocomplete")) clearSuggestions();
});

els.cityInput.addEventListener("input", onInputChanged);
els.cityInput.addEventListener("keydown", onKeyDown);

/* ---------- Favoritos & Geolocalização ---------- */
const FAV_KEY = "skyview:favorites";

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveFavorites(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list.slice(0, 20)));
}
function renderFavChips() {
  const box = document.getElementById("favChips");
  const favs = loadFavorites();
  box.innerHTML = favs
    .map(
      (f, i) =>
        `<span class="chip" data-i="${i}">${f}<span class="x">×</span></span>`
    )
    .join("");
}
function addFavorite(label) {
  const favs = loadFavorites();
  if (!favs.includes(label)) favs.unshift(label);
  saveFavorites(favs);
  renderFavChips();
}
function removeFavoriteAt(i) {
  const favs = loadFavorites();
  favs.splice(i, 1);
  saveFavorites(favs);
  renderFavChips();
}
document.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (chip && e.target.classList.contains("x"))
    removeFavoriteAt(Number(chip.dataset.i));
  else if (chip) {
    els.cityInput.value = chip.textContent.replace("×", "").trim();
    searchWeather();
  }
});
document.getElementById("favBtn").addEventListener("click", () => {
  const val = document.getElementById("location").textContent.trim();
  if (val) addFavorite(val);
});
renderFavChips();

document.getElementById("geoBtn").addEventListener("click", async () => {
  if (!navigator.geolocation) {
    alert("Geolocalização não suportada.");
    return;
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const w = await getWeatherData(latitude, longitude);
        const data = {
          location: {
            name: "Sua localização",
            country: "",
            admin1: "",
            latitude,
            longitude,
          },
          current: w.current,
          daily: w.daily,
          hourly: w.hourly,
        };
        displayWeather(data);
        renderHourly(data.hourly);
        renderAlerts(data.hourly);
        showTip(data.current, data.hourly);
      } catch (err) {
        showError("Não foi possível carregar sua localização.");
      } finally {
        hideLoading();
      }
    },
    () => {
      showError("Permissão negada ou indisponível.");
      hideLoading();
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

/* ---------- Busca Clima (ÚNICA definição) ---------- */
els.searchBtn.addEventListener("click", searchWeather);
els.cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !suggestionsEl.classList.contains("show"))
    searchWeather();
});

async function searchWeather() {
  const typed = getCityInput();
  if (!typed && !lastPicked) {
    showError("Por favor, digite o nome de uma cidade");
    return;
  }
  showLoading();
  try {
    let data;
    if (lastPicked) {
      const w = await getWeatherData(lastPicked.latitude, lastPicked.longitude);
      data = {
        location: {
          name: lastPicked.name,
          country: lastPicked.country,
          admin1: lastPicked.admin1,
          latitude: lastPicked.latitude,
          longitude: lastPicked.longitude,
        },
        current: w.current,
        daily: w.daily,
        hourly: w.hourly,
      };
      lastPicked = null;
    } else {
      data = await getCompleteWeatherData(typed);
    }
    displayWeather(data);
    renderHourly(data.hourly);
    renderAlerts(data.hourly);
    showTip(data.current, data.hourly);
  } catch (err) {
    showError(
      err.message || "Erro ao buscar dados meteorológicos. Tente novamente."
    );
    console.error(err);
  } finally {
    hideLoading();
  }
}

/* ---------- i18n ---------- */
const langSelect = document.getElementById("langSelect");
langSelect.value = localStorage.getItem("skyview:lang") || "pt";
setApiLanguage(langSelect.value);

const I18N = {
  pt: {
    humidity: "Umidade",
    wind: "Vento",
    precipitation: "Precipitação",
    pressure: "Pressão",
    next7: "Próximos 7 Dias",
    hourly: "Hoje por hora",
  },
  en: {
    humidity: "Humidity",
    wind: "Wind",
    precipitation: "Precipitation",
    pressure: "Pressure",
    next7: "Next 7 Days",
    hourly: "Today hourly",
  },
  es: {
    humidity: "Humedad",
    wind: "Viento",
    precipitation: "Precipitación",
    pressure: "Presión",
    next7: "Próximos 7 días",
    hourly: "Hoy por hora",
  },
};
function t(k) {
  const l = localStorage.getItem("skyview:lang") || "pt";
  return I18N[l][k] || k;
}
function applyLabels() {
  document.getElementById("lblHumidity").textContent = t("humidity");
  document.getElementById("lblWind").textContent = t("wind");
  document.getElementById("lblPrec").textContent = t("precipitation");
  document.getElementById("lblPress").textContent = t("pressure");
  document.getElementById("titleNext7").textContent = `📅 ${t("next7")}`;
  document.getElementById("titleHourly").textContent = `🕒 ${t("hourly")}`;
}
applyLabels();
langSelect.addEventListener("change", () => {
  const lang = langSelect.value;
  localStorage.setItem("skyview:lang", lang);
  setApiLanguage(lang);
  applyLabels();
  const loc = document.getElementById("location").textContent.trim();
  if (loc) searchWeather();
});

/* ---------- Unidades e Tema ---------- */
const unitSelect = document.getElementById("unitSelect");
const themeToggle = document.getElementById("themeToggle");

unitSelect.value = localStorage.getItem("skyview:units") || "metric";
setUnits(unitSelect.value);
unitSelect.addEventListener("change", () => {
  setUnits(unitSelect.value);
  const loc = document.getElementById("location").textContent.trim();
  if (loc) searchWeather();
});

function applyTheme() {
  const mode = localStorage.getItem("skyview:theme") || "system";
  let final = mode;
  if (mode === "system") {
    final = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  document.documentElement.setAttribute("data-theme", final);
}
themeToggle.value = localStorage.getItem("skyview:theme") || "system";
applyTheme();
themeToggle.addEventListener("change", () => {
  localStorage.setItem("skyview:theme", themeToggle.value);
  applyTheme();
});
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if ((localStorage.getItem("skyview:theme") || "system") === "system")
      applyTheme();
  });

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initBackground();
});

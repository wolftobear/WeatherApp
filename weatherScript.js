const cityInput = document.getElementById("cityInput");
const weatherSearchBtn = document.getElementById("weatherSearchBtn");
const currentLocationBtn = document.getElementById("currentLocationBtn");

const cityDisplay = document.getElementById("city");
const tempDisplay = document.getElementById("temperature");
const conditionDisplay = document.getElementById("condition");
const humidityDisplay = document.getElementById("humidity");
const windDisplay = document.getElementById("wind");
const iconDisplay = document.getElementById("weatherIcon");

const errorDisplay = document.getElementById("weatherError");
const loadingDisplay = document.getElementById("weatherLoading");


/* ===== SEARCH WEATHER BY CITY ===== */

async function getWeather() {

  const city = cityInput.value.trim();

  // Check if user entered a city
  if (!city) {
    errorDisplay.textContent = "Please enter a city";
    return;
  }

  errorDisplay.textContent = "";
  loadingDisplay.textContent = "Loading...";

  try {

    // Get latitude and longitude from city name
    const locRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    const locData = await locRes.json();

    // Check if city exists
    if (!locData.results || locData.results.length === 0) {
      throw new Error("City not found");
    }

    const {
      latitude,
      longitude,
      name,
      country
    } = locData.results[0];


    // Get weather using coordinates
    await getWeatherByCoordinates(
      latitude,
      longitude,
      `${name}, ${country}`
    );

  } catch (error) {

    errorDisplay.textContent = error.message;

  } finally {

    loadingDisplay.textContent = "";

  }

}


/* ===== GET WEATHER BY CURRENT LOCATION ===== */

function getCurrentLocation() {

  // Check if browser supports location
  if (!navigator.geolocation) {

    errorDisplay.textContent =
      "Geolocation is not supported by your browser.";

    return;

  }

  errorDisplay.textContent = "";
  loadingDisplay.textContent =
    "Finding your current location...";


  // Ask user for their location
  navigator.geolocation.getCurrentPosition(

    async function(position) {

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {

        // Get weather using current coordinates
        await getWeatherByCoordinates(
          latitude,
          longitude,
          "Your Current Location"
        );

      } catch (error) {

        errorDisplay.textContent =
          "Unable to get weather for your location.";

      } finally {

        loadingDisplay.textContent = "";

      }

    },

    function(error) {

      loadingDisplay.textContent = "";

      if (error.code === 1) {

        errorDisplay.textContent =
          "Location permission was denied. Please allow location access.";

      } else if (error.code === 2) {

        errorDisplay.textContent =
          "Your location could not be found.";

      } else if (error.code === 3) {

        errorDisplay.textContent =
          "Location request timed out.";

      } else {

        errorDisplay.textContent =
          "Unable to get your current location.";

      }

    }

  );

}


/* ===== GET WEATHER USING COORDINATES ===== */

async function getWeatherByCoordinates(
  latitude,
  longitude,
  locationName
) {

  // Get current weather
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m&temperature_unit=fahrenheit&windspeed_unit=mph`
  );

  const weatherData = await weatherRes.json();

  if (!weatherData.current_weather) {
    throw new Error("Weather information is unavailable.");
  }

  const weather = weatherData.current_weather;


  // Update city name
  cityDisplay.textContent = locationName;


  // Update temperature
  tempDisplay.textContent =
    `${Math.round(weather.temperature)}°F`;


  // Update wind speed
  windDisplay.textContent =
    `${Math.round(weather.windspeed)} mph`;


  // Update weather condition
  conditionDisplay.textContent =
    getCondition(weather.weathercode);


  // Update weather icon
  iconDisplay.src =
    getIcon(weather.weathercode);

  iconDisplay.alt =
    getCondition(weather.weathercode);


  // Find humidity for current hour
  if (
    weatherData.hourly &&
    weatherData.hourly.time &&
    weatherData.hourly.relative_humidity_2m
  ) {

    const hourIdx =
      weatherData.hourly.time.indexOf(weather.time);

    if (hourIdx !== -1) {

      humidityDisplay.textContent =
        `${weatherData.hourly.relative_humidity_2m[hourIdx]}%`;

    } else {

      humidityDisplay.textContent = "N/A";

    }

  } else {

    humidityDisplay.textContent = "N/A";

  }

}


/* ===== WEATHER CONDITIONS ===== */

function getCondition(code) {

  const conditions = {

    0: "Clear Sky",

    1: "Mainly Clear",

    2: "Partly Cloudy",

    3: "Cloudy",

    45: "Foggy",

    48: "Foggy",

    51: "Light Drizzle",

    53: "Drizzle",

    55: "Heavy Drizzle",

    61: "Light Rain",

    63: "Rain",

    65: "Heavy Rain",

    71: "Light Snow",

    73: "Snow",

    75: "Heavy Snow",

    80: "Rain Showers",

    81: "Heavy Rain Showers",

    82: "Heavy Rain Showers",

    95: "Thunderstorm",

    96: "Thunderstorm with Hail",

    99: "Thunderstorm with Heavy Hail"

  };

  return conditions[code] || "Unknown";

}


/* ===== WEATHER ICONS ===== */

function getIcon(code) {

  // Clear sky
  if (code === 0) {
    return "https://cdn-icons-png.flaticon.com/512/869/869869.png";
  }

  // Partly cloudy
  if (code === 1 || code === 2) {
    return "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";
  }

  // Cloudy
  if (code === 3) {
    return "https://cdn-icons-png.flaticon.com/512/414/414825.png";
  }

  // Fog
  if (code === 45 || code === 48) {
    return "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
  }

  // Rain
  if (code >= 51 && code <= 67) {
    return "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";
  }

  // Snow
  if (code >= 71 && code <= 77) {
    return "https://cdn-icons-png.flaticon.com/512/642/642102.png";
  }

  // Rain showers
  if (code >= 80 && code <= 82) {
    return "https://cdn-icons-png.flaticon.com/512/1163/1163627.png";
  }

  // Thunderstorm
  if (code >= 95) {
    return "https://cdn-icons-png.flaticon.com/512/1146/1146860.png";
  }

  // Default icon
  return "https://cdn-icons-png.flaticon.com/512/869/869869.png";

}


/* ===== BUTTON EVENTS ===== */

// Search button
weatherSearchBtn.addEventListener(
  "click",
  getWeather
);


// Press Enter to search
cityInput.addEventListener(
  "keyup",
  (event) => {

    if (event.key === "Enter") {
      getWeather();
    }

  }
);


// Current location button
currentLocationBtn.addEventListener(
  "click",
  getCurrentLocation
);
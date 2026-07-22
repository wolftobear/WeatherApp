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


    if (!city) {

        errorDisplay.textContent = "Please enter a city";

        return;

    }


    errorDisplay.textContent = "";

    loadingDisplay.textContent = "Loading...";


    try {


        const locRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );


        const locData = await locRes.json();



        if (!locData.results || locData.results.length === 0) {

            throw new Error("City not found");

        }



        const {

            latitude,
            longitude,
            name,
            country

        } = locData.results[0];



        await getWeatherByCoordinates(

            latitude,
            longitude,
            `${name}, ${country}`

        );



    } catch(error) {


        errorDisplay.textContent = error.message;


    } finally {


        loadingDisplay.textContent = "";


    }

}




/* ===== CURRENT LOCATION WEATHER ===== */


function getCurrentLocation() {


    if (!navigator.geolocation) {


        errorDisplay.textContent =
        "Geolocation is not supported by your browser.";


        return;

    }



    errorDisplay.textContent = "";

    loadingDisplay.textContent =
    "Finding your location...";




    navigator.geolocation.getCurrentPosition(



        async function(position) {



            const latitude = position.coords.latitude;

            const longitude = position.coords.longitude;



            try {



                await getWeatherByCoordinates(

                    latitude,

                    longitude,

                    "Your Current Location"

                );



            } catch(error) {



                errorDisplay.textContent =
                "Unable to get weather.";



            } finally {


                loadingDisplay.textContent = "";


            }



        },



        function(error) {



            loadingDisplay.textContent = "";



            if(error.code === 1) {


                errorDisplay.textContent =
                "Location permission denied.";


            }


            else if(error.code === 2) {


                errorDisplay.textContent =
                "Location unavailable.";


            }


            else if(error.code === 3) {


                errorDisplay.textContent =
                "Location timed out.";


            }


            else {


                errorDisplay.textContent =
                "Unable to get location.";


            }


        }


    );


}





/* ===== WEATHER USING COORDINATES ===== */


async function getWeatherByCoordinates(
    latitude,
    longitude,
    locationName
) {



    const weatherRes = await fetch(

        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m&temperature_unit=fahrenheit&windspeed_unit=mph`

    );



    const weatherData = await weatherRes.json();



    if(!weatherData.current_weather) {


        throw new Error(
            "Weather unavailable"
        );


    }



    const weather = weatherData.current_weather;



    cityDisplay.textContent = locationName;



    tempDisplay.textContent =
    `${Math.round(weather.temperature)}°F`;



    windDisplay.textContent =
    `${Math.round(weather.windspeed)} mph`;



    conditionDisplay.textContent =
    getCondition(weather.weathercode);





    /* ===== WEATHER ICON FIX ===== */


    iconDisplay.style.display = "none";


    iconDisplay.src =
    getIcon(weather.weathercode);



    iconDisplay.alt =
    getCondition(weather.weathercode);



    iconDisplay.onload = function(){

        iconDisplay.style.display = "block";

    };





    /* ===== HUMIDITY ===== */


    if(
        weatherData.hourly &&
        weatherData.hourly.time &&
        weatherData.hourly.relative_humidity_2m
    ) {



        const hourIndex =
        weatherData.hourly.time.indexOf(weather.time);



        if(hourIndex !== -1) {



            humidityDisplay.textContent =
            `${weatherData.hourly.relative_humidity_2m[hourIndex]}%`;



        }

        else {


            humidityDisplay.textContent =
            "N/A";


        }


    }

    else {


        humidityDisplay.textContent =
        "N/A";


    }



}






/* ===== CONDITIONS ===== */


function getCondition(code){


const conditions = {


0:"Clear Sky",

1:"Mainly Clear",

2:"Partly Cloudy",

3:"Cloudy",

45:"Foggy",

48:"Foggy",

51:"Light Drizzle",

53:"Drizzle",

55:"Heavy Drizzle",

61:"Light Rain",

63:"Rain",

65:"Heavy Rain",

71:"Light Snow",

73:"Snow",

75:"Heavy Snow",

80:"Rain Showers",

81:"Heavy Rain Showers",

82:"Heavy Rain Showers",

95:"Thunderstorm",

96:"Thunderstorm With Hail",

99:"Thunderstorm With Heavy Hail"


};



return conditions[code] || "Unknown";


}







/* ===== ICONS ===== */


function getIcon(code){



if(code === 0){

return "https://cdn-icons-png.flaticon.com/512/869/869869.png";

}



if(code === 1 || code === 2){

return "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";

}



if(code === 3){

return "https://cdn-icons-png.flaticon.com/512/414/414825.png";

}



if(code === 45 || code === 48){

return "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";

}



if(code >= 51 && code <= 67){

return "https://cdn-icons-png.flaticon.com/512/1163/1163624.png";

}



if(code >= 71 && code <= 77){

return "https://cdn-icons-png.flaticon.com/512/642/642102.png";

}



if(code >= 80 && code <= 82){

return "https://cdn-icons-png.flaticon.com/512/1163/1163627.png";

}



if(code >= 95){

return "https://cdn-icons-png.flaticon.com/512/1146/1146860.png";

}



return "https://cdn-icons-png.flaticon.com/512/869/869869.png";


}






/* ===== BUTTONS ===== */


weatherSearchBtn.addEventListener(

"click",

getWeather

);



cityInput.addEventListener(

"keyup",

(event)=>{


if(event.key === "Enter"){


getWeather();


}


}

);



currentLocationBtn.addEventListener(

"click",

getCurrentLocation

);

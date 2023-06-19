import { database, } from "./config.js";
import { collection, getDocs, addDoc, Timestamp, doc, setDoc, onSnapshot, where, limit, orderBy, getDoc, query, DocumentReference } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import storeCities from "./storeCities.js"

let city = "Boston";

async function getLocation(cityName) {
    cityName = cityName.replaceAll(" ", "+");
    const locationURL = "https://geocoding-api.open-meteo.com/v1/search?";
    let city = "name=" + cityName;
    const locationquery = "&count=1&language=en&format=json";
    var promise = new Promise((resolve, reject) => {
        fetch(locationURL + city + locationquery)
        .then((response) => response.json())
        .then((json) => readLocationData(json))
        .then((loc) => resolve(loc))
    });
    return promise.then((loc) => { return loc; });
}

async function getWeather(lat, long) {
    const weatherParentURL = "https://api.open-meteo.com/v1/forecast?"

    let location = "latitude=" + lat + "&longitude=" + long;
    let weatherQuery = "&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,rain,visibility,windspeed_10m,uv_index,is_day&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&past_days=7&timezone=America%2FNew_York&current_weather=true";
    var promise = new Promise((resolve, reject) => {
        fetch(weatherParentURL + location + weatherQuery)
        .then((response) => response.json())
        .then((json) => readWeatherData(json))
        .then((weather) => resolve(weather))
    });
    return promise.then((weather) => { return weather; });
}

async function getAirQuality(lat, long) {
    const airQualityURL = "https://air-quality-api.open-meteo.com/v1/air-quality?";
    let location = "latitude=" + lat + "&longitude=" + long;
    const aqQuery = "&hourly=us_aqi&timezone=America%2FNew_York";
    var promise = new Promise((resolve, reject) => {
        fetch(airQualityURL + location + aqQuery)
        .then((response) => response.json())
        .then((json) => readAirQualityData(json))
        .then((aQ) => resolve(aQ))
    });
    return promise.then((aq) => { return aq; });
}

async function getNewspapersForcity(city) {
    const apiKey = "api_token=awxopcUsxaSX7DSsDBBuB3d5110DvROANSPWa0QZ";
    const newsAPIURL = "https://api.thenewsapi.com/v1/news/all?"
    const newsQuery = "&search=" + city;
    var promise = new Promise((resolve, reject) => {
        fetch(newsAPIURL + apiKey + newsQuery)
        .then((response) => response.json())
        .then((json) => readNewsHeadlinesData(json))
        .then((news) => resolve(news))
    });
    return promise.then((news) => { return news; });
}
function readLocationData(json) {
    let lat = json.results[0].latitude;
    let long = json.results[0].longitude;

    let Loc = {
        lat: lat,
        long: long
    };
    return Loc;
}

function readWeatherData(json) {
    console.log(json);
    let weather = "";
    let temperatures = [];
    let times = [];
    let realtiveTemps = [];
    let rain = [];
    let uv_index = [];
    let relativehumidities = [];
    let windspeeds = [];
    let len = 0;


    for (let i = 12; i < json.hourly.relativehumidity_2m.length; i += 24) {
        temperatures[len] = json.hourly.temperature_2m[i];
        times[len] = json.hourly.time[i];
        realtiveTemps[len] = json.hourly.apparent_temperature[i];
        rain[len] = json.hourly.rain[i];
        uv_index[len] = json.hourly.uv_index[i];
        relativehumidities[len] = json.hourly.relativehumidity_2m[i];
        windspeeds[len] = json.hourly.windspeed_10m[i];
        len++;
    }

    let Weather = {
        cityName: city,
        weatherLen: len,
        temperature: temperatures,
        time: times,
        relativeTemp: realtiveTemps,
        rain: rain,
        uv_index: uv_index,
        relativehumidity: relativehumidities,
        windspeed: windspeeds,
        current_weather: json.current_weather,
        current_time: json.current_weather.time
    };
    console.log(Weather);
    return Weather;
}

function readAirQualityData(json) {

    console.log(json);
    console.log("aq: " + json.hourly.us_aqi[json.hourly.us_aqi.length - 5]);
    return json.hourly.us_aqi[json.hourly.us_aqi.length - 5];
}

function readNewsHeadlinesData(json) {
    console.log(json);
    let len = json.meta.returned;
    let titles = [];
    let descs = [];
    let snippets = [];
    let urls = [];
    let publishers = [];
    let News = {
        numStories: len
    };
    for (let i = 0; i < len; i++) {
        titles.push(json.data[i].title);
        descs.push(json.data[i].description);
        snippets.push(json.data[i].snippet);
        urls.push(json.data[i].url);
        publishers.push(json.data[i].source);
    }

    for (let i = 0; i < len; i++) {

        News["news-" + i] = {
            title: titles[i],
            description: descs[i],
            snippet: snippets[i],
            url: urls[i],
            publisher: publishers[i]
        };
    }

    return News;

}

let input = document.getElementById("input");
let cityNameText = document.getElementById("location");
let dateText = document.getElementById("date");
let currentTempText = document.getElementById("temp");
let humidityText = document.getElementById("humidity");
let airQualityText = document.getElementById("airquality");
let feelsText = document.getElementById("feels");
let windText = document.getElementById("wind");
let newsText = document.getElementById("news");

// news text
let newsTitleText = document.getElementById("title");
let newsSourceText = document.getElementById("source");
let newsURLText = document.getElementById("real-url");
let newsButtonText = document.getElementById("next-news");




async function AddToDatabase(cityName) {

    let Weather = new Object();
    const weather = await getLocation(cityName)
        .then((loc) => {
            Weather = Object.assign(Weather, loc);
            return getWeather(loc.lat, loc.long)
        })
        .then((weather) => {
            Weather = Object.assign(Weather, weather);
            console.log(weather.temperature);
            console.log(Weather.temperature);
            return getAirQuality(Weather.lat, Weather.long);
        })
        .then((aQ) => {
            Weather["air_quality"] = aQ;
            return getNewspapersForcity(cityName);
        })
        .then((news) => {
            Weather = Object.assign(Weather, news);
        });

    let storeCity = new storeCities(cityName, Weather);
    console.log(Weather.len);
    return Weather;
}

async function OnEnter(cityName) {

    let cityStored = await storeCities.getCity(cityName)
        .then((doc) => {
            console.log(doc);
            if (doc === undefined) {
                console.log("Jimin");
                return AddToDatabase(cityName);
            }
            else {
                console.log("Namjoon");
                return storeCities.loadCity(doc);
            }
        })
        .then((cityData) => {
            cityDataGlobal = cityData;
            LoadCityData(cityData)
        });
}

function LoadCityData(cityD) {
    cityNameText.textContent = cityD.cityName;
    dateText.textContent = new Date().getDay();
    currentTempText.textContent = cityD.current_weather.temperature + "F";
    humidityText.textContent = cityD.relativehumidity[cityD.weatherLen - 1] + "%";
    airQualityText.textContent = cityD.air_quality;
    feelsText.textContent = cityD.relativeTemp[cityD.weatherLen - 1] + "F";
    windText.textContent = cityD.windspeed[cityD.weatherLen - 1] + " mph";

    NextNews(cityD, 0);
}

function NextNews(cityD, i) {
    console.log(i);
    i %= 3;
    let index = "news-" + i;
    newsTitleText.textContent = cityD[index]["title"];
    newsSourceText.textContent = cityD[index]["publisher"];
    newsURLText.href = cityD[index]["url"];
}


let newsIndex = 0;
let cityDataGlobal;

newsButtonText.addEventListener("click", function () {
    newsIndex += 1;
    console.log(newsIndex);
    NextNews(cityDataGlobal, newsIndex);
});

input.addEventListener("keypress", function (event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        city = input.value
        OnEnter(city);
    }

})

/*
buttonName.addEventListener("click", function () {
    
})
*/

let weatherAPIKey = "f1ef6b8a9d3da4fad1808762318579b3";
let weatherBaseEndPoint =
  "https://api.openweathermap.org/data/2.5/weather?&appid=" +
  weatherAPIKey +
  "&units=metric";
let forecastBaseEndPoint =
  "https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=" +
  weatherAPIKey;
let geoCodingBaseendPoint =
  "https://api.openweathermap.org/geo/1.0/direct?limit=5&appid=" +
  weatherAPIKey +
  "&q=";
let reverseCodingBaseEndPoint =
  "http://api.openweathermap.org/geo/1.0/reverse?&appid=" + weatherAPIKey;
let searchInp = document.querySelector(".weather_search");
let city = document.querySelector(".weather_city");
let day = document.querySelector(".weather_day");
let humidity = document.querySelector(".weather_indicator--humidity>.value");
let wind = document.querySelector(".weather_indicator--wind>.value");
let pressure = document.querySelector(".weather_indicator--pressure>.value");
let temperature = document.querySelector(".weather_temperature>.value");
let image = document.querySelector(".weather_image");
let forecastBlock = document.querySelector(".weather_forecast");
let datalist = document.querySelector("#suggestions");

//Selectors------------------------------------------------
let weatherImages = [
  {
    url: "./images/broken-clouds.png",
    ids: [803, 804],
  },
  {
    url: "./images/clear-sky.png",
    ids: [800],
  },
  {
    url: "./images/few-clouds.png",
    ids: [801],
  },
  {
    url: "./images/mist.png",
    ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
  },
  {
    url: "./images/rain.png",
    ids: [500, 501, 502, 503, 504],
  },
  {
    url: "./images/scattered-clouds.png",
    ids: [802],
  },
  {
    url: "./images/shower-rain.png",
    ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321],
  },
  {
    url: "./images/snow.png",
    ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
  },
  {
    url: "./images/thunderstrom.png",
    ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
  },
];
function show() {
  navigator.geolocation.getCurrentPosition(success, error);
}
async function success(pos) {
  let crd = pos.coords;
  let lat = crd.latitude.toString();
  let lng = crd.longitude.toString();
  let endpoint = reverseCodingBaseEndPoint + "&lat=" + lat + "&lon=" + lng;
  let result = await fetch(endpoint);
  result = await result.json();
  console.log(result);
  Swal.fire({
    icon: "success",
    title: result[0].name,
    text: result[0].state,
  });
}
function error(err) {
  Swal.fire({
    icon: "error",
    title: err.code,
    text: err.msg,
  });
  return;
}
let getWeatherByCityName = async (city) => {
  let endpoint = weatherBaseEndPoint + "&q=" + city;
  let response = await fetch(endpoint);
  let weather = await response.json();
  return weather;
};

let getForecastByCityId = async (id) => {
  let endpoint = forecastBaseEndPoint + "&id=" + id;
  let result = await fetch(endpoint);
  let forecast = await result.json();
  let forecastList = forecast.list;
  let daily = [];
  forecastList.forEach((day) => {
    let date_txt = day.dt_txt;
    date_txt = date_txt.replace(" ", "T");
    let date = new Date(date_txt);
    let hours = date.getHours();
    if (hours === 12) {
      daily.push(day);
    }
  });
  return daily;
};
//----------------------------filling data in current Weather-------
let updateCurrentWeather = (data) => {
  city.innerText = data.name;
  day.innerText = dayOfWeek();
  humidity.innerText = data.main.humidity;
  pressure.innerText = data.main.pressure;
  let windDirection;
  let deg = data.wind.deg;
  if (deg > 45 && deg <= 135) {
    windDirection = "East";
  } else if (deg > 135 && deg <= 225) {
    windDirection = "South";
  } else if (deg > 225 && deg <= 315) {
    windDirection = "West";
  } else {
    windDirection = "North";
  }
  wind.innerText = windDirection + "," + data.wind.speed;
  temperature.innerText =
    data.main.temp > 0
      ? "+" + Math.round(data.main.temp)
      : Math.round(data.main.temp);
  let imgId = data.weather[0].id;
  weatherImages.forEach((obj) => {
    if (obj.ids.indexOf(imgId) != -1) {
      image.src = obj.url;
    }
  });
};
//--------------to get day like Sunday----------
let dayOfWeek = (dt = new Date().getTime()) => {
  // if (dt === undefined) {
  //   dt = new Date().getTime();
  // }
  let today = new Date(dt).toLocaleDateString("en-EN", { weekday: "long" });
  return today;
};
//---------------------------------------------------
let weatherForCity = async (city) => {
  let weather = await getWeatherByCityName(city);
  if (weather.cod === "404") {
    Swal.fire({
      icon: "error",
      title: "OOPs....",
      text: "You typed wrong city name",
    });
    return;
  }
  updateCurrentWeather(weather);
  let cityId = weather.id;
  let forecast = await getForecastByCityId(cityId);
  updateForecast(forecast);
};
searchInp.addEventListener("keydown", async (e) => {
  if (e.keyCode === 13) {
    weatherForCity(searchInp.value);
  }
});
searchInp.addEventListener("input", async () => {
  if (searchInp.value.length <= 2) {
    return;
  }
  let endpoint = geoCodingBaseendPoint + searchInp.value;
  let result = await fetch(endpoint);
  result = await result.json();
  datalist.innerHTML = "";
  result.forEach((city) => {
    let option = document.createElement("option");
    option.value = `${city.name}${city.state ? "," + city.state : ""},${
      city.country
    }`;
    datalist.appendChild(option);
  });
});

let updateForecast = (forecast) => {
  forecastBlock.innerHTML = "";
  let forecastItem = "";
  forecast.forEach((day) => {
    let iconUrl =
      "http://openweathermap.org/img/wn/" + day.weather[0].icon + "@2x.png";
    let temperature =
      day.main.temp > 0
        ? "+" + Math.round(day.main.temp)
        : Math.round(day.main.temp);
    let dayName = dayOfWeek(day.dt * 1000);
    forecastItem += ` <div class="my-card col-2 col-sm-2  p-4 card text-light " style="width: 10rem; ">
    <img src="${iconUrl}" class="card-img-top" alt="${day.weather[0].description}">
    <div class="card-body">
      <h5 class="card-title">${temperature}</h5>
      <p class="card-text">${dayName}</p>
    </div>
  </div>`;
  });
  forecastBlock.innerHTML = forecastItem;
};
//  getWeatherByCityName("Bhopal");
// <div class="card weather_forecast_item " style="width: 10rem;">
//     <img src="${iconUrl}" class="rounded mx-auto d-block card-img-top weather_forecast_icon" alt="${day.weather[0].description}">
//     <div class="card-body">
//       <h5 class=" "weather_forecast_day card-title">${dayName}</h5>
//       <p class=" weather_forecast_temperature card-text">
//         <span class="value">${temperature}</span> &deg;C
//       </p>
//     </div>
//   </div> col-sm-6 col-lg-3
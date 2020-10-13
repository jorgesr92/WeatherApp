// Go to this URL and register https://openweathermap.org/appid
// Get your API KEY (appid)

const apiKey = "77bcb017e0939c382dad9b04dcda2a5c";
let weather = {};
const searchImput = document.getElementById("citiesSearcher");
const searchBtn = document.getElementById("searchBtn");
const resultsSearch = document.getElementById("searchResults");
let citiesfound = "";



const changeMap = (lat, lon) => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZ2VzcjkyIiwiYSI6ImNrZzhiNG8weTBma2syeW52dDNrbDh0bzgifQ.f17Czkz9pV4iYe33N9g0PQ';
    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [lon, lat], // starting position [lng, lat]
    zoom: 9 // starting zoom
});
};

const onSuccess = (position) => {
    let {coords: {latitude, longitude}} = position;
    callWeather(latitude, longitude);
    changeMap(latitude, longitude);
};

const errorAlert = (errMessage) =>{
    const pNotification = document.createElement("p");
    pNotification.innerText = errMessage;

    const divNotification = document.getElementsByClassName("notification")[0];
    divNotification.style.display = "block";

    divNotification.appendChild(pNotification);
};

const onError = error => {
    console.error(error.message);
    errorAlert(error.message);
};

navigator.geolocation.getCurrentPosition(onSuccess, onError);

const callWeather = (lat, lon)=> {
    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(response => onSuccesResponse(response)).catch(error => onError(error))
};

const callCities = (city) => {
    fetch(`http://api.openweathermap.org/data/2.5/find?q=${city}&appid=${apiKey}`).then(response => onSuccessC(response)).catch(error => onError(error))
};

const onSuccessC = response => response.json().then(citiesSearch => {
    citiesfound = citiesSearch;
    console.log(citiesSearch);
    createListResults();
})

const onSuccesResponse = response => response.json().then(infoWeather => {
    weather = infoWeather;
    changeAll();
}).catch(error => onError(error));

const changeAll = (city = weather) => {
    const {main: {temp}} = city;
    const {name} = city;
    const {weather: [{icon, description}]} = city;
    const {sys: {country}} = city;
    changeIcon(icon);
    changeTemp(temp);
    changeTempDesc(description);
    changeLocation(name, country);
};

const fisrtCapital = (word) => {
    let words = word.split(" ");
    let results = words.map(element => {
        return element.charAt(0).toUpperCase() + element.slice(1);
    });
    results =results.join(" ");
    return results
};

const changeIcon = (icon) => {
    const imgIcon = document.getElementById("icon");
    imgIcon.src = `icons/${icon}.png`;
};

const changeTemp = (value) => {
    const pTemp = document.getElementById("pTemp");
    let tempString = pTemp.textContent;
    pTemp.innerText = tempString.replace(/-/, (value-273.15).toFixed(2));
};

const changeTempDesc = (description) => {
    const pDesc = document.getElementById("description");
    pDesc.innerText = fisrtCapital(description);
};

const changeLocation = (location, country) => {
    const pLoc = document.getElementById("location")
    pLoc.innerText = `${location}, ${country}`;
};

searchBtn.addEventListener("click", ()=>{
    let city = searchImput.value;
    callCities(city);
});

const createElementList = (city, ul) => {
    const liElement = document.createElement("li");
    const aElement = document.createElement("a");
    const imgIcon = document.createElement("img");

    liElement.style.listStyle = "none";
    liElement.style.marginTop = "1rem";
    imgIcon.style.width = "25px";
    
    liElement.innerText = `${city.name} - ${city.sys.country}`;
    imgIcon.src = `icons/${city.weather[0].icon}.png`;
    aElement.onclick = () => {
        changeMap(city.coord.lat, city.coord.lon);
        changeAll(city);
    }

    aElement.appendChild(liElement);
    ul.appendChild(aElement);
    ul.appendChild(imgIcon);
    weather = city;
};

const createListResults = () => {
    if (document.getElementById("result")) document.getElementById("result").remove();
    const listResults = document.createElement("ul");
    listResults.id = "result";
    listResults.style.marginLeft = "0px";
    listResults.style.paddingLeft = "0px";
    listResults.style.textAlign = "center";
    citiesfound.list.map(element => {
        createElementList(element, listResults);
        console.log(element)
    })
    
    resultsSearch.appendChild(listResults);
};






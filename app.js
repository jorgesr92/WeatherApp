// Go to this URL and register https://openweathermap.org/appid
// Get your API KEY (appid)

const apiKey = "77bcb017e0939c382dad9b04dcda2a5c";
let weather = {};
const searchImput = document.getElementById("citiesSearcher");
const searchBtn = document.getElementById("searchBtn");
const resultsSearch = document.getElementById("searchResults");
const favoritesDiv = document.getElementById("favoritesDiv");
let citiesfound = "";
let arrCities = [];

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
    createListResults();
})

const onSuccesResponse = response => response.json().then(infoWeather => {
    weather = infoWeather;
    changeAll();
}).catch(error => onError(error));

const changeAll = (city = weather, isMyCity = true) => {
    const {main: {temp}} = city;
    const {name} = city;
    const {weather: [{icon, description}]} = city;
    const {sys: {country}} = city;
    changeIcon(icon, isMyCity);
    changeTemp(temp, isMyCity);
    changeTempDesc(description, isMyCity);
    changeLocation(name, country, isMyCity);
    pushFavorites(city);
    addFavorites()
};

const pushFavorites = (city) => {
    if (!arrCities.includes(city)) arrCities.push(city);
}

const fisrtCapital = (word) => {
    let words = word.split(" ");
    let results = words.map(element => {
        return element.charAt(0).toUpperCase() + element.slice(1);
    });
    results =results.join(" ");
    return results
};

const changeIcon = (icon, isMyCity) => {
    let id = "icon";
    if (!isMyCity) id = id.concat("Search");
    const imgIcon = document.getElementById(id);
    imgIcon.src = `icons/${icon}.png`;
};

const changeTemp = (value, isMyCity) => {
    let id = "pTemp";
    if (!isMyCity) id = id.concat("Search");
    const pTemp = document.getElementById(id);
    let tempString = pTemp.textContent;
    pTemp.innerText = tempString.replace(/-/, (value-273.15).toFixed(2));
};

const changeTempDesc = (description, isMyCity) => {
    let id = "description";
    if (!isMyCity) id = id.concat("Search");
    const pDesc = document.getElementById(id);
    pDesc.innerText = fisrtCapital(description);
};

const changeLocation = (location, country, isMyCity) => {
    let id = "location";
    if (!isMyCity) id = id.concat("Search");
    const pLoc = document.getElementById(id)
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
        changeAll(city, false);
    }

    aElement.appendChild(liElement);
    ul.appendChild(aElement);
    ul.appendChild(imgIcon);
};

const createListResults = (search = true, id = "result") => {
    let cities = [];
    search ? cities = citiesfound.list : cities = arrCities;
    if (document.getElementById(id)) document.getElementById(id).remove();

    const listResults = document.createElement("ul");
    listResults.id = id;
    listResults.style.marginLeft = "0px";
    listResults.style.paddingLeft = "0px";
    listResults.style.textAlign = "center";
    cities.map(element => {
        createElementList(element, listResults, search);
    })
    
    search ? resultsSearch.appendChild(listResults) : favoritesDiv.appendChild(listResults);
};

const addFavorites = () => {
    createListResults(false, "favorites");
}






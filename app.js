// Go to this URL and register https://openweathermap.org/appid
// Get your API KEY (appid)

const apiKey = "77bcb017e0939c382dad9b04dcda2a5c";
let weather = {};
const searchImput = document.getElementById("citiesSearcher");
const searchBtn = document.getElementById("searchBtn");
const resultsSearch = document.getElementById("searchResults");
const favoritesDiv = document.getElementById("favoritesDiv");
const alertDivSearch = document.getElementById("notificationNoFound");
const divMyAdds = document.getElementById("myCities");
let citiesfound = "";
let arrCities = [];

const changeMap = (lat, lon) => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZ2VzcjkyIiwiYSI6ImNrZzhiNG8weTBma2syeW52dDNrbDh0bzgifQ.f17Czkz9pV4iYe33N9g0PQ';
    const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', 
    center: [lon, lat], 
    zoom: 9 
    });
    // const createMarker = new mapboxgl.Marker().setLgnLat([lon, lat]).addTo(map);
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
    fetch(`http://api.openweathermap.org/data/2.5/find?q=${city}&appid=${apiKey}`).then(response => onSuccessC(response, city)).catch(error => onError(error))
};

const onSuccessC = (response, city) => response.json().then(citiesSearch => {
    citiesfound = citiesSearch
    citiesfound.list.length === 0 ? alertNoFound(city) : createListResults();
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
    pTemp.innerText = `${(value-273.15).toFixed(2)} °C`;
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
    alertDivSearch.style.display = "none";
    deleteLists();
    checkSearch(searchImput.value);
});

const checkSearch = (value) => {
    value.length === 0 ? alertNoFound(value) : callCities(value);
}

const alertNoFound = (value) => {
    alertDivSearch.innerText = `Cities no found with "${value}"`;
    alertDivSearch.style.display = "block";
}

const createElementList = (city, ul, id) => {
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
        pushFavorites(city);
        addFavorites()
    }

    aElement.appendChild(liElement);
    ul.appendChild(aElement);
    liElement.appendChild(imgIcon);
    if (id === "favorites") {
        createBtnDelete(city, ul);
        createBtnAdd(city, ul);
    }
};

const createBtns = (id, text) => {
    const btn = document.createElement("button");
    btn.style.marginTop = "5px";
    btn.style.marginLeft = "5px";
    btn.id = id;
    btn.innerText = text;
    return btn;
};

const createBtnDelete = (city, ul) => {
    const deleteBtn = createBtns("deleteBtn", "Delete")
    deleteBtn.onclick = () => {
        deleteCity(city);
        addFavorites();
    };
    ul.appendChild(deleteBtn);
};

const createBtnAdd = (city, ul) => {
    const addBtn = createBtns("addBtn", "Add")
    addBtn.onclick = () => {
        checkAndClone(city);
    }
    ul.appendChild(addBtn);
};

const checkAndClone = (city) => {
    document.getElementById(`container-${city.name}-${city.id}`) ? alert(`La ciudad de ${city.name} ya tiene su tarjeta en el tablero`) : cloneCard(city);
}
const cloneCard = (city) => {
    const idCardClone = `container-${city.name}-${city.id}`;
    const container = document.getElementById("firstContainer");
    let clone = container.cloneNode(true);
    clone.id = idCardClone;
    clone = changeClone(clone, city)
    divMyAdds.appendChild(clone);
    return clone;
};

const changeClone = (clone, city) => {
    const [titleDiv, notificationDiv, weatherContainerDiv] = clone.children;
    titleDiv.children[0].innerText = `${city.name} Weather`;

    const [weatherIconDiv, temperatureValueDiv, temperatureDescriptDiv, locationDiv] = weatherContainerDiv.children;
    weatherIconDiv.children[0].id = `icon-${city.name}-${city.id}`;
    weatherIconDiv.children[0].src = `icons/${city.weather[0].icon}.png`;

    temperatureValueDiv.children[0].id =`pTemp-${city.name}-${city.id}`;
    temperatureValueDiv.children[0].innerText = `${(city.main.temp-273.15).toFixed(2)} °C`;

    temperatureDescriptDiv.children[0].id =`pTempSearch-${city.name}-${city.id}`;
    temperatureDescriptDiv.children[0].innerText = `${city.weather[0].description}`;

    locationDiv.children[0].id =`location-${city.name}-${city.id}`;
    locationDiv.children[0].innerText = `${city.name}, ${city.sys.country}`;

    return clone;
}

const createListResults = (search = true, id = "result") => {
    let cities = [];
    search ? cities = citiesfound.list : cities = arrCities;
    deleteLists(id);

    const listResults = document.createElement("ul");
    listResults.id = id;
    listResults.style.marginLeft = "0px";
    listResults.style.paddingLeft = "0px";
    listResults.style.textAlign = "center";
    cities.map(element => {
        createElementList(element, listResults, id);
    })
    
    search ? resultsSearch.appendChild(listResults) : favoritesDiv.appendChild(listResults);
};

const deleteLists = (id = "result") => {
    if (document.getElementById(id)) document.getElementById(id).remove();
}

const addFavorites = () => {
    createListResults(false, "favorites");
}

const deleteCity = (city) => {
    //indexCity = arrCities.indexOf(city);
    //arrCities.splice(indexCity, 1);
    deleteCardCity(city);
}
const deleteCardCity = (city) => {
    const idCard = `container-${city.name}-${city.id}`;
    document.getElementById(idCard).remove();

}

const createContainer = () => {
    
}





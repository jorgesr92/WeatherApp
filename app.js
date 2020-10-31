// Go to this URL and register https://openweathermap.org/appid
// Get your API KEY (appid)

const apiKey = "77bcb017e0939c382dad9b04dcda2a5c";
let weather = {};
const searchImput = document.getElementById("citiesSearcher");
const searchBtn = document.getElementById("searchBtn");
const resultsSearch = document.getElementById("searchResults");
const favoritesDiv = document.getElementById("favoritesDiv");
const alertDivSearch = document.getElementById("notificationNoFound");
let divMyAdds = document.getElementById("myCities");
const containerCards = document.getElementById("containerCards");
let citiesfound = "";
let arrCities = [];
let numDivsCont = 1;

const changeMap = (lat, lon) => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9yZ2VzcjkyIiwiYSI6ImNrZzhiNG8weTBma2syeW52dDNrbDh0bzgifQ.f17Czkz9pV4iYe33N9g0PQ';
    const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', 
    center: [lon, lat], 
    zoom: 9 
    });
};

const onSuccess = (position) => {
    let {coords: {latitude, longitude}} = position;
    callWeather(latitude, longitude);
    changeMap(latitude, longitude);
};

const errorAlert = (errMessage) =>{
    const divNotification = document.getElementById("notGeo");
    let pNotification = "";
    divNotification.children.length === 0 ? pNotification = document.createElement("p") : pNotification = divNotification.children;
    pNotification.innerText = errMessage;
    divNotification.style.display = "block";
    divNotification.appendChild(pNotification);
};

const onError = error => {
    console.error(error.message);
    errorAlert(error.message);
};

navigator.geolocation.getCurrentPosition(onSuccess, onError);

const callWeather = (lat, lon)=> {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(response => onSuccesResponse(response)).catch(error => onError(error))
};

const callCities = (city) => {
    fetch(`https://api.openweathermap.org/data/2.5/find?q=${city}&appid=${apiKey}`).then(response => onSuccessC(response, city)).catch(error => onError(error))
};

const onSuccessC = (response, city) => response.json().then(citiesSearch => {
    citiesfound = citiesSearch
    citiesfound.list.length === 0 ? alertNoFound(city) : createListResults();
})

const onSuccesResponse = response => response.json().then(infoWeather => {
    weather = infoWeather;
    changeAll();
}).catch(error => onError(error));

const changeAll = (city = weather, isMyCity = true, div = "") => {
    let divIcon = "";
    let divTemp = "";
    let divDesc = "";
    let divLoc = "";
    if (!isMyCity) {
        const [weatherIconDiv, temperatureValueDiv, temperatureDescriptDiv, locationDiv] = div.children;
        divIcon = weatherIconDiv.children[0];
        divTemp = temperatureValueDiv.children[0];
        divDesc = temperatureDescriptDiv.children[0];
        divLoc = locationDiv.children[0];
    }
    const {main: {temp}} = city;
    const {name} = city;
    const {id} = city;
    const {weather: [{icon, description}]} = city;
    const {sys: {country}} = city;
    changeIcon(name, id, icon, isMyCity, divIcon);
    changeTemp(name, id, temp, isMyCity, divTemp);
    changeTempDesc(name, id, description, isMyCity, divDesc);
    changeLocation(id, name, country, isMyCity, divLoc);
    pushFavorites(city);
    addFavorites();
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

const changeIcon = (name, idCity, icon, isMyCity, div) => {
    let id = "icon";
    let imgIcon = "";
    isMyCity ? imgIcon = document.getElementById(id) : imgIcon = div;
    if (!isMyCity) imgIcon.id = `icon-${name}-${idCity}`;
    imgIcon.src = `icons/${icon}.png`;
};

const changeTemp = (name, idCity, value, isMyCity, div) => {
    let id = "pTemp";
    let pTemp = "";
    isMyCity ? pTemp = document.getElementById(id) : pTemp = div;
    if (!isMyCity) pTemp.id = `pTemp-${name}-${idCity}`;
    pTemp.innerText = `${(value-273.15).toFixed(2)} °C`;
};

const changeTempDesc = (name, idCity, description, isMyCity, div) => {
    let id = "description";
    let pDesc = "";
    isMyCity ? pDesc = document.getElementById(id) : pDesc = div;
    if (!isMyCity) pDesc.id = `description-${name}-${idCity}`;
    pDesc.innerText = fisrtCapital(`${description}`);
};

const changeLocation = (idCity, location, country, isMyCity, div) => {
    let id = "location";
    let pLoc = "";
    isMyCity ? pLoc = document.getElementById(id) : pLoc = div;
    if (!isMyCity) pLoc.id = `location-${location}-${idCity}`;
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
        createBtnAdd(city, ul);
        createBtnDelete(city, ul);
    }
};

const createBtns = (id, text) => {
    const btn = document.createElement("a");
    const img = document.createElement("img");
    img.style.width = "25px";
    btn.style.marginTop = "5px";
    btn.style.marginLeft = "5px";
    btn.id = id;
    img.src = `icons/${text}.png`;
    img.addEventListener("mouseenter", ()=>{
        img.src = `icons/${text}1.png`;
    });
    img.addEventListener("mouseleave", ()=>{
        img.src = `icons/${text}.png`;
    });
    btn.appendChild(img);
    return btn;
};

const createBtnDelete = (city, ul) => {
    const deleteBtn = createBtns("deleteBtn", "delete");
    deleteBtn.onclick = () => {
        deleteCity(city);
        addFavorites();
    };
    ul.appendChild(deleteBtn);
};

const createBtnAdd = (city, ul) => {
    const addBtn = createBtns("addBtn", "add");
    addBtn.onclick = () => {
        checkNumberDivs();
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
    clone = changeClone(clone, city);
    divMyAdds.appendChild(clone);
    divMyAdds =  document.getElementById("myCities");
    return clone;
};

const changeClone = (clone, city) => {
    const [titleDiv, notificationDiv, weatherContainerDiv] = clone.children;
    titleDiv.children[0].innerText = `${city.name} Weather`;

    changeAll(city, false, weatherContainerDiv);

    return clone;
}

const checkNumberDivs = () => {
    let divAvi = false;
    let numCards = divMyAdds.children.length;
    if (numCards === 4) {
        for (let i = 1; i <= numDivsCont && !divAvi && document.getElementById(`myCities-${i}`); i++){
            numCards = document.getElementById(`myCities-${i}`).children.length;
            if (numCards < 4) {
                divAvi = true;
                num = i;
            };
        }
        if (divAvi){
            divMyAdds = document.getElementById(`myCities-${num}`);
        } else {
            let clone = divMyAdds.cloneNode(false);
            clone.id = `myCities-${numDivsCont}`;
            containerCards.appendChild(clone);
            divMyAdds = document.getElementById(`myCities-${numDivsCont}`);
            numDivsCont++;
        }
    };
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
    const idCard = `container-${city.name}-${city.id}`;
    if (document.getElementById(idCard)) {
        deleteCardCity(idCard);
        deleteHistoryCities(city);
    } else {
        alert(`La carta de ${city.name} no fue añadida, por lo que no se puede borrar.`);
    };
}

const deleteCardCity = (idCard) => {
    document.getElementById(idCard).remove();
}

const deleteHistoryCities = (city) => {
    indexCity = arrCities.indexOf(city);
    arrCities.splice(indexCity, 1);
}





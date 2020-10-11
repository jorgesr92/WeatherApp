// Go to this URL and register https://openweathermap.org/appid
// Get your API KEY (appid)

const apiKey = "77bcb017e0939c382dad9b04dcda2a5c";
let weather = {};

const onSuccess = (position) => {
    let {coords: {latitude, longitude}} = position;
    callWeather(latitude, longitude);
}

const errorAlert = (errMessage) =>{
    const pNotification = document.createElement("p");
    pNotification.innerText = errMessage;

    const divNotification = document.getElementsByClassName("notification")[0];
    divNotification.style.display = "block";

    divNotification.appendChild(pNotification);
}

const onError = error => {
    console.error(error.message);
    errorAlert(error.message);
}

navigator.geolocation.getCurrentPosition(onSuccess, onError);

const callWeather = (lat, lon)=> {
    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`).then(response => onSuccesResponse(response)).catch(error => onError(error))
}

const onSuccesResponse = response => response.json().then(infoWeather => {
    weather = infoWeather;
    changeAll();
  }).catch(error => onError(error));

const changeAll = () => {
    const {main: {temp}} = weather;
    const {name} = weather;
    const {weather: [{icon, description}]} = weather;
    const {sys: {country}} = weather;
    changeIcon(icon);
    changeTemp(temp);
    changeTempDesc(description);
    changeLocation(name, country);
}

const changeIcon = (icon) => {
    const imgIcon = document.getElementsByClassName("weather-icon")[0].children[0];
    imgIcon.src = `icons/${icon}.png`;
}

const changeTemp = (value) => {
    const pTemp = document.getElementsByClassName("temperature-value")[0].children[0];
    let tempString = pTemp.textContent;
    pTemp.innerText = tempString.replace(/-/, (value-273.15).toFixed(2));
}

const changeTempDesc = (description) => {
    const pDesc = document.getElementsByClassName("temperature-description")[0].children[0];
    pDesc.innerText = description;
}

const changeLocation = (location, country) => {
    const pLoc = document.getElementsByClassName("location")[0].children[0];
    pLoc.innerText = `${location}, ${country}`;
}


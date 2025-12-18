import axios from 'axios';

export default async function getWeather(state) {  
  let results = null;

  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${state},BR&APPID=e7c9f856d71abb3b929a4816c4ee2c79`);
    const data = response.data                 
            const temperatureMin = data.main.temp_min
            const temperatureMax = data.main.temp_max            
            const wind = data.wind.speed
            const humidity = data.main.humidity
            const currentTemperature = data.main.temp
            const feelsLike = data.main.feels_like
            const pressure = data.main.pressure                  
    results = [temperatureMin, temperatureMax, wind, humidity, currentTemperature, feelsLike, pressure];

  } catch (error) {
    console.log(error);
  }

  return results;
}

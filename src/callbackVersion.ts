import http from 'http'

const weatherKey = process.env.OPENWEATHER_API_KEY;
const newsKey = process.env.GNEWS_API_KEY;
const city = 'Polokwane';

function getWeatherCallback(callback: (error: Error | null, data?: string) => void): void{
     const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherKey}&units=metric`
    
     http.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        })

        res.on('end', () => {
            callback(null, data) //we get the data and not the error
        });
     }).on('error', (err) => {
        callback(err) //we get an error and not the data
     });
        
}

function getNewsCallback(callback: (error: Error | null, data?: string) => void): void {
    const url = `https://gnews.io/api/v4/top-headlines?token=${newsKey}&lang=en&max=5`;

    http.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        })

        res.on('end', () => {
            callback(null, data) //we get the data and not the error
        });
     }).on('error', (err) => {
        callback(err) //we get an error and not the data
     });
}

getWeatherCallback((weatherError, weatherData) => {
    if (weatherError) { //if we get a weather error
        console.log('Error fetching weather', weatherError.message)
        return;
    }
    const weather = JSON.parse(weatherData!);
    console.log(`Weather in ${weather.name}: ${weather.main.temp}°C`)

    getNewsCallback((newsError, newsData) => { //nesting news callback inside weather callback
        if(newsError){
            console.log('Error fetching news', newsError.message)
            return;
        }
        const news = JSON.parse(newsData!);
    })
})
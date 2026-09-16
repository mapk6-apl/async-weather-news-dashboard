import https from 'https'

const weatherKey = process.env.OPENWEATHER_API_KEY;
const newsKey = process.env.GNEWS_API_KEY;
const city = 'Polokwane';

function getWeatherPromise(): Promise<string>{
    return new Promise((resolve, reject) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherKey}&units=metric`
    
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        })
    })
}

function getNewsPromise(): Promise<string>{
    return new Promise((resolve, reject) => {
        const url = `https://gnews.io/api/v4/top-headlines?token=${newsKey}&lang=en&max=5`

        https.get(url, (res) => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk;
            })

            res.on('end', () => {
                resolve(data);
            }).on('error', (err) => {
                reject(err);
            })
        })

        getWeatherPromise()
        .then((weatherData) => {
            const weather = JSON.parse(weatherData);
            console.log(`Weather in ${weather.name}: ${weather.main.temp}°C`)
            return getNewsPromise();
        })
        .then((newsData) => {
            const news = JSON.parse(newsData);
            news.articles.forEach((article: any) => {
                console.log(`-${article.title}`)
            });
        })
        .catch((error) => {
            console.error('Something went wrong:', error.message);
        })
    })
}
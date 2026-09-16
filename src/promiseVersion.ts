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
                resolve(data); //resolve promise with full body response
            });
        }).on('error', (err) => {
            reject(err); //promise rejected
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
        .then((weatherData) => { //this is the resolved value from getWeatherPromise()
            const weather = JSON.parse(weatherData);
            console.log(`Weather in ${weather.name}: ${weather.main.temp}°C`)
            return getNewsPromise(); //the next .then() waits for this promise
        })
        .then((newsData) => { //runs only after getNewsPromise() resolves (cause of the return statement above)
            const news = JSON.parse(newsData);
            news.articles.forEach((article: any) => {
                console.log(`-${article.title}`)
            });
        })
        .catch((error) => { //catches a rejection from either promise
            console.error('Something went wrong:', error.message);
        })
    })
}

//this will start both requests at the same time and only runs .then() once both have resolved
Promise.all([getWeatherPromise(), getNewsPromise()])
.then(([weatherData, newsData]) => {
    const weather = JSON.parse(weatherData);
    const news = JSON.parse(newsData);
    console.log(`Weather in ${weather.name}: ${weather.main.temp}°C`)
    news.articles.forEach((article: any) => 
        console.log(`-${article.title}`));
})
.catch((error) => {
    console.error('Something went wrong:', error.message);
});

//this starts both at the same time, but cares for the one that resolves or rejects first ; the other one is ignored
Promise.race([getWeatherPromise(), getNewsPromise()])
.then((fastestData) => {
    console.log('Fastest response arrived:', fastestData.slice(0, 100));
})
.catch((error) => {
    console.error('Something went wrong:', error.message);
})
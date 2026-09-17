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
        });
    })
}

async function runSequential() {
    try {
        const weatherData = await getWeatherPromise(); //function pauses (await) until getWeatherPromise() resolves
        const weather = JSON.parse(weatherData); //results are unwrapped into weatherData
        console.log(`Weather in ${weather.name}: ${weather.main.temp}°C`)

        //this will execute once the above finishes
        const newsData = await getNewsPromise();
        const news = JSON.parse(newsData);
        news.article.forEach((article: any) => {
            console.log(`- ${article.title}`);
        });
    } catch (error: any) { //we catch a rejection from either await above
        console.error('Something went wrong:', error.message);
    }
}

runSequential(); //calling the function


//Promise.all starts both requests at the same time; await pauses until both have resolved; results come as an array
async function runAll() {
    try {
        const [weatherData, newsData] = await Promise.all([getWeatherPromise(), getNewsPromise()]);

        const weather = JSON.parse(weatherData);
        const news = JSON.parse(newsData);
        console.log((`Weather in ${weather.name}: ${weather.main.temp}°C`));
        news.article.forEach((article: any) => {
            console.log(`- ${article.title}`);
        });
    } catch (error: any) {
        console.error('Something went wrong:', error.message);
    }
}

runAll();

//both still start at the same time, but function only waits for whichever settles first
async function runRace() {
    try {
        const fastestData = await Promise.race([getWeatherPromise(), getNewsPromise()]);
        console.log('Fastest response arrived:', fastestData.slice(0, 100));
    } catch (error: any) {
        console.error('Something went wrong:', error.message);
    }
}

runRace();
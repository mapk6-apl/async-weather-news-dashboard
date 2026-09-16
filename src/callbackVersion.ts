import http from 'http'

const weatherKey = "e9be1674cd1ebd4f592392692d6b511b"
const newsKey = "4c880453c1759d5a3769f5cedd180a82"
const city = 'Polokwane'

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


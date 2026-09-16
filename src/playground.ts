function fetchData(): Promise<string> {
    return new Promise((resolve) => { // a promise has to be resolved
        setTimeout(() => {
            resolve('Data fetch successful')
        }, 2000); // 2 seconds delay
    })
}

async function getData() {
    console.log('Fetching data ...')
    const data = await fetchData() // waiting for promise to resolve
    console.log(data)
    console.log('Data processing complete')
}

getData() // we call the asynchronous function

console.log('Program continues while data is being fetched')

//Process
//1. While we wait (await) for data to be fetched, everything under await stops/waits
//because it's an asynchronous function.
//2. While we wait for that, we continue (last .log runs)
//3. We log our data (we have our resolve message) then the log below that runs
//4. Data process complete
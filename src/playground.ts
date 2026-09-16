//Initial Code

// function fetchData(): Promise<string> {
//     return new Promise((resolve) => { // a promise has to be resolved
//         setTimeout(() => {
//             resolve('Data fetch successful')
//         }, 2000); // 2 seconds delay
//     })
// }

// async function getData() {
//     console.log('Fetching data ...')
//     const data = await fetchData() // waiting for promise to resolve
//     console.log(data)
//     console.log('Data processing complete')
// }

// getData() // we call the asynchronous function

// console.log('Program continues while data is being fetched')

//Process
//1. While we wait (await) for data to be fetched, everything under await stops/waits
//because it's an asynchronous function.
//2. While we wait for that, we continue (last .log runs)
//3. We log our data (we have our resolve message) then the log below that runs
//4. Data process complete


//==================================//

//Code 2

async function fetchUserData(userId:number): Promise<{id: number; name: string; email: string}> {
    await delay(4000)
    return {
        id: userId,
        name: `User ${userId}`,
        email: `User ${userId}@mlab.co.za`
    }
}

//a Promise is a core feature for handling asynchronous operations
function delay(ms:number): Promise<void> { //a helper function which will help us with a delay since we're not fetching real data yet
    return new Promise(resolve => setTimeout(resolve, ms)) //ms = milliseconds
}

async function main(): Promise<void> {
    try {
        console.log('Starting to fetch user data ...')
        const user = await fetchUserData(123) //this will pause the .log below too
        console.log('User data received:', user)

        const[user1, user2, user3] = await Promise.all([
            fetchUserData(1),
            fetchUserData(2),
            fetchUserData(3)
        ])

        console.log('Multiple users:', user1, user2, user3)
    } catch (error) {
        console.log('Error fetching user data:', error)
    }
}

main()
# Async Weather & News Dashboard

A small Node.js + TypeScript project built to learn asynchronous JavaScript by
implementing the same task three different ways: **callbacks**, **promises**,
and **async/await**.

Each version fetches:
- Current weather for a city, from [OpenWeatherMap](https://openweathermap.org/api)
- Top news headlines, from [GNews](https://gnews.io/)

## APIs used

Both APIs require a free API key.

| Data      | API          | Sign up                                  |
|-----------|--------------|-------------------------------------------|
| Weather   | OpenWeatherMap | https://openweathermap.org (free tier) |
| Headlines | GNews          | https://gnews.io (free tier, 100 requests/day) |

> Newly generated OpenWeatherMap keys can take a few minutes (sometimes up to
> ~2 hours) to activate. If you get `"Invalid API key"` right after signing
> up, wait a bit and try again before assuming your code is wrong.

## Project structure

```
async-weather-news-dashboard/
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env                     # API keys — not committed to git
├── .gitignore
└── src/
    ├── playground.ts          # scratch file for testing small async/await/event-loop ideas
    ├── callbackVersion.ts      # callback style
    ├── promiseVersion.ts       # promise style
    └── asyncAwaitVersion.ts    # async/await style
```

`playground.ts` isn't part of the dashboard itself — it's a mock/testing file
used to try out concepts (like `await`, `setTimeout`, resolve/reject) in
isolation before applying them in the real versions.

## Setup

1. Install dependencies:
   ```bash
   npm install
   npm install dotenv
   ```

2. Create a `.env` file in the project root with your keys:
   ```
   OPENWEATHER_API_KEY=your_openweathermap_key
   GNEWS_API_KEY=your_gnews_key
   ```

3. `.gitignore` already excludes `node_modules/` and `.env`, so neither gets
   committed.

## Running each version

Each version accepts a city name as a command-line argument, so it works for
any location, not just one hardcoded city:

```bash
npx tsx src/callbackVersion.ts "Cape Town"
npx tsx src/promiseVersion.ts "Cape Town"
npx tsx src/asyncAwaitVersion.ts "Cape Town"
```

If no city is given, it falls back to a default:
```bash
npx tsx src/promiseVersion.ts
```

## What each version does

### `callbackVersion.ts`
Uses Node's built-in `https` module with plain error-first callbacks
(`(error, data) => {...}`). The news request is nested inside the weather
request's callback — this is deliberate, to feel what "callback hell" is
like: every level needs its own `if (error) { ...; return; }` check, and the
code grows more indented the more steps you chain.

### `promiseVersion.ts`
Wraps the same `https` calls in a `Promise`, then consumes them with
`.then()` / `.catch()` instead of nesting. Covers three patterns:

- **Chained promises** — weather, then news, then display, with a single
  `.catch()` at the end instead of an error check at every level
- **`Promise.all()`** — fires the weather and news requests *at the same
  time* and waits for both before doing anything
- **`Promise.race()`** — fires both at the same time and only cares about
  whichever one settles first

### `asyncAwaitVersion.ts`
Same three patterns as the promise version, refactored to use `async`
functions with `await` and `try...catch` for error handling. The
`getWeatherPromise` / `getNewsPromise` functions themselves don't change at
all — only the code that *calls* them changes syntax.

## Error handling

All three versions handle two kinds of failure:
- **Network-level errors** (no internet, DNS failure) — caught via the
  `.on('error', ...)` handler on the `https.get(...)` request itself
- **API-level errors** (invalid/missing key, bad request) — the request
  still "succeeds" as an HTTP response, but the response body is an error
  object instead of real data (e.g. GNews returns
  `{"errors":["You did not provide an API key."]}` with a normal
  connection but an error payload inside it)

Errors are printed to the console in a consistent, readable format across
all three versions rather than crashing the program.

## Learning log

Notes kept while building this project, roughly in the order I ran into them.

### Environment & setup issues

- Running `npx tsc --init` didn't create a `tsconfig.json` at first — the
  TypeScript package wasn't actually installed in the project yet, so `npx`
  had nowhere to find the compiler. Fixed by running `npm install
  typescript` first.
- Got an error creating a `.ts` file in `src/`: no type definitions found for
  `node`. `ls node_modules/@types` returned nothing, meaning `npm install`
  either hadn't finished or `@types/node` was never installed. Fixed with
  `npm install --save-dev @types/node`.
- `npx tsc playground.ts` (pointing directly at one file) wouldn't run
  properly. Passing a specific filename to `tsc` on the command line makes
  it ignore `tsconfig.json` entirely, so all the project's modern-syntax
  settings are thrown away and the compiler either crashes or errors.
  Solved by using `npx tsx src/playground.ts` instead — `tsx` respects the
  project's `tsconfig.json` and lets me actually see output in the terminal.
- Created `.gitignore` (to exclude `node_modules/`) *after* already running
  `git commit` without `git add` being scoped properly — almost committed
  the entire `node_modules/` folder. Lesson: set up `.gitignore` before the
  first commit, not after.
- When running `asyncAwaitVersion.ts`, kept getting `undefined` API keys.
  Having a `.env` file isn't enough on its own — nothing reads it into
  `process.env` automatically. Needed the `dotenv` package
  (`import 'dotenv/config';`) to actually load it.

### Core concepts

- **Synchronous (blocking)** — only one task runs at a time; you can't move
  to the next task until the current one finishes. Execution happens in
  strict order.
- **Asynchronous (non-blocking)** — one task can run in the background while
  execution continues elsewhere. One task's execution isn't blocked by
  another task's completion.
- **Mental model for the event loop:** Node ≈ a single developer (one brain,
  does one thing at a time, efficiently); the callback/task queue ≈ a to-do
  list of things waiting their turn; the event loop ≈ the workflow process
  that keeps checking what's done and what's next.
- **Promises** help avoid poor, scattered error handling, and act as a
  placeholder for a value that isn't known yet because the operation is
  still running. A Promise has three states:
  - **Pending** — initial state, operation hasn't finished yet
  - **Fulfilled** — operation completed successfully, promise now has a
    result value
  - **Rejected** — operation failed, promise holds an error object
  - `resolve()` moves a Promise from pending → fulfilled.
    `reject()` moves it from pending → rejected (and needs an error object
    passed to it).
- **`await`** pauses execution of the `async` function it's inside, until
  the awaited Promise settles.
- **Callbacks** run after an asynchronous task completes. Convention: the
  error comes first in the parameter list (`(error, data) => {...}`) —
  "error-first callbacks."

### First playground.ts experiment

```typescript
function fetchData(): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Data fetch successful');
        }, 2000); // 2 second delay
    });
}

async function getData() {
    console.log('Fetching data ...');
    const data = await fetchData(); // waits here for the promise to resolve
    console.log(data);
    console.log('Data processing complete');
}

getData(); // call the async function — it does NOT block what's below

console.log('Program continues while data is being fetched');
```

Execution order and why:
1. `getData()` is called, immediately logs `'Fetching data ...'`, then hits
   `await fetchData()` — everything *after* that line inside `getData`
   pauses, but the rest of the program does not.
2. Because `getData()` didn't block, `'Program continues while data is
   being fetched'` logs next, straight away.
3. ~2 seconds later, the Promise resolves, `data` logs (`'Data fetch
   successful'`), then `'Data processing complete'` logs right after it.

This was the moment the event loop concept actually clicked — `await` only
pauses the function it's written in, not the whole program.

## What I learned

- **Callbacks** are the foundation, but nesting dependent async calls
  quickly turns into "callback hell" — every level needs its own error
  check, and the pyramid of indentation makes the code harder to follow the
  more steps you add.
- **Promises** flatten that nesting into a `.then()` chain with one
  `.catch()`, and add `Promise.all()` / `Promise.race()` — ways to run
  multiple async operations *concurrently* that have no clean callback
  equivalent.
- **Async/await** is syntax sugar over promises — same concurrency, same
  `Promise.all` / `Promise.race`, but written to read top-to-bottom like
  synchronous code, with familiar `try...catch` instead of `.catch()`.
- The **event loop** is what makes all of this work without blocking:
  Node's single thread hands off slow work (like HTTP requests) to the
  runtime, keeps running other code, and only comes back to run a
  callback/promise continuation once the underlying request finishes.
- Real bugs hit while building this: forgetting `import 'dotenv/config'`
  (API keys silently coming through as `undefined`), misspelling a response
  field (`article` vs `articles`), an `.on('error', ...)` handler attached
  to the wrong object, and accidentally nesting one function's usage code
  inside another function's body instead of calling it separately.

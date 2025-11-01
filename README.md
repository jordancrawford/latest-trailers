# Latest Trailers

**Take a look at [trailers.jc.kiwi](https://trailers.jc.kiwi/)**

## What is this?
I wanted to build something that is as close to the experience of watching movie trailers before a movie starts. Just like in the cinemas, you don't even know what the movie is called until the title is revealed at the end!

Your browser keeps track of which trailers you've seen, so if you come back another time, rest assured you'll see something new!

[Read more about how it works on my blog](https://jc.kiwi/latest-trailers/)

## API

See [`api`](api) for the API code (Cloudflare Worker) which fetches trailers from TMDB.

The API fetches trailers for upcoming and now showing movies from TheMovieDatabase and saves the result to a KV store.

## Frontend
See [`frontend`](frontend) for the frontend UI code.

The frontend automatically plays the latest / now showing movie trailers.

**Full features:**
- Keeps track of which movies the user has seen trailers for.
- Plays trailers automatically.
- Automatically plays the next trailer once one is finished.
- Allows users to reset their seen trailers after watching them all so they can start over.
- Has an about page with information about the source of the content and other (possible) FAQ's.

## Environment variables
These variables must be configured in Cloudflare (or a `.env` file if running using Wrangler locally).

### `TMDB_TOKEN` (secret)

The API token from TMDB.

### `FETCH_SUCCESS_NOTIFICATION_URL` (optional)

A success URL to hit if fetch happens successfully.

## Development
1. Set your environment variables in a `.env` file.
2. Run `npx wrangler dev`

If you'd like to test scheduled jobs, run `npx wrangler dev ----test-scheduled` and run `curl "http://localhost:[port number]/__scheduled"` to simulate the scheduled job.

## Deploy
Use `npx wrangler deploy` to deploy to Cloudflare or connect it to Cloudflare's Git integration for automatic deployment ([learn more](https://developers.cloudflare.com/workers/ci-cd/builds/)).


In the "Variables and Secrets" section in Cloudflare, specify the environment variables you require.

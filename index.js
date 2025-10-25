import { showingKey, upcomingKey, fetchShowingTrailers, fetchUpcomingTrailers } from './fetcher.js';

const fetchAndCacheTrailers = async (key, env, refresh) => {
  let cachedData = refresh ? null : await env.trailerCache.get(key);

  if (!cachedData) {
    const tmdbToken = env.TMDB_TOKEN;
    const trailers = key == showingKey ? await fetchShowingTrailers(tmdbToken) : await fetchUpcomingTrailers(tmdbToken);
    await env.trailerCache.put(key, JSON.stringify(trailers));
    console.info(`Saved ${key}} trailers`);

    return trailers;
  } else {
    return JSON.parse(cachedData);
  }
};

export default {
  async scheduled(_, env, ctx) {
    console.info("Scheduled fetch triggered");

    ctx.waitUntil((async () => {
      await fetchAndCacheTrailers(showingKey, env, true)
      await fetchAndCacheTrailers(upcomingKey, env, true)

      if (env.FETCH_SUCCESS_NOTIFICATION_URL) {
        await fetch(env.FETCH_SUCCESS_NOTIFICATION_URL);
        console.info("Hit success URL");
      } else {
        console.info("No success URL configured");
      }
    })());
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const key = path === "/showing.json" ? showingKey : upcomingKey;
    const trailers = await fetchAndCacheTrailers(key, env, false);
    return Response.json(trailers);
  }
};

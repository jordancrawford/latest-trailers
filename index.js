import { showingKey, upcomingKey, fetchShowingTrailers, fetchUpcomingTrailers } from './fetcher.js';

export default {
  async scheduled(controller, env, ctx) {
    console.info("Scheduled fetch triggered");

    ctx.waitUntil((async () => {
      const tmdbToken = env.TMDB_TOKEN;

      const showingTrailers = await fetchShowingTrailers(tmdbToken);
      await env.trailerCache.put(showingKey, JSON.stringify(showingTrailers));
      console.info("Saved showing trailers");

      const upcomingTrailers = await fetchUpcomingTrailers(tmdbToken);
      await env.trailerCache.put(upcomingKey, JSON.stringify(upcomingTrailers));
      console.info("Saved upcoming trailers");

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

    if (path === "/showing.json")   {
      const trailers = JSON.parse(await env.trailerCache.get(showingKey));
      return Response.json(trailers);
    } else {
      const trailers = JSON.parse(await env.trailerCache.get(upcomingKey));
      return Response.json(trailers);
    }
  },
}

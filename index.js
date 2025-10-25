import { fetchUpcomingTrailers } from './fetcher.js';

const upcomingKey = "upcoming";

export default {
  async scheduled(controller, env, ctx) {
    console.log("Scheduled fetch triggered");

    ctx.waitUntil((async () => {
      const tmdbToken = env.TMDB_TOKEN;

      // TODO: Fetch a pile of trailers
      // We could fetch this on a reduced schedule, few times a week.
      const trailers = await fetchUpcomingTrailers(tmdbToken);

      await env.trailerCache.put(upcomingKey, trailers)
      // TODO: Store trailers in a SQL database instead?
      // This way we can always figure out the right set.

      console.log("Fetched trailers:", trailers);

      // TODO: Fetch now showing
    })());
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/now-showing.json")   {
      return Response.json({
        response: "Now Showing JSON data"
      });
    } else {
      const trailers = await env.trailerCache.get(upcomingKey);
      console.log(trailers);
      return Response.json(trailers);
    }
  },
}

import fetchTrailers from './fetcher.js';

export default {
  async scheduled(controller, env, ctx) {
    console.log("Scheduled event triggered");
    ctx.waitUntil((async () => {
      const trailers = await fetchTrailers();
      console.log("Fetched trailers:", trailers);

      // TODO: Save trailers to KV
    })());
  },
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/now-showing.json")   {
      return Response.json({
        response: "Now Showing JSON data"
      });
    } else {
      return Response.json({
        response: "Upcoming JSON data"
      });
    }
  },
}

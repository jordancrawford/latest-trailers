export const showingKey = "showing";
export const upcomingKey = "upcoming";

const today = new Date();

const tomorrow = new Date()
tomorrow.setDate(today.getDate() + 1);

const threeMonthsAgo = new Date();
threeMonthsAgo.setDate(today.getDate() - 90);

const dateToIsoDateOnly = (date) => date.toISOString().split('T')[0];

const delay = ms => new Promise(res => setTimeout(res, ms));

const fetchTmdb = async (token, url) => {
  const httpOptions = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  };

  console.info(`Fetch TMDB - ${url}`)
  const response = await fetch(url, httpOptions);

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Error fetching from TMDB - Status: ${response.status} ${response.statusText}`)
  }
};

const fetchMoviesAndTrailers = async (key, params, token) => {
  console.info(`Fetching ${key} trailers...`)

  const { results: movies } = await fetchTmdb(token, `https://api.themoviedb.org/3/discover/movie?${params}`);
  console.log(movies);

  const allTrailers = await Promise.all(movies.map(async (movie) => {
    console.info(`Getting videos for "${movie.title}"`);
    const { results: videos } = await fetchTmdb(token, `https://api.themoviedb.org/3/movie/${movie.id}/videos`);

    const trailers = videos.filter((video) => video.type === "Trailer" && video.site === "YouTube");

    return {
      movieId: movie.id,
      movieTitle: movie.title,
      trailerKeys: trailers.map((trailer) => trailer.key)
    };
  }));

  console.log(`Successfully fetched ${allTrailers.length} ${key} trailers`);

  return {
    type: key,
    fetchedAt: today.toISOString(),
    trailers: allTrailers
  };
};

export const fetchUpcomingTrailers = async (token) =>
  await fetchMoviesAndTrailers(upcomingKey, new URLSearchParams({
    'sort_by': 'popularity.desc',
    'include_adult': false,
    'primary_release_date.gte': dateToIsoDateOnly(tomorrow),
    'with_release_type': '2|3',
    'with_original_language': 'en'
  }), token);

export const fetchShowingTrailers = async (token) =>
  await fetchMoviesAndTrailers(showingKey, new URLSearchParams({
    'sort_by': 'popularity.desc',
    'include_adult': false,
    'primary_release_date.gte': dateToIsoDateOnly(threeMonthsAgo),
    'primary_release_date.lte': dateToIsoDateOnly(today),
    'with_release_type': '2|3',
    'with_original_language': 'en'
  }), token);

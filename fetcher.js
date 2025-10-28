const today = new Date();

const tomorrow = new Date()
tomorrow.setDate(today.getDate() + 1);

const threeMonthsAgo = new Date();
threeMonthsAgo.setDate(today.getDate() - 90);

const dateToIsoDateOnly = (date) => date.toISOString().split('T')[0];

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

export const fetchMoviesAndTrailers = async (key, token, releasedAfter, releasedBefore) => {
  console.info(`Fetching ${key} trailers...`)

  const params = new URLSearchParams({
    'sort_by': 'popularity.desc',
    'include_adult': false,
    'primary_release_date.gte': releasedAfter && dateToIsoDateOnly(releasedAfter),
    'primary_release_date.lte': releasedBefore && dateToIsoDateOnly(releasedBefore),
    'with_release_type': '2|3',
    'with_original_language': 'en'
  })

  const { results: movies } = await fetchTmdb(token, `https://api.themoviedb.org/3/discover/movie?${params}`);

  const moviesWithTrailers = await Promise.all(movies.map(async (movie) => {
    console.info(`Getting videos for "${movie.title}"`);
    const { results: videos } = await fetchTmdb(token, `https://api.themoviedb.org/3/movie/${movie.id}/videos`);

    const trailers = videos.filter((video) => video.type === "Trailer" && video.site === "YouTube");

    return {
      movieId: movie.id,
      movieTitle: movie.title,
      releaseDate: movie.release_date,
      trailerKeys: trailers.map((trailer) => trailer.key)
    };
  }));

  const onlyMoviesWithTrailers = moviesWithTrailers.filter((movie) => movie.trailerKeys.length > 0);

  console.info(`Successfully fetched ${moviesWithTrailers.length} ${key} movies, ${onlyMoviesWithTrailers.length} movies have trailers`);

  return {
    type: key,
    fetchedAt: new Date().toISOString(),
    trailers: onlyMoviesWithTrailers
  };
};

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

const fetchMoviesAndTrailers = async (params, token) => {
  const movieResult = await fetchTmdb(token, `https://api.themoviedb.org/3/discover/movie?${params}`);
  console.log(movieResult);
  const movieIds = movieResult.results.map((movie) => movie.id);

  const trailers = await Promise.all(movieIds.map(movieId => fetchTmdb(token, `https://api.themoviedb.org/3/movie/${movieId}/videos`)));

  console.log(trailers);

  return trailers;
  // TODO: Clean up the trailer info?
};

export const fetchUpcomingTrailers = async (token) => {
  console.info("Fetching Upcoming trailers...")

  const params = new URLSearchParams({
    'sort_by': 'popularity.desc',
    'include_adult': false,
    'primary_release_date.gte': dateToIsoDateOnly(tomorrow),
    'with_release_type': '2|3',
    'with_original_language': 'en'
  });

  const result = await fetchMoviesAndTrailers(params, token);
  console.log(`Successfully fetched ${result.length} trailers`);
  return result;
};

export const fetchNowShowingTrailers = async (token) => {
  console.info("Fetching Now Showing trailers...")

  const params = new URLSearchParams({
    'sort_by': 'popularity.desc',
    'include_adult': false,
    'primary_release_date.gte': dateToIsoDateOnly(threeMonthsAgo),
    'primary_release_date.lte': dateToIsoDateOnly(today),
    'with_release_type': '2|3',
    'with_original_language': 'en'
  });

  const result = await fetchMoviesAndTrailers(params, token);
  console.log(`Successfully fetched ${result.length} trailers`);
  return result;
};

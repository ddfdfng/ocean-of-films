const API_KEY = 'b53e87d6d9e6dd2ea9fd63e73fe99e4c';
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchPopularMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=uk-UA`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

export const fetchTopRatedMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=uk-UA`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};

export const fetchPopularUkrTVShows = async () => {
  try {
    const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=uk-UA&with_original_language=uk&with_origin_country=UA&sort_by=popularity.desc`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular Ukrainian TV shows:', error);
    return [];
  }
};


export async function fetchMovieDetails(id: string, p0: string) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=uk-UA`);
  return res.json();
}

export async function fetchTvDetails(id: string) {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=uk-UA`);
  return res.json();
}

export async function fetchMovieCredits(id: string, p0: string) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=uk-UA`);
  return res.json();
}

export async function fetchTvCredits(id: string) {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/credits?api_key=${API_KEY}&language=uk-UA`);
  return res.json();
}


let genresMap: Record<number, string> = {};

async function loadGenres() {
  const movieRes = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=uk-UA`);
  const tvRes = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}&language=uk-UA`);
  const movieGenres = (await movieRes.json()).genres;
  const tvGenres = (await tvRes.json()).genres;

  for (const genre of [...movieGenres, ...tvGenres]) {
    genresMap[genre.id] = genre.name;
  }
}

export async function searchMoviesOrTV(query: string) {
  try {
    if (Object.keys(genresMap).length === 0) await loadGenres();

    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&api_key=${API_KEY}&language=uk-UA`
    );
    const data = await response.json();
    const filtered = (data.results || []).filter(
      (item: any) =>
        (item.media_type === 'movie' || item.media_type === 'tv') &&
        item.poster_path
    );

    // додаємо жанри
    return filtered.map((item: any) => ({
      ...item,
      genre_names: item.genre_ids?.map((id: number) => genresMap[id]).filter(Boolean),
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function fetchYoutubeTrailer(id: string, type: 'movie' | 'tv') {
  const res = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`);
  const data = await res.json();
  const trailer = data.results.find(
    (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
  );
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}

export async function fetchImages(id: string, type: 'movie' | 'tv') {
  const res = await fetch(`${BASE_URL}/${type}/${id}/images?api_key=${API_KEY}`);
  const data = await res.json();
  return data; 
}

export async function fetchLatestUkrTVShows() {
  const res = await fetch(
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=uk&sort_by=first_air_date.desc`
  );
  const data = await res.json();
  return data.results;
}

// Останні польські серіали
export async function fetchLatestPlTVShows() {
  const res = await fetch(
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pl-PL&sort_by=first_air_date.desc&with_original_language=pl&page=1`
  );
  const data = await res.json();
  return data.results;
}
// Мапи для фільтрів
const MOVIE_GENRES: Record<string, number> = {
  Драма: 18,
  Комедія: 35,
  Бойовик: 28,
  Фантастика: 878,
};

const TV_GENRES: Record<string, number> = {
  Драма: 18,
  Комедія: 35,
  Бойовик: 10759,
  Фантастика: 10765,
};

const COUNTRIES: Record<string, string> = {
  США: 'US',
  'Велика Британія': 'GB',
  Україна: 'UA',
};

export async function fetchFilteredMovies(params: any) {
  let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=uk&sort_by=popularity.desc`;

  if (params.genre && MOVIE_GENRES[params.genre]) {
    url += `&with_genres=${MOVIE_GENRES[params.genre]}`;
  }
  if (params.year) url += `&primary_release_year=${params.year}`;
  if (params.country && COUNTRIES[params.country]) {
    url += `&region=${COUNTRIES[params.country]}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

export async function fetchFilteredTV(params: any) {
  let url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=uk&sort_by=popularity.desc`;

  if (params.genre && TV_GENRES[params.genre]) {
    url += `&with_genres=${TV_GENRES[params.genre]}`;
  }
  if (params.year) url += `&first_air_date_year=${params.year}`;
  if (params.country && COUNTRIES[params.country]) {
    url += `&region=${COUNTRIES[params.country]}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}



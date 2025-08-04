const API_KEY = 'b53e87d6d9e6dd2ea9fd63e73fe99e4c';
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetcchPopularMovies = async () => {
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


export async function fetchMovieDetails(id: string) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=YOUR_API_KEY&language=uk-UA`);
  return res.json();
}

export async function fetchTvDetails(id: string) {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=YOUR_API_KEY&language=uk-UA`);
  return res.json();
}

export async function fetchMovieCredits(id: string) {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=YOUR_API_KEY&language=uk-UA`);
  return res.json();
}

export async function fetchTvCredits(id: string) {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/credits?api_key=YOUR_API_KEY&language=uk-UA`);
  return res.json();
}



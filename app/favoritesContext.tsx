import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";

interface FavoriteItem {
  id: number;
  type: "movie" | "tv";
  [key: string]: any;
}

interface FavoritesContextType {
  favoritesMovies: FavoriteItem[];
  favoritesTV: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (item: FavoriteItem) => void;
}

export const FavoritesContext = createContext<FavoritesContextType>({
  favoritesMovies: [],
  favoritesTV: [],
  addFavorite: () => {},
  removeFavorite: () => {},
});

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favoritesMovies, setFavoritesMovies] = useState<FavoriteItem[]>([]);
  const [favoritesTV, setFavoritesTV] = useState<FavoriteItem[]>([]);

  // 🔹 Завантажуємо favorites з AsyncStorage при старті
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedMovies = await AsyncStorage.getItem("favoritesMovies");
        const storedTV = await AsyncStorage.getItem("favoritesTV");
        if (storedMovies) setFavoritesMovies(JSON.parse(storedMovies));
        if (storedTV) setFavoritesTV(JSON.parse(storedTV));
      } catch (e) {
        console.error("Помилка завантаження обраного", e);
      }
    };
    loadFavorites();
  }, []);

  // 🔹 Зберігаємо в AsyncStorage при зміні
  useEffect(() => {
    AsyncStorage.setItem("favoritesMovies", JSON.stringify(favoritesMovies));
  }, [favoritesMovies]);

  useEffect(() => {
    AsyncStorage.setItem("favoritesTV", JSON.stringify(favoritesTV));
  }, [favoritesTV]);

  const addFavorite = (item: FavoriteItem) => {
    if (item.type === "movie") {
      if (!favoritesMovies.find(f => f.id === item.id)) {
        setFavoritesMovies(prev => [...prev, item]);
      }
    } else {
      if (!favoritesTV.find(f => f.id === item.id)) {
        setFavoritesTV(prev => [...prev, item]);
      }
    }
  };

  const removeFavorite = (item: FavoriteItem) => {
    if (item.type === "movie") {
      setFavoritesMovies(prev => prev.filter(f => f.id !== item.id));
    } else {
      setFavoritesTV(prev => prev.filter(f => f.id !== item.id));
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoritesMovies,
        favoritesTV,
        addFavorite,
        removeFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

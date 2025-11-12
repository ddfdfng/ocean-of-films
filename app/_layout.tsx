import { Stack } from "expo-router";
import { FavoritesProvider } from "./favoritesContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <Stack screenOptions={{ headerShown: false }} />
      {children}
    </FavoritesProvider>
  );
}

import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { buildPosterUrl, fetchSavedMovies, removeFavoriteMovie, updateWatchedStatus } from "@/services/api";
import { images } from "@/constants/images";

const Saved = () => {
  const [activeTab, setActiveTab] = useState<"favorites" | "watched">("favorites");
  const [movies, setMovies] = useState<SavedMovieDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavedMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = await fetchSavedMovies(activeTab);
      setMovies(payload);
    } catch (unknownError) {
      setError(
        unknownError instanceof Error ? unknownError.message : "Unable to load saved movies"
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadSavedMovies();
  }, [loadSavedMovies]);

  useFocusEffect(
    useCallback(() => {
      loadSavedMovies();
    }, [loadSavedMovies])
  );

  const handleRemove = async (movieId: number) => {
    try {
      await removeFavoriteMovie(movieId);
      await loadSavedMovies();
    } catch (unknownError) {
      setError(
        unknownError instanceof Error ? unknownError.message : "Unable to remove favorite"
      );
    }
  };

  const handleToggleWatched = async (movie: SavedMovieDTO) => {
    try {
      await updateWatchedStatus(movie.tmdbMovieId, !movie.isWatched);
      await loadSavedMovies();
    } catch (unknownError) {
      setError(
        unknownError instanceof Error ? unknownError.message : "Unable to update watched"
      );
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <SafeAreaView className="flex-1 px-5">
        <Text className="mt-4 text-2xl font-bold text-white">Saved</Text>
        <Text className="mt-1 text-light-200">Manage your favorites and watched movies</Text>

        <View className="mt-6 flex-row gap-3">
        <TouchableOpacity
          className={`flex-1 rounded-full py-3 ${
            activeTab === "favorites" ? "bg-accent" : "bg-dark-200"
          }`}
          onPress={() => setActiveTab("favorites")}
        >
          <Text className="text-center font-semibold text-white">Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 rounded-full py-3 ${
            activeTab === "watched" ? "bg-accent" : "bg-dark-200"
          }`}
          onPress={() => setActiveTab("watched")}
        >
          <Text className="text-center font-semibold text-white">Watched</Text>
        </TouchableOpacity>
      </View>

        {loading ? (
          <ActivityIndicator className="mt-8" size="large" color="#AB8BFF" />
        ) : error ? (
          <Text className="mt-8 text-red-400">{error}</Text>
        ) : (
          <FlatList
            className="mt-6"
            data={movies}
            keyExtractor={(item) => item.tmdbMovieId.toString()}
            contentContainerStyle={{ paddingBottom: 120, gap: 14 }}
            ListEmptyComponent={
              <Text className="mt-8 text-center text-light-200">
                {activeTab === "favorites"
                  ? "No favorite movie yet"
                  : "No watched movie yet"}
              </Text>
            }
            renderItem={({ item }) => (
              <View className="flex-row rounded-2xl border border-dark-100 bg-dark-200 p-3">
                <Image
                  source={{ uri: buildPosterUrl(item.posterPath) }}
                  className="h-28 w-20 rounded-lg"
                  resizeMode="cover"
                />

                <View className="ml-3 flex-1 justify-between">
                  <View>
                    <Text numberOfLines={2} className="text-base font-semibold text-white">
                      {item.title}
                    </Text>
                    <Text className="mt-1 text-light-200">{item.releaseDate}</Text>
                    <Text className="mt-1 text-light-200">⭐ {item.voteAverage.toFixed(1)}</Text>
                  </View>

                  <View className="mt-2 flex-row gap-2">
                    <TouchableOpacity
                      className="rounded-lg bg-accent px-3 py-2"
                      onPress={() => handleToggleWatched(item)}
                    >
                      <Text className="text-xs font-semibold text-white">
                        {item.isWatched ? "Mark Unwatched" : "Mark Watched"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="rounded-lg border border-red-400 px-3 py-2"
                      onPress={() => handleRemove(item.tmdbMovieId)}
                    >
                      <Text className="text-xs font-semibold text-red-400">Unfavorite</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default Saved;

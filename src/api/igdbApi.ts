import axios from "axios";
import logo from "../assets/GH-logo.png";
import axiosClient from "./axiosClient";

const platformIds: { [key: string]: number } = {
  pc: 6, // Platform ID for PC
  playstation: 48, // Platform ID for PlayStation
  xbox: 49, // Platform ID for Xbox
  "nintendo switch": 130,
  n64: 4,
  nes: 18,
  snes: 19,
  gamecube: 21,
  // Add more platforms as needed
};

const genreNameToId: { [key: string]: number } = {
  Adventure: 31,
  RPG: 12,
  Indie: 32,
  Strategy: 15,
  Platform: 8,
  Arcade: 33,
};

const gameModeNameToId: { [key: string]: number } = {
  Singleplayer: 1,
  Multiplayer: 2,
  Coop: 3,
};

const defaultMinRating = 85;
const defaultMinRatingCount = 20;
const defaultCoverUrl = {logo};

export const getGameScreenshotUrl = (imageId: string) => {
  return `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${imageId}.png`;
};

export const getGameCoverUrl = (imageId: string) => {
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.png`;
};

export const getArtworkUrl = (imageID: string) => {
  return `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${imageID}.jpg`;
};

const fetchGameCoversAndScreenshots = async (
  games: any[],
  // platform: string
) => {
  const promises = games.map(async (game: any) => {
    let cover,
      artworks = [],
      screenshots = [];

    if (game.cover && game.cover.image_id) {
      // If the game has a cover with a valid image_id, use it
      cover = await getGameCoverUrl(game.cover.image_id);
    } else if (game.screenshots && game.screenshots.length > 0) {
      // If the game doesn't have a cover but has screenshots, use the first screenshot as the cover
      cover = await getGameCoverUrl(game.screenshots[0].image_id);
    } else if (game.similar_games && game.similar_games.length > 0) {
      // If the game doesn't have a cover or screenshots, and it's a similar game,
      // set cover to a default cover URL for similar games
      cover = defaultCoverUrl;
    } else {
      // If the game doesn't have a cover or screenshots, set cover to a default cover URL
      cover = defaultCoverUrl;
    }

    if (game.screenshots && game.screenshots.length > 0) {
      screenshots = game.screenshots.map((ss: any) =>
        getGameScreenshotUrl(ss.image_id)
      );
    }

    if (game.artworks && game.artworks.length > 0) {
      artworks = game.artworks.map((artwork: any) =>
        getArtworkUrl(artwork.image_id)
      );
    }

    return { ...game, cover, screenshots, artworks };
  });

  return Promise.all(promises);
};

const fetchSimilarGamesCoversAndScreenshots = async (
  similarGames: any[],

) => {
  const promises = similarGames.map(async (similarGame: any) => {
    let cover,
      artworks = [],
      screenshots = [];

    if (similarGame.cover && similarGame.cover.image_id) {
      // If the similar game has a cover with a valid image_id, use it
      cover = await getGameCoverUrl(similarGame.cover.image_id);
    } else if (similarGame.screenshots && similarGame.screenshots.length > 0) {
      // If the similar game doesn't have a cover but has screenshots, use the first screenshot as the cover
      cover = await getGameCoverUrl(similarGame.screenshots[0].image_id);
    } else {
      // If the similar game doesn't have a cover or screenshots, set cover to a default cover URL
      cover = defaultCoverUrl;
    }

    if (similarGame.screenshots && similarGame.screenshots.length > 0) {
      screenshots = similarGame.screenshots.map((ss: any) =>
        getGameScreenshotUrl(ss.image_id)
      );
    }

    if (similarGame.artworks && similarGame.artworks.length > 0) {
      artworks = similarGame.artworks.map((artwork: any) =>
        getArtworkUrl(artwork.image_id)
      );
    }

    return { ...similarGame, cover, screenshots, artworks };
  });

  return Promise.all(promises);
};

export const searchForGames = async (
  query: string,
  platforms: string[],
  currentPage = 1,
  limit = 20
) => {
  // Generate a unique cache key based on query, platforms, current page, and limit
  const cacheKey = `searchForGames-${query}-${platforms.join(
    "-"
  )}-${currentPage}-${limit}`;
  const cachedData = sessionStorage.getItem(cacheKey);

  // Use cached data if available
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const endpoint = "games/";
  const url = `${endpoint}`;

  const platformIdsArray = platforms
    .map((platform) => {
      const id = platformIds[platform.toLowerCase()];
      if (id === undefined) {
        throw new Error(`Unsupported platform: ${platform}`);
      }
      return id;
    })
    .join(",");

  const offset = (currentPage - 1) * limit;

  const requestBody = `fields name, summary, themes, franchises.name, release_dates.date, cover.image_id, involved_companies.company.name, game_modes.name, artworks.*, screenshots.*, genres.name, websites.*, videos.*, total_rating, total_rating_count, platforms.name, similar_games.*, similar_games.cover.image_id; 
  search "${query}"; where platforms = (${platformIdsArray}); limit ${limit}; offset ${offset};`;

  try {
    const response = await axiosClient.post(url, requestBody);
    const searchResults = response.data;
    
    const filteredGames = searchResults.filter((game: any) => 
      !game.themes || !game.themes.includes(42)
    );

    const processedResults = filteredGames.map((game: any) => ({
      ...game,
      cover: game.cover
        ? getGameCoverUrl(game.cover.image_id)
        : "default_image_url",
    }));

    // Attempt to cache the processed results in sessionStorage
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(processedResults));
    } catch (e) {
      if (
        e instanceof DOMException &&
        e.code === DOMException.QUOTA_EXCEEDED_ERR
      ) {
        console.warn("Session storage is full, unable to cache the results");
      } else {
        console.error("Error during caching:", e);
      }
    }

    return processedResults;
  } catch (error) {
    console.error("Error making request:", error);
    throw error;
  }
};

export const getPopularRightNowGames = async (
  platform: string,
  limit = 20
) => {
  const cacheKey = `popularByVisits-${platform}-${limit}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  if (cachedData) return JSON.parse(cachedData);

  const platformId = platformIds[platform.toLowerCase()];
  if (!platformId) throw new Error(`Invalid platform: ${platform}`);

  const popularityEndpoint = "popularity_primitives";
  const gamesEndpoint = "games/";

  try {
    const popularityRequestBody = `
      fields game_id, value, popularity_type;
      sort value desc;
      where popularity_type = 3;
      limit 100;
    `.replace(/\s{2,}/g, " ").trim();

    const popularityResponse = await axiosClient.post(popularityEndpoint, popularityRequestBody);
    const gameIdsRaw: number[] = popularityResponse.data.map((entry: any) => entry.game_id);

    if (gameIdsRaw.length === 0) return [];

    const dataRequestBody = `
      fields name, summary, total_rating, total_rating_count, 
      cover.image_id, release_dates.date, platforms, artworks.*, screenshots.image_id, 
      websites, age_ratings.category, age_ratings.rating;
      where id = (${gameIdsRaw.join(",")}) & platforms = (${platformId});
      limit ${limit};
    `.replace(/\s{2,}/g, " ").trim();

    const dataResponse = await axiosClient.post(gamesEndpoint, dataRequestBody);
    const popularGames = dataResponse.data;

    const gamesWithCovers = await fetchGameCoversAndScreenshots(popularGames);

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(gamesWithCovers));
    } catch (e) {
      if (
        e instanceof DOMException &&
        e.code === DOMException.QUOTA_EXCEEDED_ERR
      ) {
        console.warn("Session storage full, unable to cache results");
      } else {
        console.error("Error during caching:", e);
      }
    }

    return gamesWithCovers;
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error("Error fetching popular games by IGDB Visits:", error.response?.data || error.message);
  } else {
    console.error("Unexpected error fetching popular games by IGDB Visits:", error);
  }
  throw error;
}
};

export const fetchFilteredGames = async (
  platforms: Array<{ name: string }> = [],
  genres: Array<{ name: string }> = [],
  gameModes: Array<{ name: string }> = [],
  currentPage: number = 1,
  displayLimit: number = 24  
) => {
  const cacheKey = `fetchFilteredGames-${platforms
    .map((p) => p.name)
    .join(",")}-${genres.map((g) => g.name).join(",")}-${gameModes
    .map((gm) => gm.name)
    .join(",")}-${currentPage}-${displayLimit}`;

  const cachedData = sessionStorage.getItem(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const platformIdsArray = platforms
    .map((platform) => platformIds[platform.name.toLowerCase()])
    .filter((id) => id !== undefined);
  const genreIdsArray = genres.map((genre) => genreNameToId[genre.name]);
  const gameModeIdsArray = gameModes.map(
    (gameMode) => gameModeNameToId[gameMode.name]
  );

  let allFetchedGames: any = [];
  let offset = (currentPage - 1) * displayLimit;
  let extraFetchLimit = displayLimit * 2; 

  while (allFetchedGames.length < displayLimit) {
    let query = `fields name, cover.image_id, total_rating, summary, platforms.name, genres.name, game_modes.name, themes; limit ${extraFetchLimit}; offset ${offset};`;

    if (platformIdsArray.length > 0) {
      query += ` where platforms = (${platformIdsArray.join(",")})`;
    }
    if (genreIdsArray.length > 0) {
      query += ` & genres = [${genreIdsArray.join(",")}]`;
    }
    if (gameModeIdsArray.length > 0) {
      query += ` & game_modes = [${gameModeIdsArray.join(",")}]`;
    }
    query += ";";

    try {
      const response = await axiosClient.post("games/", query);
      let data = response.data;

      // Filter out games with theme ID 42
      let filteredData = data.filter(
        (game: any) => !game.themes || !game.themes.includes(42)
      );

      allFetchedGames = allFetchedGames.concat(filteredData);
      allFetchedGames = allFetchedGames.slice(0, displayLimit); // Limit to the desired number of games

      offset += extraFetchLimit; // Increase offset for additional fetches
      if (data.length < extraFetchLimit) break; // Break if no more games to fetch
    } catch (error) {
      console.error("Error fetching filtered games:", error);
      throw error;
    }
  }

  // Process and cache only the required number of games
  const processedGames = allFetchedGames.map((game: any) => {
    return {
      ...game,
      cover: game.cover
        ? getGameCoverUrl(game.cover.image_id)
        : "../assets/GH-logo.png",
      total_rating:
        game.total_rating !== undefined ? game.total_rating : null,
    };
  });

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(processedGames));
  } catch (e) {
    if (
      e instanceof DOMException &&
      e.code === DOMException.QUOTA_EXCEEDED_ERR
    ) {
      console.warn("Session storage is full, unable to cache the results");
    } else {
      console.error("Error during caching:", e);
    }
  }
  return processedGames;
};

export const getGameDetails = async (query: number, platform: string) => {
  // Generate a unique cache key
  const cacheKey = `getGameDetails-${query}-${platform}`;
  const cachedData = sessionStorage.getItem(cacheKey);

  // Use cached data if available
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const endpoint = "games/";
  const url = `${endpoint}`;

  const platformId = platformIds[platform.toLowerCase()];
  if (platformId === undefined) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const requestBody = `fields name, summary, themes.name, franchises.name, release_dates.date, cover.image_id, involved_companies.company.name, game_modes.name, artworks.*, screenshots.*, genres.name, websites.*, videos.*, total_rating, total_rating_count, platforms.name, similar_games.*, similar_games.cover.image_id, similar_games.screenshots.*, age_ratings; where id = ${query};`;

  try {
    const response = await axiosClient.post(url, requestBody);
    const gameDetails = response.data;

    const gameWithCover = await fetchGameCoversAndScreenshots(
      gameDetails,

    );

    let similarGamesWithCovers = [];

    if (
      gameWithCover[0].similar_games &&
      gameWithCover[0].similar_games.length > 0
    ) {
      similarGamesWithCovers = await fetchSimilarGamesCoversAndScreenshots(
        gameWithCover[0].similar_games,
     
      );
    }

    let ageRatingDetailsResults = [];

    if (Array.isArray(gameDetails[0].age_ratings)) {
      const ageRatingDetailsPromises = gameDetails[0].age_ratings.map(
        async (ageRatingId: number) => {
          try {
            const ageRatingDetails = await getAgeRatingDetails(ageRatingId);
            if (ageRatingDetails.category === 2) {
              return translateRatingToPEGI(ageRatingDetails.rating);
            } else {
              return null;
            }
          } catch (error) {
            console.error("Error getting age rating details:", error);
            return null;
          }
        }
      );

      ageRatingDetailsResults = await Promise.all(ageRatingDetailsPromises);
    } else {
      console.warn("age_ratings field is not an array or is undefined");
    }

    const firstValidAgeRating = ageRatingDetailsResults.find(
      (rating) => rating !== null
    );

    const result = [
      {
        ...gameWithCover[0],
        similar_games: similarGamesWithCovers,
        age_ratings: firstValidAgeRating || "Unknown PEGI rating",
      },
    ];
    // Attempt to cache the result in sessionStorage
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (e) {
      if (
        e instanceof DOMException &&
        e.code === DOMException.QUOTA_EXCEEDED_ERR
      ) {
        console.warn("Session storage is full, unable to cache the results");
        // Log the warning but continue with the function
      } else {
        console.error("Error during caching:", e);
        // Log other errors that may occur during caching
      }
    }

    return result;
  } catch (error) {
    console.error("Error making request:", error);
    throw error;
  }
};

const extractNumericAgeFromPEGI = (pegiRating: string): number | null => {
  const match = pegiRating.match(/\d+/); // Extract numeric part (e.g., "PEGI 3" => 3)
  return match ? parseInt(match[0], 10) : null;
};

// const extractNumericAgeFromRating = (rating: number): number | null => {
  // Placeholder for other age rating extraction logic
  // return rating; // Assumes numeric rating for non-PEGI categories
// };

const getAgeRatingDetails = async (ageRatingId: number) => {
  const ageRatingEndpoint = "age_ratings/";
  const requestBody = `fields category, rating; where id = ${ageRatingId};`;

  try {
    const response = await axiosClient.post(ageRatingEndpoint, requestBody);
    return response.data[0]; // Return the first element, assuming there's only one result
  } catch (error) {
    console.error("Error getting age rating details:", error);
    throw error;
  }
};

const translateRatingToPEGI = (rating: number): string => {
  switch (rating) {
    case 1:
      return "PEGI 3";
    case 2:
      return "PEGI 7";
    case 3:
      return "PEGI 12";
    case 4:
      return "PEGI 16";
    case 5:
      return "PEGI 18";
    default:
      return "Unknown PEGI category";
  }
};


export const fetchGameThumbnailsData = async (gameIds: number[]) => {
  if (gameIds.length === 0) {
    throw new Error("No game IDs provided.");
  }

  const cacheKey = `fetchGameThumbnailsData-${gameIds.join(",")}`;
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    console.log("Using cached data for fetchGameThumbnailsData");
    return JSON.parse(cachedData);
  }

  const requestBody = `
    fields id, name, cover.image_id, age_ratings.category, age_ratings.rating, age_ratings.id;
    where id = (${gameIds.join(",")});
  `;

  try {
    const response = await axiosClient.post("games/", requestBody);
    const gamesData = response.data;

    if (!gamesData || gamesData.length === 0) {
      throw new Error("No game data found.");
    }

    const processedData = await Promise.all(
      gamesData.map(async (game: any) => {
        let pegiRating = null;
        let ageNumber = null;

        if (!Array.isArray(game.age_ratings) || game.age_ratings.length === 0) {
          console.warn(`No age ratings found for Game ID: ${game.id}`, game);
          ageNumber = "N/A";
        } else {
          const pegiDetails = game.age_ratings.find(
            (rating: any) => rating.category === 2 && rating.rating !== undefined
          );

          if (pegiDetails) {
            pegiRating = translateRatingToPEGI(pegiDetails.rating);
          } else {
            const ageRatingDetails = await Promise.all(
              game.age_ratings.map(async (rating: any) => {
                if (rating.id) {
                  return await getAgeRatingDetails(rating.id);
                }
                return null;
              })
            );

            const validPegi = ageRatingDetails.find(
              (detail: any) => detail?.category === 2
            );
            if (validPegi) {
              pegiRating = translateRatingToPEGI(validPegi.rating);
            }
          }
        }

        ageNumber = pegiRating
          ? extractNumericAgeFromPEGI(pegiRating)
          : "N/A";

        return {
          id: game.id,
          name: game.name,
          cover: game.cover?.image_id
            ? getGameCoverUrl(game.cover.image_id)
            : defaultCoverUrl,
          age_number: ageNumber,
        };
      })
    );

    sessionStorage.setItem(cacheKey, JSON.stringify(processedData));
    return processedData;
  } catch (error) {
    console.error("Error fetching thumbnails data:", error);
    throw error;
  }
};
export const getTopRatedGames = async (
  platform: string,
  minRating = defaultMinRating,
  minRatingCount = defaultMinRatingCount,
  limit = 15
) => {
  const cacheKey = `topRatedGames-${platform}-${minRating}-${minRatingCount}-${limit}`;
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const endpoint = "games/";
  const requestBody = `
    fields name, summary, total_rating, total_rating_count, cover.image_id, artworks.*, screenshots.image_id, websites, age_ratings.category, age_ratings.rating;
  
    where total_rating > ${minRating} & total_rating_count > ${minRatingCount} & platforms = (${platformIds[platform.toLowerCase()] || platformIds.pc});
    sort total_rating desc;
    limit ${limit};
  `;

  try {
    const response = await axiosClient.post(endpoint, requestBody);
    const topRatedGames = response.data;

    const gamesWithCovers = await fetchGameCoversAndScreenshots(topRatedGames);

    // Attempt to cache the results in sessionStorage
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(gamesWithCovers));
    } catch (e) {
      if (e instanceof DOMException && e.code === DOMException.QUOTA_EXCEEDED_ERR) {
        console.warn("Session storage is full, unable to cache the results");
      } else {
        console.error("Error during caching:", e);
      }
    }

    return gamesWithCovers;
  } catch (error) {
    console.error("Error making request:", error);
    throw error;
  }
};

export const getGameCover = async (imageId: string) => {
  const endpoint = `covers/${imageId}`;
  const url = `${endpoint}?fields=image_id`;

  try {
    const response = await axiosClient.get(url);
    return getGameCoverUrl(response.data.image_id);
  } catch (error) {
    console.error("Error making request:", error);
    throw error;
  }
};

export const getNewGames = async (platform: any, limit: number = 15) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentTimestamp = Math.floor(today.getTime() / 1000);

  const cacheKey = `getNewGames-${platform}-${limit}-${currentTimestamp}`;
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const endpoint = "release_dates/";
  const query = `fields game; where date < ${currentTimestamp}; sort date desc; limit ${limit};`;

  try {
    const response = await axiosClient.post(endpoint, query);
    const newGames = response.data;

    if (!newGames || newGames.length === 0) {
      console.warn("No new games found in the response.");
      return [];
    }

    // Extract game IDs from release dates
    const gameIds = newGames.map((newGame: any) => newGame.game);

    // Fetch detailed game information from the "games/" endpoint
    const gamesResponse = await axiosClient.get(
      `games/${gameIds.join(
        ","
      )}?fields=name,summary,cover.image_id,themes,screenshots.image_id,artworks.*,websites`
    );

    const filteredGames = gamesResponse.data.filter((game: any) => 
      !game.themes || !game.themes.includes(42)
    );

    const gamesWithCoversAndScreenshots = await fetchGameCoversAndScreenshots(
      filteredGames,
  
    );

    // Attempt to cache the results in sessionStorage
    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify(gamesWithCoversAndScreenshots)
      );
    } catch (e) {
      if (
        e instanceof DOMException &&
        e.code === DOMException.QUOTA_EXCEEDED_ERR
      ) {
        console.warn("Session storage is full, unable to cache the results");
      } else {
        console.error("Error during caching:", e);
      }
    }

    return gamesWithCoversAndScreenshots;
  } catch (error) {
    console.error("Error making request or fetching covers:", error);
    throw error;
  }
};

export const getUpcomingGames = async (platform: any, limit: number = 15) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentTimestamp = Math.floor(today.getTime() / 1000);

  const cacheKey = `getUpcomingGames-${platform}-${limit}-${currentTimestamp}`;
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const endpoint = "release_dates/";
  const query = `fields game; where date > ${currentTimestamp}; sort date asc; limit ${limit};`;

  try {
    const response = await axiosClient.post(endpoint, query);
    const upcomingGames = response.data;

    if (!upcomingGames || upcomingGames.length === 0) {
      console.warn("No upcoming games found in the response.");
      return [];
    }

    const gameIds = upcomingGames.map((upcomingGame: any) => upcomingGame.game);

    const gamesResponse = await axiosClient.get(
      `games/${gameIds.join(
        ","
      )}?fields=name,summary,cover.image_id,screenshots.image_id,artworks.*,websites, age_ratings.category, age_ratings.rating; `
    );

    const filteredGames = gamesResponse.data.filter((game: any) => 
    !game.themes || !game.themes.includes(42)
  );

    const gamesWithCoversAndScreenshots = await fetchGameCoversAndScreenshots(
     filteredGames,

    );

    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify(gamesWithCoversAndScreenshots)
      );
    } catch (e) {
      if (
        e instanceof DOMException &&
        e.code === DOMException.QUOTA_EXCEEDED_ERR
      ) {
        console.warn("Session storage is full, unable to cache the results");
      } else {
        console.error("Error during caching:", e);
      }
    }

    return gamesWithCoversAndScreenshots;
  } catch (error) {
    console.error("Error making request or fetching covers:", error);
    throw error;
  }
};

export default {
  getGameDetails,
  getTopRatedGames,
  getNewGames,
  getUpcomingGames,
  getPopularRightNowGames,
};

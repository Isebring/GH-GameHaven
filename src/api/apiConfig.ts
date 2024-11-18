const apiConfig = {
  baseUrl: `https://proxy.cors.sh/https://api.igdb.com/v4`,
  clientID: import.meta.env.VITE_IGDB_CLIENT_ID,
  authorization: import.meta.env.VITE_IGDB_AUTHORIZATION,
  corsSH: import.meta.env.VITE_API_KEY,
};

export default apiConfig;

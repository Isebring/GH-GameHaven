const apiConfig = {
  baseUrl: `https://thingproxy.freeboard.io/fetch/https://api.igdb.com/v4`,
  clientID: import.meta.env.VITE_IGDB_CLIENT_ID,
  authorization: import.meta.env.VITE_IGDB_AUTHORIZATION,
};

export default apiConfig;

import axios from "axios";
import axiosRateLimit from "axios-rate-limit";
import axiosRetry from "axios-retry";
import apiConfig from "./apiConfig";

const axiosClient = axiosRateLimit(
  axios.create({
    baseURL: apiConfig.baseUrl,
    headers: {
      'x-cors-api-key': apiConfig.corsSH,
      "Client-ID": apiConfig.clientID,
      Authorization: `Bearer ${apiConfig.authorization}`,
      "Content-Type": "text/plain",
    },
  }),
  {
    maxRequests: 10,
    perMilliseconds: 1000, 
  }
);


axiosRetry(axiosClient, {
  retries: 3, 
  retryDelay: (retryCount) => Math.pow(2, retryCount) * 1000, 
  retryCondition: (error) => error.response?.status === 429, 
});

export default axiosClient;
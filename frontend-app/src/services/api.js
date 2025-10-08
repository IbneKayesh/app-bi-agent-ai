// src/services/api.js
import axios from "axios";

const API_BASE = "http://127.0.0.1:5050";

export const askQuery = async (query) => {
  const response = await axios.post(`${API_BASE}/api/ask`, { query });
  return response.data; // { SQL_Query, Response_Summary, Suggestion, results, query_id }
};

export const sendFeedback = async (queryId, sentiment) => {
  return axios.post(`${API_BASE}/api/feedback`, { queryId, sentiment });
};

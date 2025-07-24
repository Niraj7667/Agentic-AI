// src/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://agentic-ai-20om.onrender.com",
  withCredentials: true, // Important for sending cookies
});

export default instance;

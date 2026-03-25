// src/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://agentic-ai-20om.onrender.com",
  //baseURL: "http://localhost:3001",
  withCredentials: true, // Important for sending cookies
});

export default instance;

import axios from "axios";

const API_URL = "http://localhost:8000"; // Change this to .env in prod

export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await axios.post(`${API_URL}/auth/token`, formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
};

export const register = async (username: string, email: string, password: string) => {
  const res = await axios.post(`${API_URL}/auth/register`, {
    username,
    email,
    password,
  });
  return res.data;
};

export const getMe = async (token: string) => {
  const res = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

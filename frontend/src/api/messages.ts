import axios from "axios";

const API_URL = "http://localhost:8000"; // Change this to .env in prod

export const getChats = async (token: string) => {
  const res = await axios.get(`${API_URL}/messages/chats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMessages = async (userId: number, token: string) => {
  const res = await axios.get(`${API_URL}/messages/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const sendMessage = async (
  content: string,
  recipientId: number,
  files: File[],
  token: string
) => {
  const formData = new FormData();
  formData.append("content", content);
  formData.append("recipient_id", recipientId.toString());
  files.forEach((file) => formData.append("files", file));

  const res = await axios.post(`${API_URL}/messages/`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const editMessage = async (id: number, content: string, token: string) => {
  const res = await axios.put(
    `${API_URL}/messages/${id}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const deleteMessage = async (id: number, token: string) => {
  const res = await axios.delete(`${API_URL}/messages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

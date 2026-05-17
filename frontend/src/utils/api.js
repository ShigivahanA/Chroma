import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const PALETTES_URL = `${API_BASE_URL}/palettes`;

export const generateRandomPalette = async () => {
  const response = await axios.get(`${PALETTES_URL}/generate/random`);
  return response.data;
};

export const savePalette = async (paletteData) => {
  const response = await axios.post(PALETTES_URL, paletteData);
  return response.data;
};

export const getPopularPalettes = async (page = 1, sort = 'popular', limit = 20) => {
  const response = await axios.get(`${PALETTES_URL}?sort=${sort}&page=${page}&limit=${limit}`);
  return response.data;
};

export const likePalette = async (id) => {
  const response = await axios.put(`${PALETTES_URL}/${id}/like`);
  return response.data;
};

export const bulkImportPalettes = async (palettes) => {
  const response = await axios.post(`${PALETTES_URL}/bulk-import`, { palettes });
  return response.data;
};

export const submitContact = async (contactData) => {
  const response = await axios.post(`${API_BASE_URL}/contact`, contactData);
  return response.data;
};

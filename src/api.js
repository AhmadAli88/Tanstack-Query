import axios from 'axios';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

// Fetch all users
export const fetchUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Add a new user
export const addUser = async (newUser) => {
  const response = await axios.post(API_URL, newUser);
  return response.data;
};

// Update a user
export const updateUser = async (updatedUser) => {
  const response = await axios.put(`${API_URL}/${updatedUser.id}`, updatedUser);
  return response.data;
};

// Delete a user
export const deleteUser = async (userId) => {
  const response = await axios.delete(`${API_URL}/${userId}`);
  return response.data;
};

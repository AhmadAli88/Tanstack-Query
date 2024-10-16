import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, addUser, updateUser, deleteUser } from '../api';

const UsersComponent = () => {
  const queryClient = useQueryClient();

  // Local state for the new or updated user
  const [newUser, setNewUser] = useState({ name: '', email: '' });

  // Fetch all users with react-query (object syntax for v5+)
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: Infinity,  // Avoid refetching automatically
    cacheTime: Infinity,  // Keep cache forever unless explicitly refetched
  });

  // Add user mutation (with manual cache update)
  const addUserMutation = useMutation({
    mutationFn: addUser,
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previousUsers = queryClient.getQueryData(['users']);
      queryClient.setQueryData(['users'], (oldUsers) => [
        ...oldUsers,
        { id: Math.random(), ...newUser }, // Optimistically add the new user
      ]);
      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      queryClient.setQueryData(['users'], context.previousUsers); // Rollback if error occurs
    },
    onSettled: () => {
      // Optionally: disable refetching or refetch manually if needed
    },
  });

  // Update user mutation (with manual cache update)
  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onMutate: async (updatedUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previousUsers = queryClient.getQueryData(['users']);
      queryClient.setQueryData(['users'], (oldUsers) =>
        oldUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      return { previousUsers };
    },
    onError: (err, updatedUser, context) => {
      queryClient.setQueryData(['users'], context.previousUsers); // Rollback if error occurs
    },
    onSettled: () => {
      // Optionally: disable refetching or refetch manually if needed
     
        // queryClient.invalidateQueries({ queryKey: ['users'] }); // Refetch after mutation
     
    },
  });

  // Delete user mutation (with manual cache update)
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previousUsers = queryClient.getQueryData(['users']);
      queryClient.setQueryData(['users'], (oldUsers) =>
        oldUsers.filter((user) => user.id !== userId) // Optimistically remove the user
      );
      return { previousUsers };
    },
    onError: (err, userId, context) => {
      queryClient.setQueryData(['users'], context.previousUsers); // Rollback if error occurs
    },
    onSettled: () => {
      // Optionally: disable refetching or refetch manually if needed
    },
  });

  const handleAddUser = () => {
    addUserMutation.mutate(newUser);
    setNewUser({ name: '', email: '' });
  };

  const handleUpdateUser = (id) => {
    const updatedName = prompt('Enter new name:');
    if (updatedName) {
      updateUserMutation.mutate({ id, name: updatedName });
    }
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(id);
    }
  };

  if (isLoading) return <p>Loading users...</p>;
  if (isError) return <p>Failed to fetch users.</p>;

  return (
    <div>
      <h2>Users List</h2>
      <input
        type="text"
        placeholder="Name"
        value={newUser.name}
        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={newUser.email}
        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
      />
      <button onClick={handleAddUser}>Add User</button>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleUpdateUser(user.id)}>Edit</button>
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersComponent;

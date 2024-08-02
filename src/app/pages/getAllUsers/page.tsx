'use client'; // Necessary for hooks in the App Router

import React, { useEffect, useState } from 'react';
import { getAllUsers, changeUserRoleByEmail } from '@/app/AuthService/auth-service';
import Header from '@/app/Components/header/page';

export interface User {
  id: number;
  name: string;
  email: string;
  sub: string;
  isAdmin: boolean;
}

interface UserCardProps {
  user: User;
  onClick: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  return (
    <div
      key={user.id}
      className="w-full border-2 shadow-md rounded-xl p-4 cursor-pointer border-yellow-400"
      onClick={onClick}
    >
      <div className="flex justify-between border-b-2 pb-2 mb-2">
        <div className="flex items-center">
          <h1 className="font-bold">{user.name}</h1>
        </div>
      </div>
      <div className="flex flex-col items-start">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.isAdmin ? 'Admin' : 'User'}</p>
      </div>
    </div>
  );
};

const UserDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err: any) {
        setError('Failed to fetch users');
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setRole(user.isAdmin ? 'Admin' : 'User');
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  const handleSave = async () => {
    if (selectedUser) {
      try {
        const newRoleId = role === 'Admin' ? 'rol_6JTZeXdfl5WbJD9w' : 'rol_EdTUp1zmRG1xSWHA'; // Replace with actual role IDs
        await changeUserRoleByEmail(selectedUser.email, newRoleId);
        setSelectedUser(null);
        const updatedUsers = users.map((user) =>
          user.id === selectedUser.id ? { ...user, isAdmin: role === 'Admin' } : user
        );
        setUsers(updatedUsers);
      } catch (error) {
        console.error('Error updating user role:', error);
      }
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Header />
      <div className=" mx-auto px-20">
        <h1 className="text-3xl font-bold text-center mt-5 mb-6">User Role Assignment</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 rounded-xl shadow-lg p-5">
          {users.map(user => (
            <UserCard key={user.id} user={user} onClick={() => handleUserClick(user)} />
          ))}
        </div>
      </div>

      {selectedUser && (
        <div id="authentication-modal" className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900">
                  User Details
                </h3>
                <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" onClick={() => setSelectedUser(null)}>
                  <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-4 md:p-5">
                <form className="space-y-4" action="#">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900"><strong>Name:</strong> {selectedUser.name}</label>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900"><strong>Email:</strong> {selectedUser.email}</label>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900"><strong>Role:</strong></label>
                    <select value={role} onChange={handleRoleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <button type="button" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onClick={handleSave}>
                    Save
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

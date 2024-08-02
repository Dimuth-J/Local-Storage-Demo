'use client'; // Necessary for hooks in the App Router

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser as createAuth0User, UserData } from '@/app/AuthService/auth-service';
import { getUserAccessToken, getManagementToken } from '@/app/AuthService/getUserAccessToken';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Get the management API token
      const token = await getManagementToken();

      console.log('this token new', token);

      const userData: UserData = {
        email,
        password,
        connection: 'Username-Password-Authentication',
        email_verified: false,
      };

      // Create the user in Auth0
      const auth0Response = await createAuth0User(userData, token);

      if (auth0Response.status === 201) {
        // Get access token for the created user
        const accessToken = await getUserAccessToken(email, password);

        // Save user data to backend
        const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name,
            email,
            sub: auth0Response.data.user_id,
            isAdmin: false,
          }),
        });

        if (backendResponse.ok) {
          router.push('/pages/signin');
        } else {
          setError('Failed to save user data in the backend.');
        }
      } else {
        setError('Failed to create user in Auth0.');
      }
    } catch (error: any) {
      setError('Failed to sign up. Please try again.');
      console.error('Sign up error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;

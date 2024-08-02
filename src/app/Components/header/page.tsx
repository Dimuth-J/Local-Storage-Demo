"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const email = localStorage.getItem('email');
        const token = JSON.parse(localStorage.getItem('authResult') || '{}').access_token;

        if (!email || !token) {
            router.push('/pages/signin');
            return;
        }

        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/by-email?email=${email}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            setUserName(response.data.name);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
    }, [router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/pages/signin');
    };

    return (
        <header className="bg-teal-950 text-white">
            <div className="container mx-auto flex justify-between items-center p-4">
                <div className="flex items-center space-x-4">
                    <Link href="/">
                        <h1 className="text-xl font-bold">AuthXpert</h1>
                    </Link>
                </div>
                <nav className="flex items-center space-x-10">
                    <Link href="/pages/getAllUsers">
                        <div className="hover:underline">Assign Role</div>
                    </Link>
                    <div className="relative group">
                        <div className="hover:underline">
                            Documentation
                        </div>
                        <div className="absolute right-0 p-2 mt-2 w-48 bg-white text-black border border-gray-100 rounded shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform translate-y-2 transition-all duration-300 ease-in-out">
                            <Link href="#">
                                <div className="block px-4 py-1 hover:bg-gray-100 text-center">Documentation</div>
                            </Link>
                            <Link href="#">
                                <div className="block px-4 py-2 hover:bg-gray-100">Authentication API</div>
                            </Link>
                            <Link href="#">
                                <div className="block px-4 py-2 hover:bg-gray-100">Management API</div>
                            </Link>
                        </div>
                    </div>
                </nav>
                <div className="flex items-center space-x-4">
                    <div className="relative w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="search for a keyword"
                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12.9 14.32a8 8 0 111.414-1.414l4.386 4.387a1 1 0 01-1.414 1.414l-4.387-4.386zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                    {userName && (
                        <div className="relative">
                            <div className="bg-gray-400 rounded-full flex items-center justify-center px-4 py-2 cursor-pointer group">
                                {userName[0].toUpperCase()}
                                <div className="absolute top-full mt-2 w-48 bg-white text-black border border-gray-100 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                    <div className="p-4">
                                        <div className="font-bold">{userName}</div>
                                        <div className="mt-2">
                                            <button
                                                className="bg-red-500 text-white px-4 py-2 rounded"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

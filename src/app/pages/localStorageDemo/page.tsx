"use client"
import { useState, useEffect } from 'react';

const Home = () => {
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem('data');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const saveToLocalStorage = () => {
    const dummyData = ["Cat", "Dog", "Lion"];
    localStorage.setItem('data', JSON.stringify(dummyData));
    setData(dummyData);
  };

  const removeFromLocalStorage = () => {
    localStorage.removeItem('data');
    setData([]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Local Storage Demo</h1>
      <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
        <button
          onClick={saveToLocalStorage}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save to Local Storage
        </button>
        <button
          onClick={removeFromLocalStorage}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Remove from Local Storage
        </button>
      </div>
      <div className="mt-4 w-full sm:w-auto flex justify-center">
        <div className="bg-white border-teal-900 border-4 rounded-lg shadow-md p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Preview:</h2>
          {data.length > 0 ? (
            <ul className="list-disc pl-5">
              {data.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

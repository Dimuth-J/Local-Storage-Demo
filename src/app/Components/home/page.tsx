import React from 'react';
import Header from '../header/page';

const Homepage: React.FC = () => {
  return (
    <div className="w-screen min-h-screen flex flex-col" style={{ backgroundImage: "url('/bg.jpg')" }}>
      <Header />
      <div className="flex flex-col md:flex-row items-center justify-center flex-1 text-center md:text-left space-y-8 md:space-y-0 md:space-x-8 p-6 bg-white bg-opacity-80 rounded-lg shadow-lg">
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-6xl font-bold text-center text-black mb-4">Implement a Sign-Up Flow with Role-Based Authorization</h1>
          <p className="text-black text-lg mb-8 text-justify">
            Your task is to create a sign-up flow in a Next.js application, integrated with Auth0 for authentication and role-based authorization. The application should manage user roles by updating the isAdmin field in the database based on permissions set in the Auth0 dashboard.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <video controls autoPlay muted className="rounded-lg shadow-lg max-w-full h-auto">
            <source src="/Next.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default Homepage;

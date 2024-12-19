'use client';
import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';

const page = () => {
  const [token, setToken] = useState<string>('');
  const [verified, setVerified] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const verifyToken = async () => {
    try {
      await axios.post('/api/verifyemail', { token });
      setVerified(true);
    } catch (error) {
      setError(true);
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
      } else if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log('An unknown error occurred');
      }
    }
  };
  useEffect(() => {
    const urlToken = window.location.search.split('=')[1];
    setToken(urlToken || '');
  }, []);

  useEffect(() => {
    if (token.length > 0) {
      verifyToken();
    }
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Verifying Your Email...</h1>
      <h2 className="font-bold">
        Your access token is: {token ? `${token}` : 'No token'}
      </h2>
      {verified && (
        <p className="text-green-300">Email verified successfully.</p>
      )}
      {error && <p className="text-red-400">Failed to verify email.</p>}
    </div>
  );
};

export default page;

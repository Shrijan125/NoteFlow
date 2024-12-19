import React from 'react';

interface AuthLayouProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayouProps> = ({ children }) => {
  return (
    <div
      className="
      h-screen
      p-6 flex 
      justify-center"
    >
      {children}
    </div>
  );
};

export default AuthLayout;

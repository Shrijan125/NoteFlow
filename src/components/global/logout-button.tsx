'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '../ui/button';
import { signOut } from 'next-auth/react';

interface LogoutButtonProps {
  children: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ children }) => {
  const { dispatch } = useAppState();
  const router = useRouter();
  const logout = async () => {
    await signOut();
    router.refresh();
    dispatch({ type: 'SET_WORKSPACES', payload: { workspaces: [] } });
  };
  return (
    <Button variant="ghost" size="icon" className="p-0" onClick={logout}>
      {children}
    </Button>
  );
};

export default LogoutButton;

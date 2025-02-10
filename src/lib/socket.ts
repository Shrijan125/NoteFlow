import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXTAUTH_URL_PUBLIC_URL || '';

let socketInstance: any = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      path: '/api/socket/io',
    });
  }
  return socketInstance;
};

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

let socket = null;
let socketToken = null;

const socketUrl = () => {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit) return explicit;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

export const getSocket = (token = localStorage.getItem('Rentify_token')) => {
  if (!socket || socketToken !== token) {
    if (socket) socket.disconnect();
    socketToken = token;
    socket = io(socketUrl(), {
      autoConnect: false,
      withCredentials: true,
      auth: { token },
    });
  }
  return socket;
};

export const useSocket = () => {
  const { user, token } = useAuthStore();
  const socketRef = useRef(getSocket(token));

  useEffect(() => {
    const nextSocket = getSocket(token);
    socketRef.current = nextSocket;
    if (user && token && !nextSocket.connected) {
      nextSocket.connect();
    }
    if (!user && nextSocket.connected) {
      nextSocket.disconnect();
    }
    return () => {};
  }, [user, token]);

  return socketRef.current;
};

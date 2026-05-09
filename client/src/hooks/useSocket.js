import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || '', {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};

export const useSocket = () => {
  const { user } = useAuthStore();
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const s = socketRef.current;
    if (user) {
      s.connect();
      s.emit('user_online', user._id);
    }
    return () => {
      if (!user) s.disconnect();
    };
  }, [user]);

  return socketRef.current;
};
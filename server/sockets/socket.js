import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { Conversation } from '../models/Chat.js';

const onlineUsers = new Map();

export const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name');
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.userName = user.name;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));

    socket.on('user_online', () => {
      onlineUsers.set(socket.userId, socket.id);
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });

    socket.on('join_conversation', async (conversationId, callback) => {
      const conversation = await Conversation.findById(conversationId).select('participants');
      const canJoin = conversation?.participants?.some((id) => id.toString() === socket.userId);
      if (!canJoin) {
        callback?.({ success: false, message: 'Not authorized for this conversation' });
        return;
      }

      socket.join(conversationId);
      callback?.({ success: true });
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('typing_start', ({ conversationId }) => {
      socket.to(conversationId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(conversationId).emit('user_stopped_typing', { userId: socket.userId });
    });

    socket.on('message_read', ({ conversationId }) => {
      socket.to(conversationId).emit('messages_read', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.userId);
      io.emit('online_users', Array.from(onlineUsers.keys()));
      io.emit('user_offline', socket.userId);
    });
  });
};

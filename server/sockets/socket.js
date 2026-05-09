const onlineUsers = new Map();

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User goes online
    socket.on('user_online', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId, userId, userName }) => {
      socket.to(conversationId).emit('user_typing', { userId, userName });
    });

    socket.on('typing_stop', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('user_stopped_typing', { userId });
    });

    // Message read receipts
    socket.on('message_read', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('messages_read', { userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online_users', Array.from(onlineUsers.keys()));
        io.emit('user_offline', socket.userId);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

export const getOnlineUsers = () => Array.from(onlineUsers.keys());
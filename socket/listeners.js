const io = require('../index');
const { getContactSocketsForUser } = require('../utils/utils');

// We can only emit to socket IDs, not user IDs. So we need a map from the user to their
// currently connected socket.
let onlineUsers = {};

const addSocketListeners = (io) => {
  io.on('connection', (socket) => {
    socket.on('user-online', async (userId) => {
      // 0. Store the userId as a property on the socket, so that it can be referenced
      // later when disconnecting.
      socket.userId = userId;

      // 1. Add the socket ID for this user to the global map
      if (onlineUsers[userId]) {
        onlineUsers[userId].push(socket.id);
        q;
      } else {
        onlineUsers[userId] = [socket.id];
      }

      // 2. Fetch the list of sockets for this user's online contacts.
      const socketIds = await getContactSocketsForUser(userId, onlineUsers);

      // 4. Emit the online status to the socket for each contact
      socket.to(socketIds).emit('user-online', userId);
    });

    function removeSocketFromUserMap(userId, socket, onlineUsers) {
      if (onlineUsers[userId]) {
        const index = onlineUsers[userId].indexOf(socket.id);
        if (index > -1) {
          onlineUsers[userId].splice(index, 1);
        }
        if (onlineUsers[userId].length === 0) {
          delete onlineUsers[userId];
        }
      }
      return onlineUsers;
    }

    socket.on('user-offline', async (userId) => {
      onlineUsers = removeSocketFromUserMap(userId, socket, onlineUsers);
      const socketIds = await getContactSocketsForUser(userId, onlineUsers);
      socket.to(socketIds).emit('user-offline', userId);
    });

    socket.on('send-message', async (chatId, senderId, message) => {
      socket.to(chatId).emit('send-message', {
        message,
        from: senderId,
      });
    });

    socket.on('join-chat', async (chatId, name) => {
      socket.join(chatId);
      // Note: only broadcasts to other users in the chat, not the sender.
      socket.to(chatId).emit('user-connected', name);
    });

    socket.on('leave-chat', async (chatId, name) => {
      socket.leave(chatId);
      // Note: only broadcasts to other users in the chat, not the sender.
      socket.to(chatId).emit('user-disconnected', name);
    });

    socket.on('disconnect', () => {
      onlineUsers = removeSocketFromUserMap(socket.userId, socket, onlineUsers);
      // const socketIds = await getContactSocketsForUser(socket.userId, onlineUsers);
      io.emit('user-offline', socket.userId);
    });
  });
};

exports.onlineUsers = onlineUsers;
exports.addSocketListeners = addSocketListeners;

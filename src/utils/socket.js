const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });
  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
    });
    socket.on(
      "sendMessage",
      async ({ userId, targetUserId, name, text, time }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);

          // storing the data into chat schema
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });
          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: { senderId: userId, text: text },
            });
          }
          chat.messages.push({ senderId: userId, text });
          await chat.save();
          io.to(roomId).emit("messageReceived", { name, text, time });
        } catch (err) {
          console.error(err.message);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("socket disconnected!");
    });
    socket.on("error", () => {
      console.log("error occured");
    });
  });
};
module.exports = initializeSocket;

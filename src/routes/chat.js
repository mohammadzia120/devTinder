const express = require("express");
const userAuth = require("../middlewares/authentication");
const Chat = require("../models/chat");
const router = express.Router();

router.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.params;
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }
    res.send({ chat, message: "chats fetched successfully" });
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = router;

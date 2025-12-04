const express = require("express");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const userAuth = require("../middlewares/authentication");
const router = express.Router();

router.post(
  "/connectionRequest/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const toUserId = req.params.toUserId;
      const fromUserId = req.user._id;
      const status = req.params.status;
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send("Invalid status type");
      }
      const user = await User.findOne({ _id: toUserId });
      if (!user) {
        return res.status(400).send("User does not exists!");
      }
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).send("Connection Already exists!");
      }
      const connectionRequest = new ConnectionRequest({
        toUserId,
        fromUserId,
        status,
      });
      await connectionRequest.save();
      res.send({
        message: "Invite sent successfully!",
        data: connectionRequest,
      });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
);

router.post(
  "/connectionRequest/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res
        .status(400)
        .send({ message: "Status is not allowed", data: loggedInUser });
    }
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });
    if (!connectionRequest) {
      return res.status(404).send("Connection request not exist!");
    }
    connectionRequest.status = status;
    const data = await connectionRequest.save();
    res.send({ message: "connection request " + status, data });
  }
);

module.exports = router;

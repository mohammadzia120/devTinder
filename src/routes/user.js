const express = require("express");
const userAuth = require("../middlewares/authentication");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const router = express.Router();

router.get("/users/request/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const recievedRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "age",
      "gender",
      "photoUrl",
      "skills",
      "about",
    ]); //populate will replace fromUserId to object in the sec argument
    res.send({
      message: "Recieved request fetched successfully!",
      requests: recievedRequests,
    });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate(
        "fromUserId",
        "firstName lastName gender age about skills photoUrl"
      )
      .populate(
        "toUserId",
        "firstName lastName gender age about skills photoUrl"
      );

    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        //have to convert it to string or use..isequals methodd
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.status(200).send({ message: "connectins fetched successfully", data });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.get("/user/feed", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 2;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");
    const hideUsersFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },

        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select("firstName lastName about age gender skills photoUrl")
      .skip(skip)
      .limit(limit);
    res.send(users);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;

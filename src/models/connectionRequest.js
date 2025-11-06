const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "accepted", "rejected", "interested"],
        message: `{VALUE} is a incorrect status type!`,
      },
    },
  },
  { timestamps: true }
);
connectionRequestSchema.index({ toUserId: 1, fromUserId: 1 });
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  if (connectionRequest.toUserId.equals(connectionRequest.fromUserId)) {
    throw new Error("Not allowed to send connection request to youself");
  }
  next();
});

const connectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);
module.exports = connectionRequest;
